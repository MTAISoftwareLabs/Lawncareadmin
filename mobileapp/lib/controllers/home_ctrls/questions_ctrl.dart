import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_detail_screen.dart';

class QuestionsCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();

  final TextEditingController headingController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final RxString selectedPriority = 'High'.obs;

  final List<String> priorities = ['Emergency', 'High', 'Medium', 'Low'];

  final Rx<File?> selectedImage = Rx<File?>(null);
  var isUploading = false.obs;
  var isSubmitting = false.obs;
  String? uploadedImageUrl;

  @override
  void onClose() {
    headingController.dispose();
    descriptionController.dispose();
    super.onClose();
  }

  void setPriority(String priority) {
    selectedPriority.value = priority;
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
    }
  }

  Future<void> _uploadSelectedImage() async {
    if (selectedImage.value == null) return;

    try {
      isUploading.value = true;
      uploadedImageUrl = null;
      print("API DEBUG: Starting question image upload: ${selectedImage.value!.path}");

      final uploadResponse = await _contentService.uploadMedia(selectedImage.value!);

      print("API DEBUG: Question Upload Status: ${uploadResponse.statusCode}");
      print("API DEBUG: Question Upload Body: ${uploadResponse.body}");

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
            print("API DEBUG: Question image uploaded: $uploadedImageUrl");
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

  Future<void> submitQuestion() async {
    final heading = headingController.text.trim();
    final description = descriptionController.text.trim();

    if (heading.isEmpty) {
      Get.snackbar("Error", "Please enter a heading");
      return;
    }
    if (description.isEmpty) {
      Get.snackbar("Error", "Please enter a description");
      return;
    }

    try {
      isSubmitting.value = true;

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

      final startResponse = await _contentService.startChat("1");

      if (startResponse.statusCode == 200 || startResponse.statusCode == 201) {
        final startBody = startResponse.body;
        String? conversationId;
        if (startBody is Map && startBody['data'] != null) {
          conversationId =
              (startBody['data']['conversationId'] ?? startBody['data']['id'])
                  ?.toString();
        }

        if (conversationId == null) {
          Get.snackbar("Error", "Could not start chat. Please try again.");
          return;
        }

        String contextMessage =
            "[Priority: ${selectedPriority.value}]\nHEADING: $heading\nDESCRIPTION: $description";

        if (uploadedImageUrl != null) {
          contextMessage += "\nATTACHMENT: $uploadedImageUrl";
        }

        final sendResponse = await _contentService.sendMessage(
          conversationId,
          contextMessage,
          imageUrl: uploadedImageUrl,
          type: uploadedImageUrl != null ? 'image' : 'text',
        );

        if (sendResponse.statusCode == 200 || sendResponse.statusCode == 201) {
          headingController.clear();
          descriptionController.clear();
          removeImage();

          Get.snackbar(
            "Success",
            "Redirecting to chat...",
            snackPosition: SnackPosition.TOP,
            backgroundColor: Colors.green,
            colorText: Colors.white,
          );

          Get.to(
            () => ChatDetailScreen(
              chatId: conversationId!,
              userName: "TurfguyRoss",
            ),
          );
        } else {
          Get.snackbar(
            "Error",
            "Failed to send message: ${sendResponse.statusCode}",
          );
        }
      } else {
        Get.snackbar(
          "Error",
          "Failed to initiate chat: ${startResponse.statusCode}",
        );
      }
    } catch (e) {
      print("API DEBUG: Question submission exception: $e");
      Get.snackbar("Error", "Something went wrong during submission");
    } finally {
      isSubmitting.value = false;
    }
  }
}
