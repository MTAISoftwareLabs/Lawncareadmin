import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';
import 'package:lawn_care/screens/home_screens/landing_navbar.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/services/device_service.dart';

class SplashCtrl extends GetxController {
  final StorageService _storage = Get.find<StorageService>();
  final DeviceService _deviceService = Get.find<DeviceService>();

  @override
  void onInit() {
    super.onInit();
    _checkLoginStatus();
  }

  void _checkLoginStatus() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (_storage.hasToken()) {
        // Register FCM token
        _deviceService.registerDeviceToken();
        _deviceService.setupTokenRefreshListener();

        // Navigate to home immediately — never block on a network call.
        // The locally-cached subscription status (loaded in SubscriptionHelper.init)
        // is already set; a background re-verify runs automatically.
        Get.offAll(() => LandingNavbar());

        // After navigation, silently re-verify subscription in the background.
        // Individual premium-gated screens/features handle their own checks.
        _backgroundSubscriptionSync();
      }
      // If no token, do nothing — the splash screen "Continue" button handles it.
    });
  }

  /// Quietly syncs RevenueCat + backend subscription status without
  /// interrupting the user. Called after navigating to home.
  void _backgroundSubscriptionSync() {
    Future.microtask(() async {
      try {
        await SubscriptionHelper.instance.isProUser();
        print("SplashCtrl: Background subscription sync complete. "
            "isPremium=${SubscriptionHelper.instance.isUserSubscribed.value}");
      } catch (e) {
        print("SplashCtrl: Background sync error: $e");
      }
    });
  }

  void onSkipPressed() async {
    if (_storage.hasToken()) {
      _deviceService.registerDeviceToken();
      _deviceService.setupTokenRefreshListener();

      // Go straight home — same logic as above
      Get.offAll(() => LandingNavbar());
      _backgroundSubscriptionSync();
    } else {
      Get.to(() => LoginScreen());
    }
  }
}
