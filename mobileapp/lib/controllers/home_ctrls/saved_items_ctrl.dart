import 'dart:convert';
import 'package:get/get.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SavedItemsCtrl extends GetxController {
  var isLoading = false.obs;

  // Categories matching Home Sections
  var expertCornerItems = <BaseHomeItem>[].obs;
  var tipsTricksItems = <BaseHomeItem>[].obs;
  var equipmentItems = <BaseHomeItem>[].obs;
  var soilWaterItems = <BaseHomeItem>[].obs;
  var fertHerbItems = <BaseHomeItem>[].obs;
  var insectsDiseaseItems = <BaseHomeItem>[].obs;
  var dealsItems =
      <BaseHomeItem>[].obs; // Just in case, though usually products

  var savedItemsMap = <String, BaseHomeItem>{}.obs;

  @override
  void onInit() {
    super.onInit();
    loadSavedItems();
  }

  Future<void> loadSavedItems() async {
    isLoading.value = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? savedString = prefs.getString('local_saved_items');

      if (savedString != null) {
        final List<dynamic> decoded = jsonDecode(savedString);
        savedItemsMap.clear();

        for (var itemJson in decoded) {
          try {
            final item = _parseItem(itemJson);
            if (item != null) {
              savedItemsMap[item.id] = item;
            }
          } catch (e) {
            print("Error parsing saved item: $e");
          }
        }
        _categorizeItemsFromMap();
      }
    } catch (e) {
      print("Error loading saved items: $e");
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleSave(BaseHomeItem item) async {
    if (savedItemsMap.containsKey(item.id)) {
      savedItemsMap.remove(item.id);
      Get.snackbar('Removed', 'Item removed from saved items');
    } else {
      savedItemsMap[item.id] = item;
      Get.snackbar('Saved', 'Item saved successfully');
    }

    _categorizeItemsFromMap();
    await _persistItems();
  }

  bool isSaved(String id) {
    return savedItemsMap.containsKey(id);
  }

  Future<void> _persistItems() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<Map<String, dynamic>> list = savedItemsMap.values
          .map((e) => _itemToJson(e))
          .toList();
      await prefs.setString('local_saved_items', jsonEncode(list));
    } catch (e) {
      print("Error persisting items: $e");
    }
  }

  void _categorizeItemsFromMap() {
    // Clear existing
    expertCornerItems.clear();
    tipsTricksItems.clear();
    equipmentItems.clear();
    soilWaterItems.clear();
    fertHerbItems.clear();
    insectsDiseaseItems.clear();
    dealsItems.clear();

    for (var item in savedItemsMap.values) {
      // Prioritize explicit Category if available
      if (item.category != null && item.category!.isNotEmpty) {
        final cat = item.category!;
        if (cat == 'Start Here!') {
          expertCornerItems.add(item);
          continue;
        } else if (cat == 'Tips & Tricks') {
          tipsTricksItems.add(item);
          continue;
        } else if (cat == 'Equipment') {
          equipmentItems.add(item);
          continue;
        } else if (cat == 'Soil & Water') {
          soilWaterItems.add(item);
          continue;
        } else if (cat == 'Fert & Herbicide') {
          fertHerbItems.add(item);
          continue;
        } else if (cat == 'Insects & Disease ID') {
          insectsDiseaseItems.add(item);
          continue;
        } else if (cat == 'Deals') {
          dealsItems.add(item);
          continue;
        }
      }

      // Fallback to Type/Name Logic if category is missing (backward compatibility)
      final type = item.type.toLowerCase();

      // Exact matches from Home Data types
      if (type == 'expert_corner' || type == 'expert-question') {
        expertCornerItems.add(item);
      } else if (type == 'tips_tricks') {
        tipsTricksItems.add(item);
      } else if (type == 'equipment') {
        equipmentItems.add(item);
      } else if (type == 'soil_water') {
        soilWaterItems.add(item);
      } else if (type == 'fertilizer_herbicide') {
        fertHerbItems.add(item);
      } else if (type == 'insects_disease') {
        insectsDiseaseItems.add(item);
      } else if (type == 'deals') {
        dealsItems.add(item);
      } else {
        if (item.name.toLowerCase().contains('insect') ||
            item.name.toLowerCase().contains('disease')) {
          insectsDiseaseItems.add(item);
        } else if (item.name.toLowerCase().contains('soil') ||
            item.name.toLowerCase().contains('water')) {
          soilWaterItems.add(item);
        } else {
          expertCornerItems.add(item);
        }
      }
    }
  }

  // Deprecated fetch from API, keeping for reference or unused
  Future<void> fetchSavedItems() async {
    // implementation replaced by local storage
  }

  Map<String, dynamic> _itemToJson(BaseHomeItem item) {
    return {
      'id': item.id,
      'type': item.type,
      'name': item.name,
      'description': item.description,
      'media_url': item.mediaUrl,
      'created_at': item.createdAt,
      'category': item.category, // Save Category
      if (item is ExpertCornerItem) 'thumbnail_url': item.thumbnailUrl,
      if (item is TipsTricksItem) 'thumbnail_url': item.thumbnailUrl,
    };
  }

  BaseHomeItem? _parseItem(Map<String, dynamic> json) {
    // Utilize existing factory methods if possible or generic BaseHomeItem
    // Determining which subclass to use based on type/table
    String type = json['type'] ?? '';

    // Quick mapping attempt
    if (type == 'expert_corner') return ExpertCornerItem.fromJson(json);
    if (type == 'tips_tricks') return TipsTricksItem.fromJson(json);
    if (type == 'equipment') return EquipmentItem.fromJson(json);
    if (type == 'fertilizer_herbicide')
      return FertilizerHerbicideItem.fromJson(json);
    if (type == 'soil_water') return SoilWaterItem.fromJson(json);
    if (type == 'insects_disease') return InsectsDiseaseItem.fromJson(json);

    // Fallback manual creation if type doesn't match known ones perfectly but has fields
    return ExpertCornerItem.fromJson(json); // Use generic container
  }
}
