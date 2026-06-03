import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/auth_ctrl/login_ctrl.dart';
import 'package:lawn_care/controllers/auth_ctrl/signup_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';
import 'package:lawn_care/widgets/login_bottons.dart';
import 'package:flutter/gestures.dart';
import 'package:lawn_care/screens/auth_screen/login_screen.dart';

class SignupScreen extends StatelessWidget {
  SignupScreen({super.key});
  final SignupCtrl controller = Get.put(SignupCtrl());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().primary, AppColor().accent4],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Top Image Section
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 10.0, 0.0, 0.0),
                child: Material(
                  color: Colors.transparent,
                  elevation: 20.0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18.0),
                  ),
                  child: Container(
                    width: 350.0,
                    height: 319.1,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        fit: BoxFit.cover,
                        alignment: AlignmentDirectional(0.0, -0.75),
                        image: Image.asset(
                          'assets/images/DALLE_2025-01-09_13.21.06_-_A_modern_backyard_scene_featuring_a_sleek,_futuristic_house_with_a_neatly_striped_lawn_in_the_foreground._On_the_left_side_of_the_house,_the_back_wall.jpg',
                        ).image,
                      ),
                      borderRadius: BorderRadius.circular(18.0),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 15),

              // Welcome Text
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Text(
                  'Create Account \n Lets Get Started by filling out from ',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColor().secondaryText, // Greenish/Darker
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),

              const SizedBox(height: 8),

              // Input Fields
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    CustomeTextField(
                      controller: controller.nameController,
                      hintText: 'Full Name',
                      obscureText: false,
                    ),
                    const SizedBox(height: 15),
                    CustomeTextField(
                      controller: controller.emailController,
                      hintText: 'Email',
                      obscureText: false,
                    ),
                    const SizedBox(height: 15),
                    Obx(
                      () => CustomeTextField(
                        controller: controller.passwordController,
                        hintText: 'Password',
                        obscureText: controller.isObscure.value,
                        suffixIcon: IconButton(
                          icon: Icon(
                            controller.isObscure.value
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: AppColor().info,
                          ),
                          onPressed: () {
                            controller.toggleObscure();
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                    Obx(
                      () => CustomeTextField(
                        controller: controller.confirmPasswordController,
                        hintText: 'Confirm Password',
                        obscureText: controller.isObscure2.value,
                        suffixIcon: IconButton(
                          icon: Icon(
                            controller.isObscure2.value
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: AppColor().info,
                          ),
                          onPressed: () {
                            controller.toggleObscure2();
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Buttons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    LoginBottons(
                      widthe: 170,
                      text: 'Create Account',
                      color: AppColor().secondaryText,
                      onPressed: () {
                        controller.register();
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            fontStyle: FontStyle.italic,
                            color: AppColor().secondaryText,
                          ),
                          children: [
                            TextSpan(text: 'Already have an account? '),
                            TextSpan(
                              text: 'sign in here',
                              style: TextStyle(
                                color: AppColor().orangecolor,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () {
                                  Get.to(() => LoginScreen());
                                },
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    LoginBottons(
                      text: '📞 Continue with phone',
                      color: AppColor().secondaryText,
                      onPressed: () {
                        controller.phonescreen();
                      },
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
