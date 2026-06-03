import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/landing_navbar_ctrl.dart';
import 'package:lawn_care/services/notification_service.dart';
import 'package:lawn_care/utils/appcolor.dart';

class LandingNavbar extends StatefulWidget {
  LandingNavbar({super.key});

  @override
  State<LandingNavbar> createState() => _LandingNavbarState();
}

class _LandingNavbarState extends State<LandingNavbar> {
  late LandingNavbarCtrl controller;

  @override
  void initState() {
    super.initState();
    controller = Get.put(LandingNavbarCtrl(), permanent: true);

    // Consume any pending notification navigation (terminated app launch)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationService.consumePendingNavigation();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().accent1,
      body: Obx(
        () => IndexedStack(
          index: controller.selectedIndex.value,
          children: controller.pages,
        ),
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(
          context,
        ).copyWith(canvasColor: AppColor().primaryBackground),
        child: Obx(
          () => BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            backgroundColor: AppColor().secondaryBackground,
            selectedItemColor: AppColor().tertiary,
            unselectedItemColor: AppColor().accent4,
            showUnselectedLabels: true,
            currentIndex: controller.selectedIndex.value,
            onTap: controller.onItemTapped,
            items: const <BottomNavigationBarItem>[
              BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
              BottomNavigationBarItem(
                icon: Icon(Icons.search),
                label: 'Search',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.forum_rounded),
                label: 'Forum',
              ),

              BottomNavigationBarItem(
                icon: Icon(Icons.quiz),
                label: 'Questions',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.emoji_events),
                label: 'Contest',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
