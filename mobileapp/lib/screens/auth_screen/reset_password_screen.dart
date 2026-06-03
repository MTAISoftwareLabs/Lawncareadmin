import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/auth_ctrl/reset_password_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/costome_botton.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

class ResetPasswordScreen extends StatelessWidget {
  final String email;
  const ResetPasswordScreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    final ResetPasswordCtrl controller = Get.put(ResetPasswordCtrl());

    return Scaffold(
      backgroundColor: AppColor().accent1,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CostomeBackBotton(onPressed: () => Get.back()),
            const SizedBox(height: 20),
            Text(
              'Reset Password',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Enter the 6-digit OTP sent to\n$email',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 15,
                fontWeight: FontWeight.normal,
              ),
            ),
            const SizedBox(height: 28),

            // ── OTP Boxes ──
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (i) {
                return SizedBox(
                  width: 46,
                  height: 56,
                  child: TextField(
                    controller: controller.otpControllers[i],
                    focusNode: controller.otpFocusNodes[i],
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 1,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: TextStyle(
                      color: AppColor().primaryText,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: AppColor().accent4,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: AppColor().primary,
                          width: 1.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: AppColor().tertiary,
                          width: 2,
                        ),
                      ),
                    ),
                    onChanged: (value) {
                      if (value.isNotEmpty && i < 5) {
                        controller.otpFocusNodes[i + 1].requestFocus();
                      } else if (value.isEmpty && i > 0) {
                        controller.otpFocusNodes[i - 1].requestFocus();
                      }
                    },
                  ),
                );
              }),
            ),
            const SizedBox(height: 28),

            // ── New Password ──
            Text(
              'New Password',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Obx(
              () => TextField(
                controller: controller.passwordCtrl,
                obscureText: controller.obscurePassword.value,
                style: TextStyle(color: AppColor().primaryText),
                decoration: InputDecoration(
                  hintText: 'Enter new password',
                  hintStyle: TextStyle(
                    color: AppColor().primaryText.withOpacity(0.4),
                  ),
                  filled: true,
                  fillColor: AppColor().accent4,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: AppColor().primary,
                      width: 1.5,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: AppColor().tertiary,
                      width: 2,
                    ),
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      controller.obscurePassword.value
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColor().primary,
                    ),
                    onPressed: () => controller.obscurePassword.toggle(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Confirm Password ──
            Text(
              'Confirm Password',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Obx(
              () => TextField(
                controller: controller.confirmPasswordCtrl,
                obscureText: controller.obscureConfirm.value,
                style: TextStyle(color: AppColor().primaryText),
                decoration: InputDecoration(
                  hintText: 'Confirm new password',
                  hintStyle: TextStyle(
                    color: AppColor().primaryText.withOpacity(0.4),
                  ),
                  filled: true,
                  fillColor: AppColor().accent4,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: AppColor().primary,
                      width: 1.5,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: AppColor().tertiary,
                      width: 2,
                    ),
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      controller.obscureConfirm.value
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                    ),
                    color: AppColor().primary,
                    onPressed: () => controller.obscureConfirm.toggle(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // ── Submit Button ──
            Obx(
              () => controller.isLoading.value
                  ? Center(
                      child: CircularProgressIndicator(
                        color: AppColor().primary,
                      ),
                    )
                  : CostomeBotton(
                      text: 'Reset Password',
                      onPressed: controller.resetPassword,
                      color: AppColor().secondaryText,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
