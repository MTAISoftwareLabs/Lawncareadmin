import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/services/storage_service.dart';

class EditProfileCtrl extends GetxController {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController zipCodeController = TextEditingController();

  final RxBool isLoading = false.obs;
  final RxBool isNotificationEnabled = false.obs;
  final RxString selectedImagePath = ''.obs;
  final RxString uploadedImageUrl = ''.obs;
  final ImagePicker _imagePicker = ImagePicker();

  @override
  void onInit() {
    super.onInit();
    loadProfileData();
  }

  void loadProfileData() {
    try {
      final StorageService storage = Get.find<StorageService>();
      final userData = storage.getUser();

      if (userData != null) {
        nameController.text = userData['name'] ?? userData['user_name'] ?? '';
        emailController.text =
            userData['email'] ?? userData['user_email'] ?? '';
        phoneController.text =
            userData['phone'] ?? userData['user_phone'] ?? '';
        zipCodeController.text =
            userData['zipCode'] ?? userData['zip_code'] ?? '';
        isNotificationEnabled.value =
            userData['isNotificationEnabled'] ??
            userData['is_notification_enabled'] ??
            false;
        uploadedImageUrl.value =
            userData['avatar'] ?? userData['user_image'] ?? '';
        print("Uploaded Image URL: ${uploadedImageUrl.value}");
      }
    } catch (e) {
      print("Error loading profile data: $e");
    }
  }

  @override
  void onClose() {
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    super.onClose();
  }

  void changeImage() async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (pickedFile != null) {
        selectedImagePath.value = pickedFile.path;
        await uploadImage(pickedFile);
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to pick image: $e");
    }
  }

  Future<void> uploadImage(XFile imageFile) async {
    try {
      isLoading.value = true;
      final AuthService authService = Get.find<AuthService>();
      final StorageService storageService = Get.find<StorageService>();
      final response = await authService.uploadProfileImage(imageFile);

      if (response.isOk && response.body is Map) {
        final data = response.body as Map<String, dynamic>;
        if (data['data'] != null && data['data']['url'] != null) {
          uploadedImageUrl.value = data['data']['url'];

          // Immediately persist the avatar URL in both the user data cache
          // and the user-specific slot so it survives logout → login.
          final userData = storageService.getUser();
          final userId =
              (userData?['id'] ?? userData?['user_id'])?.toString() ?? '';
          await Future.wait([
            storageService.mergeUser({'avatar': uploadedImageUrl.value}),
            storageService.saveAvatarForUser(userId, uploadedImageUrl.value),
          ]);

          await _silentProfileUpdate();

          Get.snackbar(
            "Success",
            "Profile image updated",
            backgroundColor: Colors.white,
            colorText: Colors.black,
          );
        }
      } else {
        Get.snackbar(
          "Error",
          "Failed to upload image: ${response.statusCode}",
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        "Error",
        "Image upload failed: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _silentProfileUpdate() async {
    final AuthService authService = Get.find<AuthService>();
    final StorageService storageService = Get.find<StorageService>();

    final profileData = {
      'name': nameController.text.trim(),
      'phone': phoneController.text.trim(),
      'zipCode': zipCodeController.text.trim(),
      'isNotificationEnabled': isNotificationEnabled.value,
      'avatar': uploadedImageUrl.value,
    };

    final response = await authService.updateProfile(profileData);
    if (response.isOk && response.body is Map) {
      final data = response.body as Map<String, dynamic>;
      if (data['data'] != null && data['data'] is Map<String, dynamic>) {
        // Merge server response so that any field the API omits (e.g. avatar)
        // is NOT overwritten in local storage.
        await storageService.mergeUser(data['data'] as Map<String, dynamic>);
      }
    }

    // Always re-apply the avatar URL locally so it survives even if the
    // server response did not echo it back.
    if (uploadedImageUrl.value.isNotEmpty) {
      await storageService.mergeUser({'avatar': uploadedImageUrl.value});
    }
  }

  void saveChanges() async {
    try {
      isLoading.value = true;
      await _silentProfileUpdate();
      Get.back();
      Get.snackbar(
        "Success",
        "Profile updated successfully",
        backgroundColor: Colors.white,
        colorText: Colors.black,
      );
    } catch (e) {
      Get.snackbar(
        "Error",
        "An error occurred: $e",
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void deleteAccount() {
    Get.defaultDialog(
      title: "Delete Account",
      middleText:
          "Are you sure you want to delete your account? This cannot be undone.",
      textConfirm: "Delete",
      textCancel: "Cancel",
      confirmTextColor: Colors.white,
      onConfirm: () {
        Get.back();
        Get.back();
        Get.snackbar("Account Deleted", "We are sorry to see you go.");
      },
    );
  }
}
