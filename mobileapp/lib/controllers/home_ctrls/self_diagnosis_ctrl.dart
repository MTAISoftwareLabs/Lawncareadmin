import 'package:get/get.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:flutter/material.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_detail_screen.dart';

class SelfDiagnosisCtrl extends GetxController {
  final SelfDiagnosisItem item;

  SelfDiagnosisCtrl({required this.item});

  // Track selected answers: QuestionID -> Selected Answer
  var selectedAnswers = <String, Answer>{}.obs;
  var visibleQuestions = <Question>[].obs;
  var finalizedDiagnosis = Rxn<Diagnosis>();

  @override
  void onInit() {
    super.onInit();
    if (item.questions.isNotEmpty) {
      visibleQuestions.add(item.questions.first);
    }
  }

  void onAnswerSelected(Question q, Answer ans) {
    selectedAnswers[q.id] = ans;

    // Remove any questions that came AFTER this one, because path might change
    int qIndex = visibleQuestions.indexOf(q);
    if (qIndex != -1 && qIndex < visibleQuestions.length - 1) {
      visibleQuestions.removeRange(qIndex + 1, visibleQuestions.length);
    }

    // Reset diagnosis when answer changes
    finalizedDiagnosis.value = null;

    if (ans.diagnosis != null) {
      finalizedDiagnosis.value = ans.diagnosis;
    } else if (ans.nextQuestionId != null) {
      // Find the next question by ID
      try {
        var nextQ = item.questions.firstWhere(
          (e) => e.id == ans.nextQuestionId,
        );
        visibleQuestions.add(nextQ);
      } catch (e) {
        print("Error: Next question ${ans.nextQuestionId} not found");
      }
    }
  }

  void goBack() {
    if (finalizedDiagnosis.value != null) {
      finalizedDiagnosis.value = null;
    } else if (visibleQuestions.length > 1) {
      visibleQuestions.removeLast();
    }
  }

  void reset() {
    selectedAnswers.clear();
    visibleQuestions.clear();
    finalizedDiagnosis.value = null;
    if (item.questions.isNotEmpty) {
      visibleQuestions.add(item.questions.first);
    }
  }

  bool isQuestionAnswered(String questionId) =>
      selectedAnswers.containsKey(questionId);

  Answer? getSelectedAnswer(String questionId) => selectedAnswers[questionId];

  Future<void> contactSupport() async {
    if (finalizedDiagnosis.value == null) return;

    try {
      final ContentService contentService = Get.find<ContentService>();

      // 1. Start Chat with Admin (Option 2 - Regular Chat Endpoint)
      final startResponse = await contentService.startChat("1");

      if (startResponse.statusCode == 200 || startResponse.statusCode == 201) {
        final startBody = startResponse.body;
        String? conversationId;
        if (startBody is Map && startBody['data'] != null) {
          // Check both keys
          conversationId =
              (startBody['data']['conversationId'] ?? startBody['data']['id'])
                  ?.toString();
        }

        if (conversationId == null) {
          Get.snackbar("Error", "Could not start chat. Please try again.");
          return;
        }

        // 2. Format Context Message
        String contextMessage =
            "I need help with my lawn diagnosis: ${finalizedDiagnosis.value!.title}\n"
            "Solution provided: ${finalizedDiagnosis.value!.solution}";

        // 3. Send Message
        final sendResponse = await contentService.sendMessage(
          conversationId,
          contextMessage,
          type: 'text',
        );

        if (sendResponse.statusCode == 200 || sendResponse.statusCode == 201) {
          Get.snackbar(
            "Success",
            "Redirecting to chat...",
            snackPosition: SnackPosition.TOP,
            backgroundColor: Colors.green,
            colorText: Colors.white,
          );

          // 4. Navigate to Chat Detail
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
      print("API DEBUG: Contact support exception: $e");
      Get.snackbar("Error", "Something went wrong while initiating chat");
    }
  }
}
