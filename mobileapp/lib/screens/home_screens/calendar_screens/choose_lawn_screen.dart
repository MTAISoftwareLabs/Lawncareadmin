import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/screens/home_screens/calendar_screens/lawn_calendar_screen.dart';

class ChooseLawnScreen extends GetView<HomeCtrl> {
  const ChooseLawnScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: AppColor().alternate,
        elevation: 0,
        title: Text(
          'Choose Your Lawn',
          style: TextStyle(
            color: AppColor().primaryText,
            fontSize: 24,
            fontWeight: FontWeight.w400,
          ),
        ),
      ),
      // The body is a Stack: gradient fills the entire screen behind a
      // scrollable column so EVERYTHING (subtitle + all cards) scrolls.
      body: Stack(
        children: [
          // Full-screen gradient background
          Container(
            height: double.infinity,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColor().primary, AppColor().accent4],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          // Scrollable content on top of the gradient
          SafeArea(
            child: Obx(() {
              final calendars =
                  controller.homeData.value?.data.calendars ?? [];

              if (calendars.isEmpty) {
                return const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                );
              }

              // AlwaysScrollableScrollPhysics ensures the view scrolls even
              // when content is shorter than the screen (pulls-to-refresh feel
              // and consistent behaviour across devices).
              return SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(25, 20, 25, 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Select your turf type to get a customized care calendar',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Each card is rendered directly in the column — no
                    // additional wrapping container that could trap gestures.
                    ...calendars.map((item) => _buildLawnCard(item)),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildLawnCard(CalendarItem item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      // behavior: opaque makes every pixel of the card's bounding box
      // register a tap, including transparent/empty areas.
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => Get.to(() => LawnCalendarScreen(item: item)),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1D4339).withOpacity(0.88),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.white.withOpacity(0.15),
              width: 1,
            ),
          ),
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Thumbnail
              Container(
                height: 100,
                width: 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.all(2),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: _buildImage(item.imageUrl),
                ),
              ),
              const SizedBox(width: 14),
              // Title + Open button
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 14),
                    // "Open" pill — high-contrast amber/gold so it pops
                    // against the dark green card background.
                    Container(
                      height: 38,
                      width: 110,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5A623),   // warm amber
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.25),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Open',
                        style: TextStyle(
                          color: Colors.black87,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Chevron — visual affordance for tappability
              const Icon(
                Icons.chevron_right,
                color: Colors.white54,
                size: 28,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImage(String path) {
    path = path.trim();
    if (path.isEmpty) {
      return Container(
        color: Colors.grey[300],
        child: const Icon(Icons.grass, size: 50, color: Colors.grey),
      );
    }

    if (path.startsWith('http') ||
        path.startsWith('https') ||
        path.startsWith('//')) {
      final String url = path.startsWith('//') ? 'https:$path' : path;
      return Image.network(
        url,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _errorWidget(),
      );
    }

    if (path.contains('base64,') ||
        (path.length > 100 && !path.contains('/'))) {
      try {
        final String base64Data =
            path.contains(',') ? path.split(',').last.trim() : path;
        return Image.memory(
          base64Decode(base64Data),
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _errorWidget(),
        );
      } catch (_) {}
    }

    if (!path.startsWith('assets/')) {
      final String absoluteUrl =
          'https://thelawncareworkshop.com/${path.startsWith('/') ? path.substring(1) : path}';
      return Image.network(
        absoluteUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Image.asset(
          path,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _errorWidget(),
        ),
      );
    }

    return Image.asset(
      path,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => _errorWidget(),
    );
  }

  Widget _errorWidget() {
    return Container(
      color: Colors.grey[300],
      child: const Icon(Icons.grass, size: 50, color: Colors.grey),
    );
  }
}
