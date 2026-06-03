import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/privacy_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';

class Privacypolicy extends StatelessWidget {
  const Privacypolicy({super.key});

  @override
  Widget build(BuildContext context) {
    final PrivacyCtrl controller = Get.put(PrivacyCtrl());

    return Scaffold(
      backgroundColor: AppColor().alternate,
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          'Privacy Policy',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: AppColor().primaryText,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColor().primaryText),
          onPressed: () => Get.back(),
        ),
        backgroundColor: AppColor().primary,
        elevation: 0,
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.white),
            );
          }

          if (controller.errorMessage.isNotEmpty) {
            return Center(
              child: Text(
                controller.errorMessage.value,
                style: const TextStyle(color: Colors.white),
              ),
            );
          }

          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 10),
                  ...controller.privacySections.map((section) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            section.heading,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColor().primaryText,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            section.text,
                            style: TextStyle(
                              color: AppColor().primaryText,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  if (controller.privacySections.isEmpty)
                    const Center(
                      child: Text(
                        'No privacy content available.',
                        style: TextStyle(color: Colors.white70),
                      ),
                    ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
