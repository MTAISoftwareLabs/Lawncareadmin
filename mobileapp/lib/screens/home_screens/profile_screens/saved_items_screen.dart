import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/saved_items_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/screens/library_screen/library_item_card.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/utils/appcolor.dart';

class SavedItemsScreen extends StatelessWidget {
  const SavedItemsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final SavedItemsCtrl controller = Get.put(SavedItemsCtrl());

    return Scaffold(
      backgroundColor: AppColor().alternate,
      appBar: AppBar(
        backgroundColor: AppColor().primary, // Darker header
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Get.back(),
        ),
        title: const Text(
          'Your Saved Items',
          style: TextStyle(
            color: Color(0xFFC7A940), // Gold/Yellow text
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: Color(0xFFC7A940)),
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection("Start Here!", controller.expertCornerItems),
              _buildSection("Tips & Tricks", controller.tipsTricksItems),
              _buildSection("Equipment", controller.equipmentItems),
              _buildSection("Soil & Water", controller.soilWaterItems),
              _buildSection("Fert & Herbicide", controller.fertHerbItems),
              _buildSection(
                "Insects & Disease ID",
                controller.insectsDiseaseItems,
              ),
              // _buildSection("Deals", controller.dealsItems), // Optional if deals are savable
              const SizedBox(height: 40),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSection(String title, List<BaseHomeItem> items) {
    // User requested sections to be present ("phlye se ho"), so we don't hide if empty.
    // However, if empty, we might want to show a placeholder or just the header with empty list?
    // User said "show the text" if empty in previous request.
    // Let's show header and if empty, a text saying "No saved items".

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Center(
            child: Text(
              title,
              style: const TextStyle(
                color: Color(0xFFC7A940), // Gold text
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        if (items.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Center(
              child: Text(
                "No saved $title",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 14,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          )
        else
          SizedBox(
            height: 180,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 15),
              itemCount: items.length,
              itemBuilder: (context, index) {
                return _buildItemCard(items[index]);
              },
            ),
          ),
        const SizedBox(height: 10),
      ],
    );
  }

  Widget _buildItemCard(BaseHomeItem item) {
    // Map BaseHomeItem to LibraryItem to reuse the card
    final libraryItem = LibraryItem(
      id: item.id,
      title: item.name,
      description: item.description,
      imagePath:
          item.mediaUrl, // mediaUrl holds the image path from saving logic
      isFavorite: true, // Always true in Saved Items screen
      link: item.mediaUrl,
      type: item.type,
      category: item.category,
      productLink: item.productLink,
    );

    // Using Container to constrain width in horizontal list
    return Container(
      width: 150,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      child: LibraryItemCard(
        item: libraryItem,
        onFavoritePressed: () {
          // Allow unsaving from this screen
          Get.find<SavedItemsCtrl>().toggleSave(item);
        },
      ),
    );
  }
}
