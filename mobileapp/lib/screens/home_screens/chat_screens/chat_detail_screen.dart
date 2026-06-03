import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/chat_detail_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/widgets/full_screen_image.dart';

class ChatDetailScreen extends StatelessWidget {
  final String chatId;
  final String userName;

  const ChatDetailScreen({
    super.key,
    required this.chatId,
    required this.userName,
  });

  @override
  Widget build(BuildContext context) {
    print("Chat ID: $chatId");
    final ChatDetailCtrl controller = Get.put(
      ChatDetailCtrl(chatId),
      tag: chatId,
    );

    return Scaffold(
      backgroundColor: AppColor().primaryBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColor().primaryText),
          onPressed: () => Get.back(),
        ),
        title: Text(
          userName == "User" || userName.isEmpty ? "TurfguyRoss" : userName,
          style: TextStyle(
            color: AppColor().primaryText,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value && controller.messages.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }

              if (controller.messages.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.message_outlined,
                        size: 48,
                        color: Colors.white24,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "No messages yet.\nStart the conversation!",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white54),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                controller: controller.scrollController,
                reverse: false, // Latest msgs down, upright
                // Typically messages API returns newest first or oldest first. Assuming we sort or list order.
                // Let's assume list is newest first for now? Or we should check API. Usually chat needs newest at bottom.
                // If list is Page 1 (newest), we should reverse it for ListView(reverse: true).
                padding: const EdgeInsets.all(15),
                itemCount: controller.messages.length,
                itemBuilder: (context, index) {
                  final message = controller.messages[index];
                  final isMe = message.isMe;

                  // DEBUG: Check why a message is on which side
                  print(
                    "DEBUG ALIGNMENT: Msg: ${message.content.length > 15 ? message.content.substring(0, 15) : message.content}, isMe: $isMe, SenderID: ${message.senderId}",
                  );

                  return Align(
                    alignment: isMe
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Column(
                      crossAxisAlignment: isMe
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(bottom: 4),
                          constraints: BoxConstraints(
                            maxWidth: Get.width * 0.78,
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: isMe
                                ? const Color(0xFFDCF8C6).withOpacity(
                                    AppColor().isDark ? 0.3 : 1.0,
                                  ) // WhatsApp Green for Me (Right)
                                : (AppColor().isDark
                                      ? Colors.grey[850]
                                      : Colors
                                            .white), // White for TurfguyRoss (Left)
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(20),
                              topRight: const Radius.circular(20),
                              bottomLeft: isMe
                                  ? const Radius.circular(20)
                                  : Radius.zero,
                              bottomRight: isMe
                                  ? Radius.zero
                                  : const Radius.circular(20),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (message.fileUrl != null &&
                                  message.fileUrl!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: GestureDetector(
                                    onTap: () => Get.to(
                                      () => FullScreenImage(
                                        imageUrl: message.fileUrl!,
                                      ),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        ApiEndpoints.formatImageUrl(
                                          message.fileUrl,
                                        ),
                                        height: 180,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                        loadingBuilder:
                                            (context, child, loadingProgress) {
                                              if (loadingProgress == null)
                                                return child;
                                              return Container(
                                                height: 180,
                                                width: double.infinity,
                                                color: Colors.black12,
                                                child: const Center(
                                                  child:
                                                      CircularProgressIndicator(
                                                        strokeWidth: 2,
                                                      ),
                                                ),
                                              );
                                            },
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                                  height: 100,
                                                  width: double.infinity,
                                                  color: Colors.black12,
                                                  child: const Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.center,
                                                    children: [
                                                      Icon(
                                                        Icons.broken_image,
                                                        color: Colors.white24,
                                                        size: 32,
                                                      ),
                                                      SizedBox(height: 4),
                                                      Text(
                                                        "Image failed to load",
                                                        style: TextStyle(
                                                          color: Colors.white24,
                                                          fontSize: 10,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                      ),
                                    ),
                                  ),
                                ),
                              if (message.content.isNotEmpty &&
                                  message.content != message.fileUrl)
                                Text(
                                  message.content,
                                  style: TextStyle(
                                    color: (AppColor().isDark
                                        ? Colors.white
                                        : Colors.black87),
                                    fontSize: 16,
                                    height: 1.3,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        // Metadata (Name and Time) below the bubble
                        Padding(
                          padding: const EdgeInsets.only(
                            bottom: 12,
                            left: 4,
                            right: 4,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "${message.senderName} • ${message.createdAt.hour.toString().padLeft(2, '0')}:${message.createdAt.minute.toString().padLeft(2, '0')}",
                                style: TextStyle(
                                  color: Colors.white60,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              if (message.isMe) ...[
                                const SizedBox(width: 4),
                                Icon(
                                  message.isRead ? Icons.done_all : Icons.done,
                                  size: 14,
                                  color: message.isRead
                                      ? Colors.blue
                                      : Colors.grey,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            }),
          ),

          // Image Preview
          Obx(() {
            if (controller.selectedImage.value != null) {
              return Container(
                padding: const EdgeInsets.all(10),
                color: Colors.grey[100],
                child: Row(
                  children: [
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            controller.selectedImage.value!,
                            height: 60,
                            width: 60,
                            fit: BoxFit.cover,
                          ),
                        ),
                        if (controller.isUploading.value)
                          Container(
                            height: 60,
                            width: 60,
                            decoration: BoxDecoration(
                              color: Colors.black38,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Center(
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        controller.isUploading.value
                            ? "Uploading image..."
                            : "Image ready",
                        style: TextStyle(
                          color: controller.isUploading.value
                              ? Colors.orange
                              : Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: controller.removeImage,
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }),

          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(color: Colors.transparent),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColor().isDark
                            ? Colors.grey[850]
                            : Colors.white,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: Icon(
                              Icons.sentiment_very_satisfied,
                              color: Colors.grey,
                            ),
                            onPressed: () {},
                          ),
                          Expanded(
                            child: TextField(
                              controller: controller.messageController,
                              style: TextStyle(
                                color: AppColor().isDark
                                    ? Colors.white
                                    : Colors.black87,
                              ),
                              decoration: const InputDecoration(
                                hintText: "Message",
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(
                                  vertical: 10,
                                ),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.attach_file, color: Colors.grey),
                            onPressed: controller.pickImage,
                          ),
                          IconButton(
                            icon: Icon(Icons.camera_alt, color: Colors.grey),
                            onPressed: controller.takePhoto,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Obx(
                    () => CircleAvatar(
                      backgroundColor: const Color(
                        0xFF00A884,
                      ), // WhatsApp Green
                      radius: 24,
                      child: IconButton(
                        icon: controller.isSending.value
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(
                                Icons.send,
                                color: Colors.white,
                                size: 24,
                              ),
                        onPressed: controller.isSending.value
                            ? null
                            : controller.sendMessage,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
