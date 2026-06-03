import 'package:flutter/material.dart';

import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/screens/library_screen/library_screen.dart';

class ExpertsCornerScreen extends StatelessWidget {
  ExpertsCornerScreen({super.key});

  // Dummy Data matching the image
  final List<LibraryItem> dummyItems = [
    LibraryItem(
      title: 'Controlling Thatch: Keep It in Check',
      description: 'Learn how to manage thatch for a healthier lawn.',
      imagePath: 'assets/images/3290DC10-BF83-4D9A-88EC-931FA78F2F17.png',
      isFavorite: true,
      type: 'article',
    ),
    LibraryItem(
      title: 'Weed Identification and Control',
      description: 'Identify common weeds and how to eliminate them.',
      imagePath: 'assets/images/25b710a6-ec41-40fe-877b-313a54fd4632.jpg',
      isFavorite: true,
      type: 'article',
    ),
    LibraryItem(
      title: 'Creating a Watering Schedule for Golf Course-Level Lawns',
      description: 'Master the art of irrigation for professional results.',
      imagePath: 'assets/images/45A4DA78-59C3-48C5-9B2F-3855C5207997.png',
      isFavorite: true,
      type: 'video',
      link:
          'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4',
    ),
    LibraryItem(
      title: 'Sustainable Lawn Care Practices for Long-Term Success',
      description: 'Eco-friendly tips for a beautiful, resilient lawn.',
      imagePath:
          'assets/images/DALLE_2025-01-17_10.33.58_-_A_vibrant_digital_illustration_showcasing_the_concept_of_lawn_fertilizer._The_image_features_a_lush,_green_lawn_with_rich,_healthy_grass._In_the_foreg.jpg',
      isFavorite: true,
      type: 'article',
    ),
    LibraryItem(
      title: 'NPK Understanding',
      description: 'Understand Nitrogen, Phosphorus, and Potassium balance.',
      imagePath:
          'assets/images/DALLE_2025-01-17_10.55.28_-_A_detailed_and_modern_illustration_of_a_lawn_care_calendar._The_image_features_a_digital-style_calendar_interface_overlaid_on_a_vibrant_green_lawn_bac.jpg',
      isFavorite: true,
      type: 'video',
      link:
          'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
    ),
    LibraryItem(
      title: 'Soil Testing Guide',
      description: 'How to test and improve your soil quality.',
      imagePath: 'assets/images/88CBF600-C82C-4F4A-9D65-91A7EDA0887D.png',
      isFavorite: false,
      type: 'product',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return LibraryScreen(title: 'Start Here!', items: dummyItems);
  }
}
