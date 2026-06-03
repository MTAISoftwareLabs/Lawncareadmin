import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';
import 'package:lawn_care/screens/auth_screen/forgot_screen.dart';
import 'package:lawn_care/screens/auth_screen/signup_screen.dart';
import 'package:lawn_care/screens/home_screens/landing_navbar.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/services/storage_service.dart';

class LoginController extends GetxController {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final RxBool isObscure = true.obs;
  final RxBool isObscure2 = true.obs;
  final RxBool isLoading = false.obs;
  final AuthService _authService = Get.find<AuthService>();
  final StorageService _storage = Get.find<StorageService>();

  @override
  void onClose() {
    super.onClose();
  }

  void toggleObscure() {
    isObscure.value = !isObscure.value;
  }

  void toggleObscure2() {
    isObscure2.value = !isObscure2.value;
  }

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      Get.snackbar(
        "Error",
        "Please enter both email and password",
        snackPosition: SnackPosition.TOP,
      );
      return;
    }

    if (!GetUtils.isEmail(email)) {
      Get.snackbar(
        "Error",
        "Please enter a valid email address",
        snackPosition: SnackPosition.TOP,
      );
      return;
    }

    try {
      isLoading.value = true;
      final response = await _authService.login(email, password);

      if (response.isOk) {
        final data = response.body;

        if (data is Map && data.containsKey('token')) {
          final token = data['token'];
          final user = data['user'];

          await _storage.saveToken(token);
          await _storage.saveIsGuest(false);
          if (user != null && user is Map<String, dynamic>) {
            await _storage.saveUser(user);

            // Restore the persisted avatar for this user if the login API
            // response did not include one (some backends omit it).
            final String userId =
                (user['id'] ?? user['user_id'])?.toString() ?? '';
            final existingAvatar =
                user['avatar']?.toString() ??
                user['user_image']?.toString() ??
                '';
            if (existingAvatar.isEmpty && userId.isNotEmpty) {
              final savedAvatar = _storage.getAvatarForUser(userId);
              if (savedAvatar != null && savedAvatar.isNotEmpty) {
                await _storage.mergeUser({'avatar': savedAvatar});
              }
            }

            await SubscriptionHelper.instance.logIn(userId);
          }

          print("Logged in successfully. Token: $token");
          Get.offAll(() => LandingNavbar());
        } else {
          print("Login successful but token missing or invalid format: $data");
          Get.snackbar(
            "Error",
            "Unexpected response from server. Please try again.",
            snackPosition: SnackPosition.TOP,
          );
        }
      } else {
        print("Login failed: ${response.statusText}");
        Get.snackbar(
          "Error",
          "Login failed: ${response.statusText}",
          snackPosition: SnackPosition.TOP,
        );
      }
    } catch (e) {
      Get.snackbar(
        "Error",
        "An unexpected error occurred",
        snackPosition: SnackPosition.TOP,
      );
      print("Login error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void createAccount() {
    print("Create account pressed");
    Get.to(() => SignupScreen());
  }

  void forgoscreen() {
    print("Forgot screen pressed");
    Get.to(() => ForgotScreen());
  }

  Future<void> loginAsGuest() async {
    try {
      isLoading.value = true;
      await _storage.clearAll();

      await _storage.saveIsGuest(true);

      await _storage.saveUser({
        'name': 'Guest',
        'email': 'guest@example.com',
        'avatar': '',
      });

      print("Logged in as guest");
      Get.offAll(() => LandingNavbar());
    } catch (e) {
      Get.snackbar(
        "Error",
        "Could not login as guest. Please try again.",
        snackPosition: SnackPosition.TOP,
      );
      print("Guest login error: $e");
    } finally {
      isLoading.value = false;
    }
  }
}
