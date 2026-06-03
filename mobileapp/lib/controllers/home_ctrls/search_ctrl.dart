import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/screens/home_screens/calendar_screens/choose_lawn_screen.dart';
import 'package:lawn_care/screens/library_screen/lawn_library_screen.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/screens/library_screen/library_screen.dart';
import 'package:lawn_care/screens/self_diagnosis/self_diagnosis_screen.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

class SearchCtrl extends GetxController {
  final TextEditingController searchController = TextEditingController();
  final HomeCtrl homeCtrl = Get.find<HomeCtrl>();

  var searchResults = <String>[].obs;
  var isSearching = false.obs;

  final List<String> allCategories = [
    'Start Here!',
    'Tips & Tricks',
    'Equipment',
    'Fert & Herbicide',
    'Calendar',
    'Deals',
    'Soil & Water',
    'Ask AI',
    'Self Diagnosis',
    'AI Weed ID',
    'Lawn Library',
    'Insects & Disease ID',
  ];

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      performSearch(searchController.text);
    });
  }

  void performSearch(String query) {
    if (query.isEmpty) {
      searchResults.clear();
      isSearching.value = false;
      return;
    }

    isSearching.value = true;
    searchResults.value = allCategories
        .where((cat) => cat.toLowerCase().contains(query.toLowerCase()))
        .toList();
  }

  void handleNavigation(String title) {
    final homeData = homeCtrl.homeData.value?.data;

    // List of categories that should use the LibraryScreen
    const libraryCategories = [
      'Start Here!',
      'Tips & Tricks',
      'Equipment',
      'Fert & Herbicide',
      'Deals',
      'Soil & Water',
      'Insects & Disease ID',
    ];

    if (title == 'Lawn Library') {
      Get.to(() => const LawnLibraryScreen());
      return;
    }

    if (title == 'Self Diagnosis') {
      Get.to(() => const SelfDiagnosisScreen());
      return;
    }

    if (title == 'Calendar') {
      Get.to(() => const ChooseLawnScreen());
      return;
    }

    if (libraryCategories.contains(title)) {
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
          showTabs: title != 'Deals',
          showHeader: title != 'Deals',
        ),
      );
    } else {
      // Placeholder for other screens
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
              ),
            )
            .toList();
      case 'Fert & Herbicide':
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
              ),
            )
            .toList();
      case 'Deals':
        return homeData.deals
            .map(
              (e) => LibraryItem(
                title: e.title,
                description: e.description ?? '',
                imagePath: (e.imageUrl != null && e.imageUrl!.isNotEmpty)
                    ? e.imageUrl!
                    : 'assets/images/logo.png',
                isFavorite: false,
                link: e.link,
                type: 'product',
                originalPrice: e.originalPrice,
                salePrice: e.salePrice,
              ),
            )
            .toList();
      default:
        return [];
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
