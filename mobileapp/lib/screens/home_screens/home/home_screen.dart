import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lawn_care/screens/deals/deals_list_screen.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/screens/library_screen/library_screen.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:lawn_care/screens/library_screen/lawn_library_screen.dart';
import 'package:lawn_care/screens/self_diagnosis/self_diagnosis_screen.dart';
import 'package:lawn_care/screens/home_screens/calendar_screens/choose_lawn_screen.dart';
import 'package:lawn_care/controllers/subscription_ctrl.dart';
import 'package:lawn_care/screens/subscription_screen/subscription_screen.dart';
import 'package:lawn_care/screens/home_screens/ai_chat_screen.dart';
import 'package:lawn_care/widgets/weather_banner.dart';
import 'package:lawn_care/widgets/soil_temp_banner.dart';
import 'package:lawn_care/screens/home_screens/weed_id_screen.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/widgets/guest_login_dialog.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  final HomeCtrl controller = Get.put(HomeCtrl(), permanent: true);
  final ProfileCtrl profilecontroller = Get.put(ProfileCtrl(), permanent: true);

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
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          }

          final homeData = controller.homeData.value?.data;

          return SingleChildScrollView(
            padding: const EdgeInsets.only(top: 50, left: 20, right: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome,${profilecontroller.userName.value}',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: AppColor().primaryText,
                  ),
                ),
                const SizedBox(height: 15),
                SizedBox(
                  height: 180,
                  // PageView is NOT inside Obx so it never gets rebuilt when
                  // subscription status changes (which would reset page to 0
                  // and detach the pageController, breaking auto-slide).
                  // Individual banners that depend on subscription use their
                  // own Obx internally.
                  child: PageView.builder(
                    controller: controller.pageController,
                    onPageChanged: controller.updateCarouselIndex,
                    itemCount: 3,
                    itemBuilder: (context, index) {
                        if (index == 0) {
                          // First banner: branded image with graceful fallback
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 5),
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.3),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: Image.asset(
                              'assets/images/carouselheader.png',
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          AppColor().alternate,
                                          AppColor().primary,
                                        ],
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                      ),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        Icons.grass,
                                        color: AppColor().secondary,
                                        size: 60,
                                      ),
                                    ),
                                  ),
                            ),
                          );
                        }

                        if (index == 1) {
                          // Each subscription-gated banner uses its own Obx
                          // so only that item rebuilds when status changes,
                          // not the whole PageView.
                          return Obx(() {
                            if (!SubscriptionCtrl.to.isSubscribed.value) {
                              return _buildPaywallBanner(
                                "Weather Updates",
                                "Subscribe to see real-time weather info",
                              );
                            }
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 5),
                              child: WeatherBanner(
                                weather: controller.weatherData.value,
                                isLoading: controller.isWeatherLoading.value,
                                error: controller.weatherError.value.isNotEmpty
                                    ? controller.weatherError.value
                                    : null,
                              ),
                            );
                          });
                        }

                        if (index == 2) {
                          return Obx(() {
                            if (!SubscriptionCtrl.to.isSubscribed.value) {
                              return _buildPaywallBanner(
                                "Soil Temperature",
                                "Subscribe to see real-time soil temp info",
                              );
                            }
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 5),
                              child: SoilTempBanner(
                                soilData: controller.soilTempData.value,
                                isLoading: controller.isSoilTempLoading.value,
                                error: controller.soilTempError.value.isNotEmpty
                                    ? controller.soilTempError.value
                                    : null,
                              ),
                            );
                          });
                        }

                        // Fallback: shouldn't be reached with totalCount=3
                        final dataIndex = index - 3;
                        String bannerUrl;
                        String title = "Lawncare Workshop";
                        final data = controller.homeData.value?.data;

                        if (data != null && data.banners.isNotEmpty) {
                          if (dataIndex < data.banners.length) {
                            bannerUrl = data.banners[dataIndex].imageUrl;
                            title = data.banners[dataIndex].title;
                          } else {
                            bannerUrl = controller.bannerImages[
                                dataIndex % controller.bannerImages.length];
                          }
                        } else {
                          bannerUrl = controller.bannerImages[
                              dataIndex % controller.bannerImages.length];

                        }

                        Widget bannerChild;
                        if (bannerUrl.startsWith('data:image')) {
                          try {
                            final base64String = bannerUrl.split(',').last;
                            bannerChild = Image.memory(
                              base64Decode(base64String),
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (ctx, e, st) =>
                                  _buildBannerFallback(title),
                            );
                          } catch (_) {
                            bannerChild = _buildBannerFallback(title);
                          }
                        } else if (bannerUrl.startsWith('https')) {
                          bannerChild = Image.network(
                            bannerUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                            errorBuilder: (ctx, e, st) =>
                                _buildBannerFallback(title),
                          );
                        } else {
                          bannerChild =
                              Image.asset(
                            bannerUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                            errorBuilder: (ctx, e, st) =>
                                _buildBannerFallback(title),
                          );
                        }

                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 5),
                          clipBehavior: Clip.antiAlias,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(15),
                            color: Colors.black,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              bannerChild,
                              Center(
                                child: Text(
                                  title,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    shadows: [
                                      Shadow(
                                        blurRadius: 10.0,
                                        color: Colors.black,
                                        offset: Offset(2.0, 2.0),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 10),

                Obx(() {
                  const totalCount = 3;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      totalCount,
                      (index) => Padding(
                        padding: const EdgeInsets.only(right: 5),
                        child: _buildDot(
                          index == controller.carouselIndex.value,
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 10),
                Divider(color: AppColor().primary, thickness: 3),
                GridView.builder(
                  padding: EdgeInsets.zero,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
              //      print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa${ _categories[5]['image']!}");
                    return GestureDetector(
                      onTap: () {
                        final title = _categories[index]['title'];
                        _handleNavigation(title!, homeData);
                      },
                      child: _buildCategoryItem(
                        _categories[index],
                        "${_categories[index]['image']!}",
                      ),
                    );
                  },
                ),
                const SizedBox(height: 20),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildBannerFallback(String title) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColor().alternate, AppColor().primary],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildPaywallBanner(String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 5),
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColor().primary, width: 1),
      ),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_outline, color: AppColor().primary, size: 30),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => Get.to(() => const SubscriptionScreen()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColor().primary,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                minimumSize: const Size(0, 32),
              ),
              child: const Text(
                "Subscribe Now",
                style: TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDot(bool isActive) {
    return Container(
      height: 8,
      width: 8,
      decoration: BoxDecoration(
        color: isActive ? AppColor().primary : Colors.grey.withOpacity(0.5),
        shape: BoxShape.circle,
      ),
    );
  }

  // Category grid item — uses Image.asset with an errorBuilder so that
  // missing or corrupt assets gracefully show a gradient placeholder instead
  // of a blank/broken container.
  Widget _buildCategoryItem(Map<String, String> category, String image) {
    // Outer Container draws the border at borderRadius(15).
    // Inner ClipRRect clips content at borderRadius(13) = 15 - border_width(2),
    // so the image corners sit flush with the inside edge of the border and
    // there is no "strange cut-off" artefact at the corners.
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: AppColor().primary, width: 2),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(13),
        child: Stack(
          fit: StackFit.expand,
          children: [
            image.startsWith("https")?
            Image.network(
              image,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColor().alternate, AppColor().primary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            )
            :
            Image.asset(
              image,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColor().alternate, AppColor().primary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                width: double.infinity,
                color: AppColor().primaryfix,
                padding: const EdgeInsets.all(6.0),
                child: Text(
                  category['title']!,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleNavigation(String title, HomeData? homeData) {
    final StorageService storage = Get.find<StorageService>();

    if (title != 'Start Here!' && storage.isGuest()) {
      GuestLoginDialog.show();
      return;
    }

    const libraryCategories = [
      'Start Here!',
      'Tips & Tricks',
      'Equipment',
      'Fert & Herb',
      'Deals',
      'Soil & Water',
      'Insects & Disease ID',
    ];

    if (title == 'Lawn Library') {
      if (!SubscriptionCtrl.to.isSubscribed.value) {
        Get.to(() => const SubscriptionScreen());
        return;
      }
      Get.to(() => const LawnLibraryScreen());
      return;
    }

    if (title == 'Self Diagnosis') {
      if (!SubscriptionCtrl.to.isSubscribed.value) {
        Get.to(() => const SubscriptionScreen());
        return;
      }
      Get.to(() => const SelfDiagnosisScreen());
      return;
    }

    if (title == 'Calendar') {
      if (!SubscriptionCtrl.to.isSubscribed.value) {
        Get.to(() => const SubscriptionScreen());
        return;
      }
      Get.to(() => const ChooseLawnScreen());
      return;
    }

    if (libraryCategories.contains(title)) {
      if (title == 'Deals') {
        Get.to(() => const DealsListScreen());
        return;
      }

      if (title != 'Start Here!' && !SubscriptionCtrl.to.isSubscribed.value) {
        Get.to(() => const SubscriptionScreen());
        return;
      }

      final items = _getItemsForCategory(title, homeData);
      List<String> tabs = const ['Articles', 'Videos', 'Products'];
      if (title == 'Tips & Tricks') {
        tabs = const ['Future', 'Maintenance', 'Advanced'];
      }

      Get.to(
        () => LibraryScreen(
          title: title,
          tabs: tabs,
          items: items,
          showTabs: true,
          showHeader: true,
        ),
      );
    } else {
      const premiumScreens = [
        'Lawn Library',
        'Self Diagnosis',
        'AI Weed ID',
        'Ask AI',
      ];
      if (premiumScreens.contains(title) &&
          !SubscriptionCtrl.to.isSubscribed.value) {
        Get.to(() => const SubscriptionScreen());
        return;
      }

      if (title == 'Ask AI') {
        Get.to(() => const AiChatScreen());
        return;
      }

      if (title == 'AI Weed ID') {
        Get.to(() => const WeedIdScreen());
        return;
      }

      Get.to(
        () => Scaffold(
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
            child: SafeArea(
              child: Column(
                children: [
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
                              title,
                              style: TextStyle(
                                color: AppColor().secondary,
                                fontSize: 24,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 40),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Center(
                      child: Text(
                        "$title Coming Soon",
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }
  }

  List<LibraryItem> _getItemsForCategory(String title, HomeData? homeData) {
    if (homeData == null) return [];

    switch (title) {
      case 'Start Here!':
        return homeData.expertCorner
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Tips & Tricks':
        return homeData.tipsTricks
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Equipment':
        return homeData.equipments
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Fert & Herb':
        return homeData.fertilizerHerbicide
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Soil & Water':
        return homeData.soilWater
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Insects & Disease ID':
        return homeData.insectsDisease
            .map(
              (e) => LibraryItem(
                title: e.name,
                description: e.description,
                imagePath:
                    (e.thumbnailUrl != null && e.thumbnailUrl!.isNotEmpty)
                    ? e.thumbnailUrl!
                    : e.mediaUrl,
                isFavorite: false,
                link: e.mediaUrl,
                type: e.type,
                category: title,
                productLink: e.productLink,
              ),
            )
            .toList();
      case 'Deals':
        return homeData.deals
            .map(
              (e) => LibraryItem(
                title: e.title,
                description: e.description ?? e.title,
                imagePath: (e.imageUrl != null && e.imageUrl!.isNotEmpty)
                    ? e.imageUrl!
                    : 'assets/images/logo.png',
                isFavorite: false,
                link: e.link,
                type: 'product',
                category: title,
                productLink: e.affiliateLink ?? e.link,
                originalPrice: e.originalPrice,
                salePrice: e.salePrice,
              ),
            )
            .toList();
      default:
        return [];
    }
  }

  final List<Map<String, String>> _categories = const [
    {
      'title': 'Start Here!',
      'image': 'assets/images/3290DC10-BF83-4D9A-88EC-931FA78F2F17.png',
    },
    {
      'title': 'Tips & Tricks',
      'image': 'assets/images/25b710a6-ec41-40fe-877b-313a54fd4632.jpg',
    },
    {
      'title': 'Equipment',
      'image': 'assets/images/45A4DA78-59C3-48C5-9B2F-3855C5207997.png',
    },
    {
      'title': 'Fert & Herb',
      'image':
          'assets/images/DALLE_2025-01-17_10.33.58_-_A_vibrant_digital_illustration_showcasing_the_concept_of_lawn_fertilizer._The_image_features_a_lush,_green_lawn_with_rich,_healthy_grass._In_the_foreg.jpg',
    },
    {
      'title': 'Calendar',
      'image':
          'assets/images/DALLE_2025-01-17_10.55.28_-_A_detailed_and_modern_illustration_of_a_lawn_care_calendar._The_image_features_a_digital-style_calendar_interface_overlaid_on_a_vibrant_green_lawn_bac.jpg',
    },
    {
      'title': 'Deals',
      'image': 'assets/images/88CBF600-C82C-4F4A-9D65-91A7EDA0887D.png',
    },
    {
      'title': 'Soil & Water',
      'image':
          'assets/images/DALLE_2025-01-17_10.44.40_-_A_realistic_and_vibrant_digital_illustration_showcasing_lawn_soil_and_irrigation._The_image_features_a_cross-sectional_view_of_a_healthy_green_lawn,_r.jpg',
    },
    {
      'title': 'Ask AI',
      'image':
          'assets/images/DALLE_2025-01-13_20.00.16_-_A_visually_engaging_and_modern_image_designed_to_represent_an_AI-powered_question-and-answer_feature_for_a_lawn_care_app._The_foreground_features_a_sl.jpg',
    },
    {
      'title': 'Self Diagnosis',
      'image':
          'assets/images/DALLE_2025-01-17_10.48.27_-_A_visually_engaging_digital_illustration_representing_a_user-friendly_interface_for_self-diagnosing_lawn_problems_using_dropdown_menus._The_image_feat.jpg',
    },
    {
      'title': 'AI Weed ID',
      'image':
          'assets/images/DALLE_2025-01-17_11.21.32_-_A_modern_and_sleek_digital_design_featuring_the_text_AI_Weed_ID_prominently_displayed._The_text_is_styled_with_clean,_futuristic_fonts_in_shades_of_.jpg',
    },
    {
      'title': 'Lawn Library',
      'image':
          'assets/images/DALLE_2025-01-17_11.32.51_-_A_vibrant_digital_design_featuring_the_text_Grass_ID_prominently_displayed_in_a_clean_and_modern_font._The_text_is_styled_in_shades_of_fresh_green_a.jpg',
    },
    {
      'title': 'Insects & Disease ID',
      'image':
          'assets/images/DALLE_2025-01-18_16.39.00_-_A_detailed_and_educational_digital_illustration_for_lawn_care,_prominently_featuring_the_words_Insects_and_Disease_ID_in_bold,_modern_font._The_desi.jpg',
    },
  ];
}
