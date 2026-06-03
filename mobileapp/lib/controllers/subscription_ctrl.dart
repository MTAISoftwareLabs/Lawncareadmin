import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';

class SubscriptionCtrl extends GetxController {
  static SubscriptionCtrl get to => Get.find();

  RxBool get isSubscribed => SubscriptionHelper.instance.isUserSubscribed;
  var isLoading = false.obs;
  var selectedPlanIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    _syncStatus();
  }

  Future<void> _syncStatus() async {
    isLoading.value = true;
    await SubscriptionHelper.instance.isProUser();
    isLoading.value = false;
  }

  Future<void> restorePurchases() async {
    isLoading.value = true;
    bool status = await SubscriptionHelper.instance.restorePurchases();
    isLoading.value = false;
    if (status) {
      Get.snackbar("Success", "Subscription restored!");
    } else {
      Get.snackbar("Info", "No active subscription found.");
    }
  }

  // Only available in debug/profile builds — never in release.
  void debugUnlock() {
    assert(() {
      isSubscribed.value = true;
      print("SubscriptionCtrl.debugUnlock: paywall bypassed (debug only)");
      return true;
    }());
  }
}
