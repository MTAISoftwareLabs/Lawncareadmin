import 'package:get/get.dart';
import 'package:lawn_care/models/chat_model.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_detail_screen.dart';

class ChatListCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();

  var chats = <Chat>[].obs;
  var isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchChats();
  }

  Future<void> fetchChats() async {
    try {
      isLoading.value = true;

      // Print your User ID for Postman testing reference
      final storage = Get.find<StorageService>();
      final userData = storage.getUser();
      print("---------------- YOUR PROFILE INFO ----------------");
      print("YOUR USER ID: ${userData?['id'] ?? 'Not Found'}");
      print("YOUR DATA: $userData");
      print("---------------------------------------------------");

      final response = await _contentService.getChats();
      if (response.statusCode == 200) {
        if (response.body is List) {
          final List list = response.body;
          chats.value = list.map((e) => Chat.fromJson(e)).toList();
        } else if (response.body is Map && response.body['data'] is List) {
          final List list = response.body['data'];
          chats.value = list.map((e) => Chat.fromJson(e)).toList();
        }

        // Print all IDs for the user to see in console
        print("---------------- CHAT LIST REFRESHED ----------------");
        for (var chat in chats) {
          print("CONVERSATION ID: ${chat.id} (With: ${chat.userName})");
        }
        print("-----------------------------------------------------");
      } else {
        // Handle error
        print("Error serving chats: ${response.statusCode}");
      }
    } catch (e) {
      print("Error fetching chats: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void openAdminChat() async {
    // 1. Check if we already have an admin chat in our list
    final existingAdminChat = chats.firstWhereOrNull(
      (c) => c.userName == "TurfguyRoss" || c.recipientId == "1",
    );

    if (existingAdminChat != null) {
      Get.to(
        () => ChatDetailScreen(
          chatId: existingAdminChat.id,
          userName: "TurfguyRoss",
        ),
      );
      return;
    }

    // 2. If not found, we need to "start" or "get" the chat ID from API
    try {
      isLoading.value = true;
      final response = await _contentService.startChat("1");
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = response.body;
        String? conversationId;
        if (body is Map && body['data'] != null) {
          conversationId =
              (body['data']['conversationId'] ?? body['data']['id'])
                  ?.toString();
        }

        if (conversationId != null) {
          Get.to(
            () => ChatDetailScreen(
              chatId: conversationId!,
              userName: "TurfguyRoss",
            ),
          );
        } else {
          Get.snackbar("Error", "Could not identify support chat");
        }
      } else {
        Get.snackbar(
          "Error",
          "Failed to connect to support: ${response.statusCode}",
        );
      }
    } catch (e) {
      Get.snackbar("Error", "Something went wrong: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void openChat(Chat chat) {
    Get.to(() => ChatDetailScreen(chatId: chat.id, userName: chat.userName));
  }

  void startNewChat() {
    // Just opens admin chat as primary support
    openAdminChat();
  }
}
