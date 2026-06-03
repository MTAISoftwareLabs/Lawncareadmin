import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactUsScreen extends StatelessWidget {
  const ContactUsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white70),
          onPressed: () => Get.back(),
        ),
        backgroundColor: AppColor().alternate,
        elevation: 0,
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().primary,

        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Please Contact Via\nemail:',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColor().secondary, // Gold
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 30),
              GestureDetector(
                onTap: _launchEmail,
                child: Text(
                  'turfguyross@thelawncareworkshop.com',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColor().secondary, // Gold
                    fontSize: 18,
                    decoration: TextDecoration.underline,
                    decorationColor: AppColor().secondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _launchEmail() async {
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: 'turfguyross@thelawncareworkshop.com',
    );
    try {
      if (await canLaunchUrl(emailLaunchUri)) {
        await launchUrl(emailLaunchUri);
      } else {
        Get.snackbar("Error", "Could not open email client.");
      }
    } catch (e) {
      Get.snackbar("Error", "Could not open email client.");
    }
  }
}
