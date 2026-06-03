import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/splash_ctrl/splash_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/costome_botton.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SplashCtrl());
    return Scaffold(
      body: Stack(
        children: [
          Image.asset(
            "assets/images/DALLE_2025-01-09_13.21.06_-_A_modern_backyard_scene_featuring_a_sleek,_futuristic_house_with_a_neatly_striped_lawn_in_the_foreground._On_the_left_side_of_the_house,_the_back_wall.jpg",
            height: double.infinity,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
          Center(
            child: CostomeBotton(
              onPressed: controller.onSkipPressed,
              text: "Continue",
              color: AppColor().primary,
            ),
          ),
        ],
      ),
    );
  }
}
