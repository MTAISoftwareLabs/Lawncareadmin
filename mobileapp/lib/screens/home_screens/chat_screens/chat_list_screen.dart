import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/chat_list_ctrl.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_detail_screen.dart';
import 'package:lawn_care/utils/appcolor.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ChatListCtrl controller = Get.put(ChatListCtrl());

    return Scaffold(
      backgroundColor: AppColor().secondaryBackground,
      appBar: AppBar(
        title: Text(
          'Chats with TurfguyRoss',
          style: TextStyle(
            fontSize: 20,
            color: AppColor().secondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.search, color: AppColor().secondary),
            onPressed: () {},
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        // Separate Admin chat from others
        final adminChat = controller.chats.firstWhereOrNull(
          (c) => c.userName == "TurfguyRoss" || c.recipientId == "1",
        );
        final otherChats = controller.chats
            .where((c) => c.userName != "TurfguyRoss" && c.recipientId != "1")
            .toList();

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 0),
          itemCount:
              otherChats.length +
              3, // +3 for SUPPORT header, ADMIN item, and RECENT header
          itemBuilder: (context, index) {
            if (index == 0) {
              return Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Text(
                  'SUPPORT',
                  style: TextStyle(
                    color: AppColor().secondary.withOpacity(0.7),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              );
            }

            if (index == 1) {
              // ALWAYS show Admin chat here
              final chat = adminChat;
              const isAdmin = true;

              return Column(
                children: [
                  ListTile(
                    leading: Stack(
                      children: [
                        CircleAvatar(
                          radius: 25,
                          backgroundColor: AppColor().secondary.withOpacity(
                            0.2,
                          ),
                          backgroundImage:
                              chat?.userImage != null &&
                                  chat!.userImage!.startsWith('http')
                              ? NetworkImage(chat.userImage!)
                              : null,
                          child:
                              chat?.userImage == null ||
                                  !chat!.userImage!.startsWith('http')
                              ? Icon(
                                  Icons.support_agent,
                                  size: 28,
                                  color: AppColor().secondary,
                                )
                              : null,
                        ),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: AppColor().primary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColor().secondaryBackground,
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              Icons.verified,
                              size: 10,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    title: Text(
                      "TurfguyRoss",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColor().secondary,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        chat?.lastMessage ??
                            'Start a conversation with Support',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: (chat?.unreadCount ?? 0) > 0
                              ? Colors.white
                              : Colors.grey[500],
                          fontSize: 14,
                          fontWeight: (chat?.unreadCount ?? 0) > 0
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (chat != null)
                          Text(
                            _formatTime(chat.updatedAt),
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 11,
                            ),
                          ),
                        const SizedBox(height: 6),
                        if ((chat?.unreadCount ?? 0) > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColor().primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${chat!.unreadCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        else
                          Icon(
                            Icons.push_pin,
                            size: 14,
                            color: AppColor().secondary.withOpacity(0.5),
                          ),
                      ],
                    ),
                    onTap: () => controller.openAdminChat(),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 80),
                    child: Divider(
                      color: Colors.white.withOpacity(0.05),
                      height: 1,
                    ),
                  ),
                ],
              );
            }

            if (index == 2) {
              if (otherChats.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Text(
                  'RECENT CONVERSATIONS',
                  style: TextStyle(
                    color: Colors.white24,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              );
            }

            // Calculate actual chat index for otherChats
            final chat = otherChats[index - 3];
            const isAdmin = false;

            return Column(
              children: [
                ListTile(
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        radius: 25,
                        backgroundColor: isAdmin
                            ? AppColor().secondary.withOpacity(0.2)
                            : Colors.grey[850],
                        backgroundImage:
                            chat.userImage != null &&
                                chat.userImage!.startsWith('http')
                            ? NetworkImage(chat.userImage!)
                            : null,
                        child:
                            chat.userImage == null ||
                                !chat.userImage!.startsWith('http')
                            ? Icon(
                                isAdmin ? Icons.support_agent : Icons.person,
                                size: 28,
                                color: isAdmin
                                    ? AppColor().secondary
                                    : Colors.grey[600],
                              )
                            : null,
                      ),
                      if (isAdmin)
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: AppColor().primary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColor().secondaryBackground,
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              Icons.verified,
                              size: 10,
                              color: Colors.white,
                            ),
                          ),
                        ),
                    ],
                  ),
                  title: Text(
                    chat.userName,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isAdmin ? AppColor().secondary : Colors.white,
                    ),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      chat.lastMessage ?? 'No messages yet',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: chat.unreadCount > 0
                            ? Colors.white
                            : Colors.grey[500],
                        fontSize: 14,
                        fontWeight: chat.unreadCount > 0
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _formatTime(chat.updatedAt),
                        style: TextStyle(color: Colors.grey[600], fontSize: 11),
                      ),
                      const SizedBox(height: 6),
                      if (chat.unreadCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColor().primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${chat.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )
                      else if (isAdmin)
                        Icon(
                          Icons.push_pin,
                          size: 14,
                          color: AppColor().secondary.withOpacity(0.5),
                        ),
                    ],
                  ),
                  onTap: () => Get.to(
                    () => ChatDetailScreen(
                      chatId: chat.id,
                      userName: chat.userName,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 80),
                  child: Divider(
                    color: Colors.white.withOpacity(0.05),
                    height: 1,
                  ),
                ),
              ],
            );
          },
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.startNewChat,
        backgroundColor: AppColor().primary,
        child: const Icon(Icons.edit, color: Colors.white),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    if (time.day == now.day &&
        time.month == now.month &&
        time.year == now.year) {
      return "${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}";
    }
    return "${time.month}/${time.day}";
  }
}
