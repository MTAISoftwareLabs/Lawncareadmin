import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/auth_ctrl/forgot_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/costome_botton.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';

class ForgotScreen extends StatelessWidget {
  const ForgotScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ForgotCtrl controller = Get.put(ForgotCtrl());

    return Scaffold(
      backgroundColor: AppColor().accent1,
      body: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CostomeBackBotton(onPressed: () => Get.back()),
            const SizedBox(height: 20),
            Text(
              'Forgot Password',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Enter your email below to receive a password reset link.',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 16,
                fontWeight: FontWeight.normal,
              ),
            ),
            const SizedBox(height: 20),
            CustomeTextField(
              keyboardType: TextInputType.emailAddress,
              controller: controller.emailCtrl,
              hintText: 'Enter your email',
              obscureText: false,
            ),
            const SizedBox(height: 20),
            Obx(
              () => controller.isLoading.value
                  ? Center(
                      child: CircularProgressIndicator(
                        color: AppColor().primary,
                      ),
                    )
                  : CostomeBotton(
                      text: 'Send Reset Link',
                      onPressed: controller.sendResetLink,
                      color: AppColor().secondaryText,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
