import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:get/get.dart';
import 'package:flutter/services.dart';

class DealDetailScreen extends StatelessWidget {
  final LibraryItem item;

  const DealDetailScreen({super.key, required this.item});

  Future<void> _launchUrl() async {
    final String? link = item.productLink ?? item.link;
    if (link != null && link.isNotEmpty) {
      final Uri url = Uri.parse(link);
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        print('Could not launch $url');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    double discountPercentage = item.discountPercent?.toDouble() ?? 0;
    if (discountPercentage == 0 &&
        item.originalPrice != null &&
        item.salePrice != null) {
      try {
        double original = double.parse(
          item.originalPrice!.replaceAll(RegExp(r'[^0-9.]'), ''),
        );
        double sale = double.parse(
          item.salePrice!.replaceAll(RegExp(r'[^0-9.]'), ''),
        );
        if (original > sale) {
          discountPercentage = ((original - sale) / original) * 100;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return Scaffold(
      backgroundColor: AppColor().primary,
      body: CustomScrollView(
        slivers: [
          // Elegant Header with Image
          SliverAppBar(
            expandedHeight: 400.0,
            floating: false,
            pinned: true,
            backgroundColor: AppColor().primary,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black26,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Get.back(),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black26,
                  child: Icon(
                    item.isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  _buildHeroImage(),
                  // Gradient Overlay (Bottom only for text readability)
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.3),
                          AppColor().primary,
                        ],
                        stops: const [0.7, 0.9, 1.0],
                      ),
                    ),
                  ),
                  if (discountPercentage > 0)
                    Positioned(
                      top: 100,
                      right: 20,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.redAccent,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 10,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Text(
                          '${discountPercentage.toStringAsFixed(0)}% OFF',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Category
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColor().secondary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: AppColor().secondary,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          item.category ?? 'DEAL',
                          style: TextStyle(
                            color: AppColor().secondary,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      if (item.store != null && item.store!.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white10,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white24, width: 1),
                          ),
                          child: Text(
                            item.store!.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                      ],
                      if (item.isFeatured ?? false) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.amber, width: 1),
                          ),
                          child: const Text(
                            'FEATURED',
                            style: TextStyle(
                              color: Colors.amber,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item.title,
                    style: TextStyle(
                      color: AppColor().primaryText,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Coupon Code
                  if (item.couponCode != null && item.couponCode!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.amber.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.confirmation_number,
                              color: Colors.amber,
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Coupon Code',
                                  style: TextStyle(
                                    color: Colors.white60,
                                    fontSize: 12,
                                  ),
                                ),
                                Text(
                                  item.couponCode!,
                                  style: const TextStyle(
                                    color: Colors.amber,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            TextButton(
                              onPressed: () {
                                if (item.couponCode != null) {
                                  Clipboard.setData(
                                    ClipboardData(text: item.couponCode!),
                                  );
                                  Get.snackbar(
                                    'Copied',
                                    'Coupon code copied to clipboard',
                                    snackPosition: SnackPosition.BOTTOM,
                                    backgroundColor: Colors.amber,
                                    colorText: Colors.black,
                                  );
                                }
                              },
                              child: const Text('COPY'),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Pricing Card
                  if (item.originalPrice != null || item.salePrice != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Price',
                                style: TextStyle(
                                  color: Colors.white54,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  if (item.salePrice != null)
                                    Text(
                                      '\$${item.salePrice}',
                                      style: const TextStyle(
                                        color: Colors.greenAccent,
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  if (item.originalPrice != null &&
                                      item.originalPrice != item.salePrice) ...[
                                    const SizedBox(width: 12),
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 6),
                                      child: Text(
                                        '\$${item.originalPrice}',
                                        style: const TextStyle(
                                          color: Colors.white24,
                                          fontSize: 18,
                                          decoration:
                                              TextDecoration.lineThrough,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                          const Spacer(),
                          if (discountPercentage > 0)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text(
                                  'You Save',
                                  style: TextStyle(
                                    color: Colors.white54,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${discountPercentage.toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    color: AppColor().secondary,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 24),

                  // Timeline info
                  if (item.startDate != null || item.expiresAt != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: Row(
                        children: [
                          if (item.startDate != null)
                            Expanded(
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.calendar_today,
                                    color: Colors.white54,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Start Date',
                                        style: TextStyle(
                                          color: Colors.white54,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        item.startDate!.split('T').first,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          if (item.expiresAt != null)
                            Expanded(
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.timer_outlined,
                                    color: Colors.redAccent,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Expiry Date',
                                        style: TextStyle(
                                          color: Colors.white54,
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        item.expiresAt!.split('T').first,
                                        style: const TextStyle(
                                          color: Colors.redAccent,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),

                  // Description
                  const Text(
                    'About this Product',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item.description,
                    style: const TextStyle(
                      color: Colors.white70, // Semi-transparent white
                      fontSize: 16,
                      height: 1.6,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 100), // Space for bottom button
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColor().primary,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, -10),
            ),
          ],
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: () => _launchUrl(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColor().secondary,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 60),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 8,
              shadowColor: AppColor().secondary.withOpacity(0.5),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.shopping_cart),
                SizedBox(width: 12),
                Text(
                  'Get Product',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroImage() {
    String path = item.imagePath.trim();
    if (path.isEmpty) {
      return Container(color: Colors.grey[800]);
    }

    if (path.startsWith('http') ||
        path.startsWith('https') ||
        path.startsWith('//')) {
      return Image.network(
        path.startsWith('//') ? 'https:$path' : path,
        fit: BoxFit.cover,
      );
    }

    if (path.contains('base64,')) {
      return Image.memory(
        base64Decode(path.split(',').last),
        fit: BoxFit.cover,
      );
    }

    if (!path.startsWith('assets/')) {
      return Image.network(
        'https://thelawncareworkshop.com/${path.startsWith('/') ? path.substring(1) : path}',
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Image.asset(
          'assets/images/9A5753E5-2759-4543-86EB-CD51CFCDC6F9_(1).PNG',
          fit: BoxFit.cover,
        ),
      );
    }

    return Image.asset(path, fit: BoxFit.cover);
  }
}
