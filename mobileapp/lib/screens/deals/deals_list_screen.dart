import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/screens/deals/widgets/deal_card.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

class DealsListScreen extends StatelessWidget {
  const DealsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeCtrl homeCtrl = Get.find<HomeCtrl>();

    return Scaffold(
      backgroundColor: AppColor().primary,
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().primary, AppColor().accent5],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    CostomeBackBotton(onPressed: () => Get.back()),
                    const Expanded(
                      child: Center(
                        child: Text(
                          'Exclusive Deals',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 40),
                  ],
                ),
              ),

              // Subtitle
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  children: [
                    Text(
                      'Best offers for your lawn',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 14,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const Spacer(),
                    Icon(
                      Icons.local_offer_outlined,
                      color: AppColor().secondary,
                      size: 20,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Deals List
              Expanded(
                child: Obx(() {
                  if (homeCtrl.isDealsLoading.value &&
                      homeCtrl.newDeals.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (homeCtrl.newDeals.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.shopping_bag_outlined,
                            size: 60,
                            color: Colors.white.withOpacity(0.2),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No deals available right now',
                            style: TextStyle(color: Colors.white54),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () => homeCtrl.fetchDeals(),
                    color: AppColor().secondary,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      itemCount: homeCtrl.newDeals.length,
                      itemBuilder: (context, index) {
                        return DealCard(deal: homeCtrl.newDeals[index]);
                      },
                    ),
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
