import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/ai_chat_model.dart';
import 'package:lawn_care/services/ai_service.dart';

class AiChatCtrl extends GetxController {
  final AiService _aiService = Get.put(AiService());
  final TextEditingController messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();

  var messages = <ChatMessage>[].obs;
  var isLoading = false.obs;

  void sendMessage() async {
    final text = messageController.text.trim();
    if (text.isEmpty) return;

    messageController.clear();
    messages.add(
      ChatMessage(content: text, isUser: true, timestamp: DateTime.now()),
    );
    _scrollToBottom();

    try {
      isLoading.value = true;
      final response = await _aiService.sendPrompt(text);
      if (response.statusCode == 200) {
        final content = _aiService.extractContent(response.body);
        if (content != null && content.isNotEmpty) {
          messages.add(
            ChatMessage(
              content: content,
              isUser: false,
              timestamp: DateTime.now(),
            ),
          );
        } else {
          Get.snackbar("Error", "Failed to get AI response");
        }
      } else {
        final error = response.body is Map
            ? (response.body['error'] ?? response.body['message'] ?? 'Unknown error')
            : 'Unknown error';
        Get.snackbar(
          "Error",
          "Failed to get AI response: ${response.statusCode} ($error)",
        );
      }
    } catch (e) {
      Get.snackbar("Error", "AI connection error: $e");
    } finally {
      isLoading.value = false;
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      "Success",
      "Response copied to clipboard",
      snackPosition: SnackPosition.TOP,
      backgroundColor: Colors.black54,
      colorText: Colors.white,
    );
  }

  @override
  void onClose() {
    messageController.dispose();
    scrollController.dispose();
    super.onClose();
  }
}
