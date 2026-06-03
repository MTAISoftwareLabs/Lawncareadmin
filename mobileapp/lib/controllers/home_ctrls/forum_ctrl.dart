import 'dart:io';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/forum_model.dart';
import 'package:lawn_care/services/ai_service.dart';
import 'package:lawn_care/services/content_service.dart';

class ForumCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();
  final TextEditingController commentController = TextEditingController();

  var posts = <ForumPost>[].obs;
  var isLoading = false.obs;
  var isPosting = false.obs;
  var isRefining = false.obs;
  Rx<File?> selectedImage = Rx<File?>(null);
  var isUploading = false.obs;
  Rxn<String> uploadedImageUrl = Rxn<String>();

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
      uploadedImageUrl.value = null;
      print("API DEBUG: Starting upload for ${selectedImage.value!.path}");

      final uploadResponse = await _contentService.uploadMedia(
        selectedImage.value!,
      );

      print("API DEBUG: Upload Response Status: ${uploadResponse.statusCode}");
      print("API DEBUG: Upload Response Body: ${uploadResponse.body}");

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
            uploadedImageUrl.value = url;
            print("API DEBUG: Successfully captured URL: $url");
          } else {
            print("API DEBUG: Upload response missing URL: $body");
            Get.snackbar("Error", body['message']?.toString() ?? "Upload failed");
          }
        }
      } else {
        print("API DEBUG: Upload failed with status ${uploadResponse.statusCode}");
        Get.snackbar(
          "Error",
          "Failed to upload image. Status: ${uploadResponse.statusCode}",
        );
      }
    } catch (e) {
      print("API DEBUG: Upload exception: $e");
      Get.snackbar("Error", "Image upload error: $e");
    } finally {
      isUploading.value = false;
    }
  }

  void removeImage() {
    selectedImage.value = null;
    uploadedImageUrl.value = null;
    isUploading.value = false;
  }

  @override
  void onInit() {
    super.onInit();
    fetchPosts();
  }

  Future<void> stopRefining() async {
    isRefining.value = false;
  }

  Future<void> refinePostText() async {
    if (commentController.text.isEmpty) {
      Get.snackbar("Info", "Please enter some text to refine");
      return;
    }

    try {
      isRefining.value = true;
      final aiService = Get.find<AiService>();
      final response = await aiService.refineText(commentController.text);

      if (response.statusCode == 200) {
        final refinedText = response.body['choices'][0]['message']['content'];
        if (refinedText != null && refinedText.isNotEmpty) {
          commentController.text = refinedText.trim();
          Get.snackbar("Success", "Text refined successfully!");
        }
      } else {
        Get.snackbar("Error", "Failed to refine text: ${response.statusText}");
      }
    } catch (e) {
      print("Error refining text: $e");
      Get.snackbar("Error", "An error occurred during refinement");
    } finally {
      isRefining.value = false;
    }
  }

  Future<void> fetchPosts() async {
    try {
      isLoading.value = true;
      final response = await _contentService.getForumPosts();
      print("API DEBUG: Fetch Posts Status: ${response.statusCode}");
      print("API DEBUG: Fetch Posts Body: ${response.body}");

      if (response.statusCode == 200 && response.body != null) {
        final List<dynamic> data = response.body['data'] ?? [];
        posts.value = data.map((json) => ForumPost.fromJson(json)).toList();
        print("API DEBUG: Parsed ${posts.length} posts");
      }
    } catch (e) {
      print("API DEBUG: Fetch Posts Exception: $e");
      Get.snackbar("Error", "Failed to load posts");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleLike(String postId) async {
    try {
      final response = await _contentService.toggleLikePost(postId);
      if (response.statusCode == 200) {
        final index = posts.indexWhere((p) => p.postId == postId);
        if (index != -1) {
          final updatedPost = ForumPost(
            postId: posts[index].postId,
            author: posts[index].author,
            content: posts[index].content,
            imageUrls: posts[index].imageUrls,
            likesCount:
                response.body['likes_count'] ??
                response.body['total_likes'] ??
                response.body['likesCount'] ??
                response.body['likes'] ??
                posts[index].likesCount,
            commentsCount:
                response.body['comments_count'] ??
                response.body['total_comments'] ??
                posts[index].commentsCount,
            isLikedByMe:
                response.body['is_liked_by_me'] ??
                response.body['is_liked'] ??
                response.body['liked'] ??
                false,
            createdAt: posts[index].createdAt,
          );
          posts[index] = updatedPost;
        }
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to update like");
    }
  }

  Future<void> startThread() async {
    if (commentController.text.isEmpty) {
      Get.snackbar("Error", "Please enter some content");
      return;
    }

    try {
      isPosting.value = true;

      if (selectedImage.value != null && uploadedImageUrl.value == null) {
        if (isUploading.value) {
          Get.snackbar("Info", "Waiting for image upload to complete...");
          while (isUploading.value) {
            await Future.delayed(const Duration(milliseconds: 500));
          }
        }

        if (uploadedImageUrl.value == null) {
          Get.snackbar(
            "Error",
            "Image upload failed. Please try again or remove the image.",
          );
          return;
        }
      }

      final imageArray = uploadedImageUrl.value != null
          ? [uploadedImageUrl.value!]
          : [];
      print("API DEBUG: Starting Thread with Content: ${commentController.text}");
      print("API DEBUG: Image Array being sent: $imageArray");

      final String currentUserName = Get.isRegistered<ProfileCtrl>()
          ? Get.find<ProfileCtrl>().userName.value
          : "User";

      final response = await _contentService.createForumPost(
        commentController.text,
        imageArray,
        currentUserName,
      );

      print("API DEBUG: Create Post Response Status: ${response.statusCode}");
      print("API DEBUG: Create Post Response Body: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        commentController.clear();
        selectedImage.value = null;
        uploadedImageUrl.value = null;
        fetchPosts();
        Get.snackbar("Success", "Thread posted successfully!");
      } else {
        Get.snackbar("Error", "Failed to post thread: ${response.statusCode}");
      }
    } catch (e) {
      print("API DEBUG: Start thread exception: $e");
      Get.snackbar("Error", "${e.toString()}");
    } finally {
      isPosting.value = false;
    }
  }

  @override
  void onClose() {
    commentController.dispose();
    super.onClose();
  }
}
