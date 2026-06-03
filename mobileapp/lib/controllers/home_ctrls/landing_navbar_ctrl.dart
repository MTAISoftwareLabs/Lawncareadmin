import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/screens/home_screens/contest_screens/contest_screen.dart';
import 'package:lawn_care/screens/home_screens/forum_screen.dart';
import 'package:lawn_care/screens/home_screens/home/home_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/profile_screen.dart';
import 'package:lawn_care/screens/home_screens/questions_screen.dart';
import 'package:lawn_care/screens/home_screens/search_screen.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/widgets/guest_login_dialog.dart';

import 'package:lawn_care/controllers/subscription_ctrl.dart';
import 'package:lawn_care/screens/subscription_screen/subscription_screen.dart';

class LandingNavbarCtrl extends GetxController {
  RxInt selectedIndex = 0.obs;
  final StorageService _storage = Get.find<StorageService>();

  final List<Widget> pages = [
    HomeScreen(),
    SearchScreen(),
    const ForumScreen(),
    const QuestionsScreen(),
    const ContestScreen(),
    const ProfileScreen(),
  ];

  void onItemTapped(int index) {
    // Restricted tabs: Search (1), Forum (2), Questions (3), Contest (4), Profile (5)
    if (_storage.isGuest() &&
        (index == 1 || index == 2 || index == 3 || index == 4 || index == 5)) {
      GuestLoginDialog.show();
      return;
    }

    // New restriction: Search (1), Forum (2), Questions (3), Contest (4) require subscription
    if ((index == 1 || index == 2 || index == 3 || index == 4) &&
        !SubscriptionCtrl.to.isSubscribed.value) {
      Get.toNamed('/subscription');
      return;
    }

    selectedIndex.value = index;
  }
}
