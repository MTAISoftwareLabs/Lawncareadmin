import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/auth_ctrl/login_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';
import 'package:lawn_care/widgets/login_bottons.dart';

class LoginScreen extends StatefulWidget {
  LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late LoginController controller;

  @override
  void initState() {
    super.initState();
    // Force-delete any stale instance before creating a fresh one
    if (Get.isRegistered<LoginController>()) {
      Get.delete<LoginController>(force: true);
    }
    controller = Get.put(LoginController());
  }

  @override
  void dispose() {
    // Let GetX manage the controller lifecycle
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().accent1,
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
                  'Transform Your Lawn\nOne Tip at a Time!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColor().secondaryText,
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),

              const SizedBox(height: 10),

              Text(
                'Log in to continue',
                style: TextStyle(
                  color: AppColor().secondary,
                  fontSize: 18,
                  fontWeight: FontWeight.normal,
                ),
              ),

              const SizedBox(height: 8),

              // Input Fields
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
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
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Buttons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
                    Obx(
                      () => controller.isLoading.value
                          ? const CircularProgressIndicator()
                          : LoginBottons(
                              text: 'Log in',
                              color: AppColor().secondaryText,
                              onPressed: () {
                                controller.login();
                              },
                            ),
                    ),
                    const SizedBox(height: 20),
                    LoginBottons(
                      text: 'Create Account',
                      color: AppColor().secondaryText,
                      onPressed: () {
                        controller.createAccount();
                      },
                    ),
                    const SizedBox(height: 20),
                    LoginBottons(
                      text: 'Forgot Password',
                      color: AppColor().secondaryText,
                      onPressed: () {
                        controller.forgoscreen();
                      },
                    ),
                    const SizedBox(height: 20),
                    LoginBottons(
                      text: 'Continue as Guest',
                      color: AppColor().secondaryText,
                      onPressed: () {
                        controller.loginAsGuest();
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
