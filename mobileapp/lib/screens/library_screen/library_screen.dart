import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/screens/library_screen/library_item_card.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/screens/library_screen/library_tabs.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';
import 'package:lawn_care/controllers/home_ctrls/saved_items_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';

class LibraryScreen extends StatelessWidget {
  final String title;
  final List<String> tabs;
  final List<LibraryItem> items;
  final bool showTabs;
  final bool showHeader;

  LibraryScreen({
    super.key,
    required this.title,
    this.tabs = const ['Articles', 'Videos', 'Products'],
    required this.items,
    this.showTabs = true,
    this.showHeader = true,
  });

  final RxInt selectedTabIndex = 1.obs; // Default to 'Videos' as per image
  final TextEditingController searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    Get.put(SavedItemsCtrl()); // Ensure controller is available
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().alternate, AppColor().accent5],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
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
                          title,
                          style: TextStyle(
                            color: AppColor().primaryText,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 40), // Balance the back button
                  ],
                ),
              ),

              const SizedBox(height: 10),

              // Tabs
              if (showTabs)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 0),
                  child: LibraryTabs(
                    tabs: tabs,
                    selectedIndex: selectedTabIndex,
                    onTabSelected: (index) {
                      selectedTabIndex.value = index;
                    },
                  ),
                ),
              if (showTabs) const SizedBox(height: 15),

              // Library Header
              if (showHeader)
                Text(
                  'Library',
                  style: TextStyle(
                    color: AppColor().primaryText,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              if (showHeader) const SizedBox(height: 10),

              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: CustomeTextField(
                  controller: searchController,
                  hintText: 'Search',
                  obscureText: false,
                ),
              ),
              const SizedBox(height: 20),

              // Grid Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Obx(() {
                    // Mapping "Articles" -> "article", "Videos" -> "video", "Products" -> "product"
                    // Special case for "Articles" -> "article" (already handled by replaceAll('s', ''))
                    // Special case for "Videos" -> "video"
                    // Special case for "Products" -> "product"

                    String targetLabel = tabs[selectedTabIndex.value]
                        .toLowerCase();
                    String targetType = targetLabel;

                    if (targetLabel == 'articles') targetType = 'article';
                    if (targetLabel == 'videos') targetType = 'video';
                    if (targetLabel == 'products') targetType = 'product';
                    if (targetLabel == 'maintenance') {
                      targetType = 'maintenance';
                      // Also match 'maintance' if the tab is 'Maintenance'
                    }
                    // For Tips & Tricks custom tabs, we can also handle potential variations
                    if (targetLabel == 'advanced')
                      targetType = 'advanced'; // Standard
                    if (targetLabel == 'advance')
                      targetType = 'advance'; // Backup

                    final filteredItems = items.where((item) {
                      // Filter by search query first if search text is not empty
                      final searchText = searchController.text.toLowerCase();
                      if (searchText.isNotEmpty &&
                          !item.title.toLowerCase().contains(searchText)) {
                        return false;
                      }

                      if (!showTabs) return true;

                      final itemType = item.type.toLowerCase().trim();
                      bool matchesTargetType =
                          itemType == targetType || itemType == targetLabel;
                      if (targetLabel == 'maintenance') {
                        matchesTargetType =
                            matchesTargetType || itemType == 'maintance';
                      }
                      if (targetLabel == 'advanced' ||
                          targetLabel == 'advance') {
                        matchesTargetType =
                            matchesTargetType ||
                            itemType == 'advanced' ||
                            itemType == 'advance';
                      }
                      return matchesTargetType;
                    }).toList();

                    if (filteredItems.isEmpty) {
                      return Center(
                        child: Text(
                          showTabs
                              ? "No ${tabs[selectedTabIndex.value]} available"
                              : "No items available",
                          style: TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      );
                    }

                    return GridView.builder(
                      itemCount: filteredItems.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 15,
                            mainAxisSpacing: 15,
                            childAspectRatio:
                                1.1, // Adjust based on card content
                          ),
                      itemBuilder: (context, index) {
                        final item = filteredItems[index];
                        final savedValues = Get.find<SavedItemsCtrl>();

                        // We need a stable ID. If item.id is null, use title as ID (fallback)
                        final itemId = item.id ?? item.title;

                        return Obx(() {
                          final isSaved = savedValues.isSaved(itemId);

                          return LibraryItemCard(
                            item: item.copyWith(isFavorite: isSaved),
                            onFavoritePressed: () {
                              // Map LibraryItem to BaseHomeItem for storage
                              // We use ExpertCornerItem as a generic container as decided in controller
                              final baseItem = ExpertCornerItem(
                                id: itemId,
                                type: item.type,
                                name: item.title,
                                description: item.description,
                                mediaUrl:
                                    item.imagePath, // Use imagePath as mediaUrl
                                createdAt: DateTime.now().toIso8601String(),
                                thumbnailUrl: item.imagePath,
                                category: item.category, // Pass Category
                                productLink: item.productLink,
                              );
                              savedValues.toggleSave(baseItem);
                            },
                          );
                        });
                      },
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
