import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/forum_model.dart';
import 'package:lawn_care/services/ai_service.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';

class PostDetailCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();
  final TextEditingController commentController = TextEditingController();
  final ForumPost post;

  var comments = <ForumComment>[].obs;
  var isLoading = false.obs;
  var isPosting = false.obs;
  var isRefining = false.obs;

  PostDetailCtrl(this.post);

  @override
  void onInit() {
    super.onInit();
    fetchComments();
  }

  Future<void> refineCommentText() async {
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

  Future<void> fetchComments() async {
    try {
      isLoading.value = true;
      final response = await _contentService.getPostComments(post.postId);
      print("FETCH COMMENTS RESPONSE: ${response.body}");
      if (response.statusCode == 200) {
        final List<dynamic> data = response.body['data'] ?? [];
        comments.value = data
            .map((json) => ForumComment.fromJson(json))
            .toList();
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to load comments");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> addComment() async {
    if (commentController.text.isEmpty) {
      Get.snackbar("Error", "Please enter a comment");
      return;
    }

    try {
      isPosting.value = true;

      final String currentUserName = Get.isRegistered<ProfileCtrl>()
          ? Get.find<ProfileCtrl>().userName.value
          : "User";

      final response = await _contentService.addComment(
        post.postId,
        commentController.text,
        null,
        currentUserName,
      );
      print("ADD COMMENT RESPONSE: ${response.body}");
      if (response.statusCode == 200) {
        commentController.clear();
        fetchComments();
        Get.snackbar("Success", "Comment posted!");
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to post comment");
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
