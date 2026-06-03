import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/contest_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';

class ContestEntryScreen extends StatelessWidget {
  const ContestEntryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Find the existing ContestCtrl instead of putting a new EntryCtrl
    final ContestCtrl controller = Get.find<ContestCtrl>();

    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white70),
          onPressed: () => Get.back(),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GestureDetector(
        onTap: () {
          FocusManager.instance.primaryFocus?.unfocus();
        },
        child: Container(
          height: double.infinity,
          width: double.infinity,
          color: AppColor().sedarymainBackground,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Text
                Text(
                  'Enter the Monthly\nLawn Contest',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Upload your best lawn photo and stand a chance to win!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.white70),
                ),
                const SizedBox(height: 30),

                // Upload Photo Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Upload Photo',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColor().secondary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      GestureDetector(
                        onTap: controller.pickImage,
                        child: Obx(
                          () => Container(
                            height: 200,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(color: Colors.grey[300]!),
                              image: controller.selectedImage.value != null
                                  ? DecorationImage(
                                      image: FileImage(
                                        controller.selectedImage.value!,
                                      ),
                                      fit: BoxFit.cover,
                                    )
                                  : null,
                            ),
                            child: controller.selectedImage.value == null
                                ? Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.camera_alt,
                                        size: 50,
                                        color: Colors.grey[300],
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        'Tap to upload your lawn photo\nJPG or PNG, max 10MB',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: AppColor().secondary,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  )
                                : Stack(
                                    children: [
                                      if (controller.isUploading.value)
                                        Container(
                                          color: Colors.black38,
                                          child: const Center(
                                            child: CircularProgressIndicator(
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      Positioned(
                                        right: 10,
                                        top: 10,
                                        child: GestureDetector(
                                          onTap: controller.removeImage,
                                          child: Container(
                                            padding: const EdgeInsets.all(5),
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
                          ),
                        ),
                      ),
                      const SizedBox(height: 15),
                      Text(
                        'Make sure your lawn photo is clear, well-lit, and shows your entire lawn.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColor().secondary.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Entry Details Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Entry Details',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColor().secondary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        controller: controller.captionController,
                        hint:
                            'Describe your entry and some history about your lawn.',
                        lines: 4,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Contest Rules Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColor().primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Contest Rules',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColor().secondary,
                        ),
                      ),
                      const SizedBox(height: 15),
                      _buildRuleItem('One entry per household'),
                      _buildRuleItem(
                        'Photos must be taken within last 30 days',
                      ),
                      _buildRuleItem('No digital enhancements or filters'),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: Obx(
                    () => ElevatedButton(
                      onPressed: controller.isSubmitting.value
                          ? null
                          : controller.submitEntry,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E5A35), // Dark green
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      child: controller.isSubmitting.value
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Submit Entry',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required int lines,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(10),
      ),
      child: TextField(
        controller: controller,
        maxLines: lines,
        style: TextStyle(color: AppColor().secondary),
        textInputAction: TextInputAction.done,

        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: AppColor().secondary),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(15),
        ),
      ),
    );
  }

  Widget _buildRuleItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Row(
        children: [
          Icon(Icons.check_circle_outline, color: AppColor().secondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: AppColor().secondary.withOpacity(0.8),
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
