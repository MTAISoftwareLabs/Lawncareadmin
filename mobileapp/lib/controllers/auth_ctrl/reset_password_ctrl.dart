import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';

class ResetPasswordCtrl extends GetxController {
  // OTP controllers — one per digit
  final List<TextEditingController> otpControllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> otpFocusNodes = List.generate(6, (_) => FocusNode());

  final passwordCtrl = TextEditingController();
  final confirmPasswordCtrl = TextEditingController();
  final isLoading = false.obs;
  final obscurePassword = true.obs;
  final obscureConfirm = true.obs;

  @override
  void onClose() {
    for (final c in otpControllers) {
      c.dispose();
    }
    for (final f in otpFocusNodes) {
      f.dispose();
    }
    passwordCtrl.dispose();
    confirmPasswordCtrl.dispose();
    super.onClose();
  }

  String get otpToken => otpControllers.map((c) => c.text).join();

  Future<void> resetPassword() async {
    final token = otpToken;
    final password = passwordCtrl.text;
    final confirmPassword = confirmPasswordCtrl.text;

    // Validations
    if (token.length < 6) {
      Get.snackbar(
        'Error',
        'Please enter the complete 6-digit OTP.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter a new password.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password.length < 8) {
      Get.snackbar(
        'Error',
        'Password must be at least 8 characters.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    if (password != confirmPassword) {
      Get.snackbar(
        'Error',
        'Passwords do not match.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
      return;
    }

    try {
      isLoading.value = true;
      final authService = Get.find<AuthService>();
      final response = await authService.resetPassword(token, password);

      if (response.isOk) {
        Get.snackbar(
          'Success',
          'Your password has been reset! Please login with your new password.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.withOpacity(0.85),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );
        // Navigate to login — initState will clean up any stale controller
        Get.offAll(() => LoginScreen());
      } else {
        final message =
            response.body?['message'] ??
            'Invalid OTP or request expired. Please try again.';
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
        'Failed to reset password. Please check your connection.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.85),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
