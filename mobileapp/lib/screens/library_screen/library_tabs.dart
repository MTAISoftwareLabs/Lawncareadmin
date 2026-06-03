import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';

class LibraryTabs extends StatelessWidget {
  final List<String> tabs;
  final RxInt selectedIndex;
  final Function(int) onTabSelected;

  const LibraryTabs({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 45,
      decoration: BoxDecoration(
        color: AppColor().primary, // Background for the whole tab bar
        // borderRadius: BorderRadius.circular(10), // Optional if you want rounded container
      ),
      child: Row(
        children: List.generate(tabs.length, (index) {
          return Expanded(
            child: Obx(() {
              bool isSelected = selectedIndex.value == index;
              return GestureDetector(
                onTap: () => onTabSelected(index),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColor().secondary
                        : Colors.transparent, // Gold for selected
                    borderRadius: BorderRadius.circular(5),
                  ),
                  margin: const EdgeInsets.all(2),
                  child: Center(
                    child: Text(
                      tabs[index],
                      style: TextStyle(
                        color: isSelected
                            ? AppColor().primary
                            : AppColor().secondary, // Text color flip
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              );
            }),
          );
        }),
      ),
    );
  }
}
