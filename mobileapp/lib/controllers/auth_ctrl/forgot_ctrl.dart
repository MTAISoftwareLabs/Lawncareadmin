import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/screens/auth_screen/reset_password_screen.dart';

class ForgotCtrl extends GetxController {
  final emailCtrl = TextEditingController();
  final isLoading = false.obs;

  @override
  void onClose() {
    emailCtrl.dispose();
    super.onClose();
  }

  Future<void> sendResetLink() async {
    final email = emailCtrl.text.trim();

    if (email.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter your email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (!GetUtils.isEmail(email)) {
      Get.snackbar(
        'Error',
        'Please enter a valid email address.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    try {
      isLoading.value = true;
      final authService = Get.find<AuthService>();
      final response = await authService.forgotPassword(email);

      if (response.isOk) {
        Get.snackbar(
          'Email Sent',
          'A 6-digit OTP has been sent to $email.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.withOpacity(0.85),
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );
        // Navigate to the reset password/OTP screen
        Get.to(() => ResetPasswordScreen(email: email));
      } else {
        final message =
            response.body?['message'] ??
            'Something went wrong. Please try again.';
        Get.snackbar(
          'Error',
          message.toString(),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.withOpacity(0.85),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to send reset link. Please check your connection.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
