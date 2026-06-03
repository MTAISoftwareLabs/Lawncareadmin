import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/search_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_texfield.dart';

class SearchScreen extends StatelessWidget {
  SearchScreen({super.key});

  final SearchCtrl controller = Get.put(SearchCtrl(), permanent: true);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColor().primary,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Text(
          'Search',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: AppColor().secondary,
          ),
        ),
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 10),
                CustomeTextField(
                  controller: controller.searchController,
                  hintText: 'Search categories...',
                  obscureText: false,
                  color: Colors.white.withOpacity(0.1),
                ),
                const SizedBox(height: 30),
                Obx(() {
                  if (controller.isSearching.value &&
                      controller.searchResults.isEmpty) {
                    return Center(
                      child: Text(
                        'No categories found',
                        style: TextStyle(
                          color: AppColor().secondary,
                          fontSize: 18,
                        ),
                      ),
                    );
                  }

                  if (!controller.isSearching.value) {
                    return Center(
                      child: Text(
                        'Type to search for features...',
                        style: TextStyle(color: Colors.grey[400], fontSize: 16),
                      ),
                    );
                  }

                  return Expanded(
                    child: GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                            childAspectRatio: 3,
                          ),
                      itemCount: controller.searchResults.length,
                      itemBuilder: (context, index) {
                        final result = controller.searchResults[index];
                        return GestureDetector(
                          onTap: () => controller.handleNavigation(result),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColor().secondary, // Gold/Yellow
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 5,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                result,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: AppColor().primary, // Dark green
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
