import 'package:flutter/material.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/screens/library_screen/library_screen.dart';
import 'package:lawn_care/screens/deals/deals_list_screen.dart';

// Reusable empty list for now, or populate with dummy data if desired
final List<LibraryItem> _defaultItems = [
  LibraryItem(
    title: 'Sample Item 1',
    description: 'This is a sample description for item 1.',
    imagePath: 'assets/images/25b710a6-ec41-40fe-877b-313a54fd4632.jpg',
    isFavorite: false,
    type: 'article',
  ),
  LibraryItem(
    title: 'Sample Item 2',
    description: 'This is a sample description for item 2.',
    imagePath: 'assets/images/88CBF600-C82C-4F4A-9D65-91A7EDA0887D.png',
    isFavorite: true,
    type: 'video',
    link: 'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4',
  ),
];

class TipsAndTricksScreen extends StatelessWidget {
  const TipsAndTricksScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return LibraryScreen(title: 'Tips & Tricks', items: _defaultItems);
  }
}

class EquipmentScreen extends StatelessWidget {
  const EquipmentScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return LibraryScreen(title: 'Equipment', items: _defaultItems);
  }
}

class FertAndHerbicideScreen extends StatelessWidget {
  const FertAndHerbicideScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return LibraryScreen(title: 'Fert & Herbicide', items: _defaultItems);
  }
}

class DealsScreen extends StatelessWidget {
  const DealsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const DealsListScreen();
  }
}

class SoilAndWaterScreen extends StatelessWidget {
  const SoilAndWaterScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return LibraryScreen(title: 'Soil & Water', items: _defaultItems);
  }
}
