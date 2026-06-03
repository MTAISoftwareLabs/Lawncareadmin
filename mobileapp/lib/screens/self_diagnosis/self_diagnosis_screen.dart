import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/controllers/home_ctrls/self_diagnosis_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

import 'package:url_launcher/url_launcher.dart';

class SelfDiagnosisScreen extends GetView<HomeCtrl> {
  const SelfDiagnosisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().primary, AppColor().accent4],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    CostomeBackBotton(onPressed: () => Get.back()),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Self-Diagnose Your Lawn',
                            style: TextStyle(
                              color: AppColor().primaryText,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Follow the Yes/No path to identify the cause and solution.',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 12,
                              // decoration: TextDecoration.underline,r
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // Content
              Expanded(
                child: Obx(() {
                  final items =
                      controller.homeData.value?.data.selfDiagnosis ?? [];

                  if (items.isEmpty) {
                    return const Center(
                      child: Text(
                        "No diagnosis checklists available",
                        style: TextStyle(color: Colors.white),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      return DiagnosisCard(item: items[index]);
                    },
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DiagnosisCard extends StatelessWidget {
  final SelfDiagnosisItem item;
  const DiagnosisCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SelfDiagnosisCtrl>(
      init: SelfDiagnosisCtrl(item: item),
      tag: item.id,
      builder: (ctrl) {
        return Obx(() {
          // If diagnosis is finalized, show result
          if (ctrl.finalizedDiagnosis.value != null) {
            return DiagnosisResult(
              diagnosis: ctrl.finalizedDiagnosis.value!,
              onReset: ctrl.reset,
              tag: item.id,
            );
          }

          // Otherwise show the current visible question
          if (ctrl.visibleQuestions.isEmpty) {
            return const SizedBox(); // Should not happen if initialized correctly
          }

          var currentQ = ctrl.visibleQuestions.last;
          int index = ctrl.visibleQuestions.length - 1;

          return QuestionSection(
            ctrl: ctrl,
            question: currentQ,
            index: index,
            isLast: true, // Always "last" visually in wizard mode
          );
        });
      },
    );
  }
}

class QuestionSection extends StatelessWidget {
  final SelfDiagnosisCtrl ctrl;
  final Question question;
  final int index;
  final bool isLast;

  const QuestionSection({
    super.key,
    required this.ctrl,
    required this.question,
    required this.index,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColor().alternate,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(25.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row with Title and optional Back button
            Row(
              children: [
                if (ctrl.visibleQuestions.length > 1)
                  Padding(
                    padding: const EdgeInsets.only(right: 10.0),
                    child: IconButton(
                      icon: Icon(
                        Icons.arrow_back_ios,
                        size: 20,
                        color: AppColor().primaryText,
                      ),
                      onPressed: ctrl.goBack,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ),
                Expanded(
                  child: Text(
                    ctrl.item.categoryTitle ?? ctrl.item.title,
                    style: TextStyle(
                      color: AppColor().primaryText,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32).withOpacity(0.2),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Text(
                'Question ${index + 1} of ${ctrl.item.questions.length > 0 ? "?" : "1"}', // Total is dynamic now, hard to say "of X"
                // Or we can just say "Step ${index + 1}"
                style: const TextStyle(
                  color: Color(0xFF4CAF50),
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 25),
            Text(
              question.question,
              style: TextStyle(
                color: AppColor().primaryText,
                fontSize: 18,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 30),
            Obx(() {
              final selectedAns = ctrl.getSelectedAnswer(question.id);
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 15),
                decoration: BoxDecoration(
                  color: Color(0xFF1D4339),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<Answer>(
                    isExpanded: true,
                    hint: Text(
                      'Select an answer...',
                      style: TextStyle(color: AppColor().accent5, fontSize: 14),
                    ),
                    value: selectedAns,
                    icon: Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColor().accent5,
                    ),
                    dropdownColor: const Color(0xFF1D4339),
                    items: question.answers.map((ans) {
                      return DropdownMenuItem<Answer>(
                        value: ans,
                        child: Text(
                          ans.text,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (ans) {
                      if (ans == null) return;
                      ctrl.onAnswerSelected(question, ans);
                    },
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class DiagnosisResult extends StatelessWidget {
  final Diagnosis diagnosis;
  final VoidCallback onReset;
  final String tag;

  const DiagnosisResult({
    super.key,
    required this.diagnosis,
    required this.onReset,
    required this.tag,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColor().secondaryBackground,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'DIAGNOSIS:',
                style: TextStyle(
                  color: AppColor().secondary.withOpacity(0.8),
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              // We can add a "Back" button here too if we want to allow going back from result to last question
              // Or just "Start Over".
              IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios,
                  size: 20,
                  color: Colors.white54,
                ),
                onPressed: () {
                  Get.find<SelfDiagnosisCtrl>(tag: tag).goBack();
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            diagnosis.title,
            style: TextStyle(
              color: AppColor().secondary,
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Divider(color: Colors.white10, height: 40),
          ...diagnosis.details.map(
            (detail) => Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.check_circle,
                    color: AppColor().secondary.withOpacity(0.6),
                    size: 18,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      detail,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 15,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'SOLUTION:',
            style: TextStyle(
              color: AppColor().secondary.withOpacity(0.8),
              fontSize: 14,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              diagnosis.solution,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 30),
          if (diagnosis.affiliateLink.isNotEmpty)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final urlString = diagnosis.affiliateLink.trim();
                  if (urlString.isEmpty) return;

                  final url = Uri.tryParse(urlString);
                  if (url != null) {
                    try {
                      if (!await launchUrl(
                        url,
                        mode: LaunchMode.externalApplication,
                      )) {
                        Get.snackbar(
                          "Error",
                          "Could not open link. Please try again.",
                          backgroundColor: Colors.red,
                          colorText: Colors.white,
                        );
                      }
                    } catch (e) {
                      Get.snackbar(
                        "Error",
                        "Could not open link: $e",
                        backgroundColor: Colors.red,
                        colorText: Colors.white,
                      );
                    }
                  } else {
                    Get.snackbar(
                      "Error",
                      "Invalid link provided.",
                      backgroundColor: Colors.red,
                      colorText: Colors.white,
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColor().secondary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  elevation: 5,
                ),
                child: Text(
                  diagnosis.affiliateTitle.toUpperCase(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onReset,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white30),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  child: const Text(
                    'START OVER',
                    style: TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    final ctrl = Get.find<SelfDiagnosisCtrl>(tag: tag);
                    ctrl.contactSupport();
                  },
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppColor().secondary, width: 2),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  child: Text(
                    'SUPPORT',
                    style: TextStyle(
                      color: AppColor().secondary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
