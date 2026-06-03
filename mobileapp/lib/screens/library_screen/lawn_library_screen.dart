import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:url_launcher/url_launcher.dart';

class LawnLibraryScreen extends GetView<HomeCtrl> {
  const LawnLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          // Using a placeholder or appropriate bg if available, otherwise gradient
          gradient: LinearGradient(
            colors: [AppColor().primary, AppColor().accent4],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          image: const DecorationImage(
            image: AssetImage(
              'assets/images/3290DC10-BF83-4D9A-88EC-931FA78F2F17.png',
            ),
            fit: BoxFit.cover,
            opacity: 0.15, // Subtle background effect
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    CostomeBackBotton(onPressed: () => Get.back()),
                    Expanded(
                      child: Center(
                        child: Text(
                          'Lawn Library',
                          style: TextStyle(
                            color: AppColor().secondary, // Gold color
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 40), // Balance
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Library Content
              Expanded(
                child: Obx(() {
                  final libraryItems =
                      controller.homeData.value?.data.lawnLibrary ?? [];

                  if (libraryItems.isEmpty) {
                    return const Center(
                      child: Text(
                        "No library items available",
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: libraryItems.length,
                    itemBuilder: (context, index) {
                      final item = libraryItems[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 25.0),
                        child: Column(
                          children: [
                            // Book Cover Container
                            GestureDetector(
                              onTap: () async {
                                if (item.downloadUrl.isNotEmpty) {
                                  String urlStr = item.downloadUrl.trim();
                                  if (!urlStr.startsWith('http')) {
                                    urlStr =
                                        'https://thelawncareworkshop.com/${urlStr.startsWith('/') ? urlStr.substring(1) : urlStr}';
                                  }
                                  final url = Uri.parse(urlStr);
                                  try {
                                    bool launched = await launchUrl(
                                      url,
                                      mode: LaunchMode.externalApplication,
                                    );
                                    if (!launched) {
                                      Get.snackbar(
                                        "Error",
                                        "Could not open PDF. Please try again.",
                                        snackPosition: SnackPosition.BOTTOM,
                                        backgroundColor: Colors.redAccent,
                                        colorText: Colors.white,
                                      );
                                    }
                                  } catch (e) {
                                    Get.snackbar(
                                      "Error",
                                      "An error occurred while opening the PDF.",
                                      snackPosition: SnackPosition.BOTTOM,
                                      backgroundColor: Colors.redAccent,
                                      colorText: Colors.white,
                                    );
                                  }
                                }
                              },
                              child: Container(
                                height: 300,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 10,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(15.0),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: Image.network(
                                      item.imageUrl.startsWith('http')
                                          ? item.imageUrl
                                          : 'https://thelawncareworkshop.com/${item.imageUrl.startsWith('/') ? item.imageUrl.substring(1) : item.imageUrl}',
                                      fit: BoxFit.contain,
                                      loadingBuilder:
                                          (context, child, loadingProgress) {
                                            if (loadingProgress == null)
                                              return child;
                                            return const Center(
                                              child:
                                                  CircularProgressIndicator(),
                                            );
                                          },
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                            return const Center(
                                              child: Icon(
                                                Icons.book,
                                                size: 100,
                                                color: Colors.grey,
                                              ),
                                            );
                                          },
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 15),
                            // Download Button
                            SizedBox(
                              width: 150,
                              height: 45,
                              child: ElevatedButton(
                                onPressed: () async {
                                  if (item.downloadUrl.isNotEmpty) {
                                    String urlStr = item.downloadUrl.trim();
                                    if (!urlStr.startsWith('http')) {
                                      urlStr =
                                          'https://thelawncareworkshop.com/${urlStr.startsWith('/') ? urlStr.substring(1) : urlStr}';
                                    }
                                    final url = Uri.parse(urlStr);
                                    try {
                                      bool launched = await launchUrl(
                                        url,
                                        mode: LaunchMode.externalApplication,
                                      );
                                      if (!launched) {
                                        Get.snackbar(
                                          "Error",
                                          "Could not open download link.",
                                          snackPosition: SnackPosition.BOTTOM,
                                          backgroundColor: Colors.redAccent,
                                          colorText: Colors.white,
                                        );
                                      }
                                    } catch (e) {
                                      Get.snackbar(
                                        "Error",
                                        "An error occurred while launching. ${e.toString()}",
                                        snackPosition: SnackPosition.BOTTOM,
                                        backgroundColor: Colors.redAccent,
                                        colorText: Colors.white,
                                      );
                                    }
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(
                                    0xFF1D4339,
                                  ), // Dark green
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  elevation: 5,
                                ),
                                child: Text(
                                  'Download',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: Get.width * 0.04,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
