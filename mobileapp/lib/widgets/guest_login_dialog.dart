import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';
import 'package:lawn_care/utils/appcolor.dart';

class GuestLoginDialog extends StatelessWidget {
  const GuestLoginDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColor().accent4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(
        "Access Restricted",
        style: TextStyle(
          color: AppColor().tertiary,
          fontWeight: FontWeight.bold,
        ),
      ),
      content: Text(
        "This feature is only available for registered users. Please log in or create an account to continue.",
        style: TextStyle(color: AppColor().primaryText),
      ),
      actions: [
        TextButton(
          onPressed: () => Get.back(),
          child: Text("Cancel", style: TextStyle(color: AppColor().alternate)),
        ),
        ElevatedButton(
          onPressed: () {
            Get.back();
            Get.offAll(() => LoginScreen());
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColor().tertiary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          child: const Text("Log In", style: TextStyle(color: Colors.black)),
        ),
      ],
    );
  }

  static void show() {
    Get.dialog(const GuestLoginDialog());
  }
}
