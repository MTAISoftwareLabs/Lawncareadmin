import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lawn_care/models/chat_model.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/services/storage_service.dart';

class ChatDetailCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();

  final String chatId;

  ChatDetailCtrl(this.chatId);

  var messages = <Message>[].obs;
  var isLoading = false.obs;
  var isSending = false.obs;
  var isUploading = false.obs;
  String? uploadedImageUrl;

  final TextEditingController messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();
  Rx<File?> selectedImage = Rx<File?>(null);

  @override
  void onInit() {
    super.onInit();
    fetchMessages();
  }

  @override
  void onClose() {
    messageController.dispose();
    scrollController.dispose();
    super.onClose();
  }

  Future<void> fetchMessages() async {
    try {
      isLoading.value = true;
      final response = await _contentService.getChatMessages(chatId);
      print("---------------- API DEBUG START ----------------");
      print("CHAT ID: $chatId");
      print("STATUS CODE: ${response.statusCode}");
      print("RESPONSE BODY TYPE: ${response.body.runtimeType}");
      print("FULL RESPONSE BODY: ${response.body}");

      if (response.body is Map) {
        print("RESPONSE MAP KEYS: ${(response.body as Map).keys.toList()}");
      }
      print("---------------- API DEBUG END ----------------");

      if (response.statusCode == 200 && response.body != null) {
        print("API DEBUG: Response Body Type: ${response.body.runtimeType}");

        final storage = Get.find<StorageService>();
        final userData = storage.getUser();
        final currentUserId =
            (userData?['id'] ??
                    userData?['user_id'] ??
                    userData?['userid'] ??
                    userData?['pk'] ??
                    '0')
                .toString();
        print("API DEBUG: Current User ID: $currentUserId from UserData: $userData");

        List list = [];
        if (response.body is List) {
          list = response.body;
        } else if (response.body is Map) {
          final body = response.body as Map;
          print("API DEBUG: Response Map Keys: ${body.keys}");

          if (body['data'] != null) {
            if (body['data'] is List) {
              list = body['data'];
            } else if (body['data'] is Map) {
              if (body['data']['messages'] is List) {
                list = body['data']['messages'];
              } else if (body['data']['data'] is List) {
                list = body['data']['data'];
              } else {
                body['data'].forEach((key, value) {
                  if (value is List) list = value;
                });
              }
            }
          } else {
            body.forEach((key, value) {
              if (value is List && list.isEmpty) list = value;
            });
          }
        }

        if (list.isNotEmpty) {
          print("API DEBUG: Found ${list.length} raw message items");
          messages.value = list.map((e) {
            print("API DEBUG: Raw Message Item: $e");
            final msg = Message.fromJson(e, currentUserId: currentUserId);
            print(
              "API DEBUG: MsgID: ${msg.id}, SenderID: ${msg.senderId}, CurrentUserID: $currentUserId, isMe: ${msg.isMe}",
            );
            return msg;
          }).toList();

          print("API DEBUG: Successfully parsed ${messages.length} messages");
          scrollToBottom();
        } else {
          print("API DEBUG: Warning - No message list found in response structure");
          messages.clear();
        }
      } else {
        print("API DEBUG: Error Response: ${response.body}");
      }
    } catch (e, stack) {
      print("API DEBUG: Exception in fetchMessages: $e");
      print(stack);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (image != null) {
      selectedImage.value = File(image.path);
      await _uploadSelectedImage();
      if (uploadedImageUrl != null) {
        await sendMessage();
      }
    }
  }

  Future<void> takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (image != null) {
      selectedImage.value = File(image.path);
      await _uploadSelectedImage();
      if (uploadedImageUrl != null) {
        await sendMessage();
      }
    }
  }

  Future<void> _uploadSelectedImage() async {
    if (selectedImage.value == null) return;

    try {
      isUploading.value = true;
      uploadedImageUrl = null;
      print("API DEBUG: Starting chat image upload: ${selectedImage.value!.path}");

      final uploadResponse = await _contentService.uploadMedia(selectedImage.value!);

      print("API DEBUG: Chat Upload Status: ${uploadResponse.statusCode}");
      print("API DEBUG: Chat Upload Body: ${uploadResponse.body}");

      if (uploadResponse.isOk && uploadResponse.body != null) {
        final body = uploadResponse.body;
        if (body is Map) {
          String? url;
          if (body['data'] is Map && body['data']['url'] != null) {
            url = body['data']['url'].toString();
          } else if (body['url'] != null) {
            url = body['url'].toString();
          } else if (body['data'] is String) {
            url = body['data'].toString();
          }

          if (url != null && url.isNotEmpty) {
            uploadedImageUrl = url;
            print("API DEBUG: Chat image uploaded: $uploadedImageUrl");
          } else {
            Get.snackbar("Error", body['message']?.toString() ?? "Upload failed");
          }
        }
      } else {
        Get.snackbar(
          "Error",
          "Failed to upload image. Status: ${uploadResponse.statusCode}",
        );
      }
    } catch (e) {
      Get.snackbar("Error", "Image upload error: $e");
    } finally {
      isUploading.value = false;
    }
  }

  void removeImage() {
    selectedImage.value = null;
    uploadedImageUrl = null;
    isUploading.value = false;
  }

  Future<void> sendMessage() async {
    final content = messageController.text.trim();
    if (content.isEmpty && selectedImage.value == null) return;

    try {
      isSending.value = true;

      if (selectedImage.value != null && uploadedImageUrl == null) {
        if (isUploading.value) {
          Get.snackbar("Info", "Waiting for image upload...");
          while (isUploading.value) {
            await Future.delayed(const Duration(milliseconds: 500));
          }
        }

        if (uploadedImageUrl == null) {
          Get.snackbar(
            "Error",
            "Image upload failed. Please try again or remove it.",
          );
          return;
        }
      }

      final response = await _contentService.sendMessage(
        chatId,
        uploadedImageUrl ?? content,
        imageUrl: uploadedImageUrl,
        type: uploadedImageUrl != null ? 'image' : 'text',
      );

      print("API DEBUG: Send Message Response Status: ${response.statusCode}");
      print("API DEBUG: Send Message Response Body: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        messageController.clear();
        selectedImage.value = null;
        uploadedImageUrl = null;
        fetchMessages();
      } else {
        Get.snackbar("Error", "Failed to send message: ${response.statusCode}");
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to send message: $e");
    } finally {
      isSending.value = false;
    }
  }

  void scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
