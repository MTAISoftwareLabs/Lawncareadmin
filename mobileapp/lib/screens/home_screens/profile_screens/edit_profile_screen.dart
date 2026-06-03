import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'dart:io';
import 'package:lawn_care/controllers/home_ctrls/edit_profile_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/services/api_endpoints.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final EditProfileCtrl controller = Get.put(EditProfileCtrl());

    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white70),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Edit Profile',
          style: TextStyle(
            color: AppColor().secondary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Image Placeholder
              Obx(() {
                final imagePath = controller.selectedImagePath.value;
                final imageUrl = controller.uploadedImageUrl.value;

                Widget child;

                if (imagePath.isNotEmpty) {
                  child = Image.file(
                    File(imagePath),
                    key: ValueKey(imagePath),
                    fit: BoxFit.cover,
                  );
                } else if (imageUrl.isNotEmpty) {
                  child = Image.network(
                    ApiEndpoints.formatImageUrl(imageUrl),
                    key: ValueKey(imageUrl),
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      );
                    },
                    errorBuilder: (_, __, ___) => _defaultIcon(),
                  );
                } else {
                  child = _defaultIcon();
                }

                return Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: AppColor().secondary.withOpacity(0.5),
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: child,
                  ),
                );
              }),

              const SizedBox(height: 15),

              // Change Image Button
              Obx(
                () => SizedBox(
                  width: 180,
                  height: 40,
                  child: ElevatedButton(
                    onPressed: controller.isLoading.value
                        ? null
                        : controller.changeImage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColor().accent4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: controller.isLoading.value
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            'Change Image',
                            style: TextStyle(
                              fontSize: Get.width > 600 ? 16 : 14,
                              color: AppColor().primary,
                            ),
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Name Field
              _buildTextField(controller.nameController, hintText: 'Name'),
              const SizedBox(height: 20),

              // Email Field
              _buildTextField(
                controller.emailController,
                hintText: 'Email',
                isHighlight: true,
              ),
              const SizedBox(height: 20),

              // Phone Number Field
              _buildTextField(
                controller.phoneController,
                hintText: 'Phone Number',
              ),
              const SizedBox(height: 40),

              // Save Changes Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: controller.saveChanges,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E5A35), // Dark green
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  child: Text(
                    'Save Changes',
                    style: TextStyle(color: AppColor().accent5, fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(height: 15),

              // Delete Account Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: controller.deleteAccount,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColor().accent4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  child: Text(
                    'Delete Account',
                    style: TextStyle(
                      color: AppColor().primary, // Dark Text
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller, {
    required String hintText,
    bool isHighlight = false,
  }) {
    return Column(
      children: [
        TextField(
          controller: controller,
          style: TextStyle(color: AppColor().primaryText, fontSize: 16),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: TextStyle(color: AppColor().primaryText, fontSize: 16),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 8),
            border: InputBorder.none,
          ),
        ),
        Divider(color: AppColor().primaryText),
      ],
    );
  }
}

Widget _defaultIcon() {
  return const Icon(Icons.person, size: 60, color: Colors.white24);
}
