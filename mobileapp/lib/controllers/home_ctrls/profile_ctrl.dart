import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';

import 'package:lawn_care/screens/home_screens/profile_screens/contact_us_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/edit_profile_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/my_content_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/notifications_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/privacypolicy.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/rulesandcopyright.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_list_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/saved_items_screen.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';

class ProfileCtrl extends GetxController {
  final String version = "1.3.5";

  final RxString userId = ''.obs;
  final RxString userName = ''.obs;
  final RxString userEmail = ''.obs;
  final RxString userPhone = ''.obs;
  final RxString userAvatar = ''.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadUserProfile();
  }

  void loadUserProfile() {
    try {
      final StorageService storage = Get.find<StorageService>();
      final userData = storage.getUser();
      print("ProfileCtrl.loadUserProfile: $userData");

      if (userData != null) {
        userId.value =
            (userData['id'] ?? userData['user_id'])?.toString() ?? '';
        userName.value =
            userData['name'] ??
            userData['user_name'] ??
            userData['username'] ??
            userData['full_name'] ??
            'User';
        userEmail.value = userData['email'] ?? userData['user_email'] ?? '';
        userPhone.value = userData['phone'] ?? userData['user_phone'] ?? '';
        userAvatar.value =
            userData['avatar'] ??
            userData['user_image'] ??
            userData['profile_image'] ??
            '';
      }
    } catch (e) {
      print("ProfileCtrl.loadUserProfile error: $e");
    }
  }

  void handleMenuItem(String title) {
    if (title == 'My profile') {
      Get.to(() => const EditProfileScreen())?.then((_) => loadUserProfile());
    } else if (title == 'Saved Items') {
      Get.to(() => const SavedItemsScreen());
    } else if (title == 'Push Notifications') {
      Get.to(() => const NotificationsScreen());
    } else if (title == 'Contact us') {
      Get.to(() => const ContactUsScreen());
    } else if (title == 'My Contents') {
      Get.to(() => const MyContentScreen());
    } else if (title == 'Rules and Copyright') {
      Get.to(() => const Rulesandcopyright());
    } else if (title == 'Privacy & policy') {
      Get.to(() => const Privacypolicy());
    } else if (title == 'My Questions') {
      Get.to(() => const ChatListScreen());
    } else {
      Get.snackbar("Navigation", "Navigating to $title...");
    }
  }

  void logout() async {
    try {
      Get.dialog(
        const Center(child: CircularProgressIndicator()),
        barrierDismissible: false,
      );

      final AuthService authService = Get.find<AuthService>();
      final StorageService storageService = Get.find<StorageService>();

      await Future.wait([
        authService.logout(),
        SubscriptionHelper.instance.logOut(),
      ]);

      // Use clearAuthData instead of clearAll so that per-user calendar
      // events (stored under user_events_{userId}) are preserved and will
      // be reloaded when the same user logs back in.
      await storageService.clearAuthData();

      Get.back(); // Close loading dialog
      Get.offAll(() => LoginScreen());
      Get.snackbar("Log out", "You have been logged out successfully.");
    } catch (e) {
      print("ProfileCtrl.logout error: $e");
      try {
        await Future.wait([
          SubscriptionHelper.instance.logOut(),
          Get.find<StorageService>().clearAuthData(),
        ]);
      } catch (_) {}

      if (Get.isDialogOpen ?? false) Get.back();
      Get.offAll(() => LoginScreen());
      Get.snackbar("Log out", "Logged out from device.");
    }
  }

  Map<String, dynamic>? getUserData() {
    return Get.find<StorageService>().getUser();
  }

  void toggleTheme() {
    final StorageService storageService = Get.find<StorageService>();
    final bool nextIsDarkMode = !storageService.isDarkMode();

    storageService.saveThemeMode(nextIsDarkMode);
    Get.changeThemeMode(nextIsDarkMode ? ThemeMode.dark : ThemeMode.light);
    Get.forceAppUpdate();
    update();
  }
}
