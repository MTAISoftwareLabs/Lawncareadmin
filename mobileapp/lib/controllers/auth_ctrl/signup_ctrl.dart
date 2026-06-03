import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/screens/home_screens/landing_navbar.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';
import 'package:lawn_care/screens/auth_screen/phone_screen.dart';

class SignupCtrl extends GetxController {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();

  final RxBool isObscure = true.obs;
  final RxBool isObscure2 = true.obs;
  final RxBool isLoading = false.obs;

  @override
  void onClose() {
    // Do NOT call .dispose() on TextEditingControllers here.
    // GetX can call onClose() before the widget tree fully dismounts,
    // which causes "used after being disposed" errors.
    // The owning StatefulWidget is responsible for disposal.
    super.onClose();
  }

  void toggleObscure() {
    isObscure.value = !isObscure.value;
  }

  void toggleObscure2() {
    isObscure2.value = !isObscure2.value;
  }

  Future<void> register() async {
    final name = nameController.text.trim();
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final confirmPassword = confirmPasswordController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      Get.snackbar("Error", "Please fill all fields");
      return;
    }

    if (password != confirmPassword) {
      Get.snackbar("Error", "Passwords do not match");
      return;
    }

    try {
      isLoading.value = true;
      Get.dialog(
        const Center(child: CircularProgressIndicator()),
        barrierDismissible: false,
      );

      final AuthService authService = Get.find<AuthService>();
      final response = await authService.register(
        email,
        password,
        name,
        "",
      );

      Get.back(); // Close loading dialog

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = response.body;
        if (body is Map && body['token'] != null) {
          final storage = Get.find<StorageService>();
          await storage.saveToken(body['token']);
          await storage.saveIsGuest(false);
          if (body['user'] != null && body['user'] is Map<String, dynamic>) {
            await storage.saveUser(body['user']);

            final String userId =
                (body['user']['id'] ?? body['user']['user_id'])
                    ?.toString() ??
                '';
            await SubscriptionHelper.instance.logIn(userId);
          }

          Get.offAll(() => LandingNavbar());
          Get.snackbar("Success", "Account created successfully!");
        } else {
          Get.offAll(() => LoginScreen());
          Get.snackbar("Success", "Account created! Please login.");
        }
      } else {
        final message = response.body is Map
            ? response.body['message']
            : "Registration failed";
        Get.snackbar("Error", message ?? "Status: ${response.statusCode}");
      }
    } catch (e) {
      Get.back();
      Get.snackbar("Error", "Registration error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void phonescreen() {
    Get.to(() => PhoneScreen());
  }
}
