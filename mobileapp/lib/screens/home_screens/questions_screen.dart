import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/questions_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';

class QuestionsScreen extends StatelessWidget {
  const QuestionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final QuestionsCtrl controller = Get.put(QuestionsCtrl());

    return Scaffold(
      backgroundColor:
          AppColor().sedaryBackground, // Using primary as base background
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Container(
          height: double.infinity,
          width: double.infinity,
          color: AppColor().primary,
          child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Text(
                    'Have a Lawn Problem?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColor().secondary,
                    ),
                  ),
                ),
                const SizedBox(height: 30),

                // Heading Input
                Container(
                  height: 55,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: AppColor().secondary.withOpacity(0.5),
                    ),
                    color: AppColor().primary.withOpacity(0.3),
                  ),
                  child: TextField(
                    controller: controller.headingController,
                    style: TextStyle(color: AppColor().accent5),
                    decoration: InputDecoration(
                      hintText: 'Problem Heading (e.g., Brown Spots)',
                      hintStyle: TextStyle(
                        color: AppColor().accent5,
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 15,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 15),

                // Description Input
                Container(
                  height: 150,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: AppColor().secondary.withOpacity(0.5),
                    ),
                    color: AppColor().primary.withOpacity(0.3),
                  ),
                  child: TextField(
                    controller: controller.descriptionController,
                    maxLines: 5,
                    style: TextStyle(color: AppColor().accent5),
                    decoration: InputDecoration(
                      hintText: 'Short Description of what is going on...',
                      hintStyle: TextStyle(
                        color: AppColor().accent5,
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(15),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Priority Selection
                Text(
                  'Choose a priority level',
                  style: TextStyle(
                    color: AppColor().accent5,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 10),
                Obx(
                  () => Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: controller.priorities.map((priority) {
                      final isSelected =
                          controller.selectedPriority.value == priority;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => controller.setPriority(priority),
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColor().primary
                                  : Colors.transparent, // Highlight logic
                              // In image 'High' is dark with checkmark, others are outline?
                              // Implementing simple highlight for now
                              border: Border.all(
                                color: isSelected
                                    ? AppColor().secondary
                                    : AppColor().secondary.withOpacity(0.5),
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (isSelected)
                                  Icon(
                                    Icons.check,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                if (isSelected) const SizedBox(width: 4),
                                Text(
                                  priority,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10, // Small text to fit 4 buttons
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),

                // Upload Photo Button
                GestureDetector(
                  onTap: controller.pickImage,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 15,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(
                        color: AppColor().secondary.withOpacity(0.5),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.camera_alt_outlined,
                          color: AppColor().accent5,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Upload Photo',
                          style: TextStyle(
                            color: AppColor().accent5,
                            fontSize: 16,
                          ),
                        ),
                        const Spacer(),
                        Obx(
                          () => controller.isUploading.value
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 30),

                // Selected Image Preview
                Obx(
                  () => controller.selectedImage.value != null
                      ? Center(
                          child: Stack(
                            children: [
                              Container(
                                height: 180,
                                width: 180,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15),
                                  border: Border.all(
                                    color: AppColor().secondary.withOpacity(
                                      0.5,
                                    ),
                                  ),
                                  image: DecorationImage(
                                    image: FileImage(
                                      controller.selectedImage.value!,
                                    ),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                child: controller.isUploading.value
                                    ? Container(
                                        decoration: BoxDecoration(
                                          color: Colors.black38,
                                          borderRadius: BorderRadius.circular(
                                            15,
                                          ),
                                        ),
                                        child: const Center(
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                          ),
                                        ),
                                      )
                                    : null,
                              ),
                              Positioned(
                                right: 5,
                                top: 5,
                                child: GestureDetector(
                                  onTap: controller.removeImage,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ),
                              if (controller.isUploading.value)
                                const Positioned(
                                  bottom: 10,
                                  left: 0,
                                  right: 0,
                                  child: Center(
                                    child: Text(
                                      'Uploading...',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        )
                      : const SizedBox.shrink(),
                ),
                const SizedBox(height: 30),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: Obx(
                    () => ElevatedButton(
                      onPressed:
                          controller.isSubmitting.value ||
                              controller.isUploading.value
                          ? null
                          : controller.submitQuestion,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColor().secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                        disabledBackgroundColor: AppColor().primary,
                      ),
                      child: controller.isSubmitting.value
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Submit',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    ),
    );
  }
}
