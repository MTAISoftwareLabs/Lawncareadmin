import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/costome_botton.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  @override
  Widget build(BuildContext context) {
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
              'Login with phone',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Input your phone below in oder to login',
              style: TextStyle(
                color: AppColor().orangecolor,
                fontSize: 16,
                fontWeight: FontWeight.normal,
              ),
            ),
            const SizedBox(height: 20),
            CustomeTextField(
              keyboardType: TextInputType.phone,
              controller: TextEditingController(),
              hintText: 'Enter your phone number',
              obscureText: false,
            ),
            const SizedBox(height: 20),
            CostomeBotton(
              text: 'Next',
              onPressed: () {},
              color: AppColor().secondaryText,
            ),
          ],
        ),
      ),
    );
  }
}
