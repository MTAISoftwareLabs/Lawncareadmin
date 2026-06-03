import 'package:flutter/material.dart';
import 'package:lawn_care/models/deal_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:get/get.dart';
import 'package:lawn_care/screens/library_screen/deal_detail_screen.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';

class DealCard extends StatelessWidget {
  final DealModel deal;

  const DealCard({super.key, required this.deal});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Map DealModel back to LibraryItem for the existing detail screen
        // or we could create a new detail screen too, but user didn't explicitly ask for a new detail screen.
        // For compatibility with the updated DealDetailScreen:
        final item = LibraryItem(
          id: deal.id.toString(),
          title: deal.title,
          description: deal.description,
          imagePath: deal.imageUrl,
          type: 'product',
          category: deal.category ?? 'Deals',
          originalPrice: deal.originalPrice,
          salePrice: deal.salePrice,
          discountPercent: deal.discountPercent.toInt(),
          store: deal.store,
          storeUrl: deal.storeUrl,
          affiliateLink: deal.affiliateLink,
          link: deal.affiliateLink ?? deal.storeUrl,
          productLink: deal.affiliateLink ?? deal.storeUrl,
          couponCode: deal.couponCode,
          startDate: deal.startDate,
          expiresAt: deal.expiresAt,
          isFeatured: deal.isFeatured,
          createdAt: deal.createdAt,
        );
        Get.to(() => DealDetailScreen(item: item));
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppColor().secondaryBackground,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Stack
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(
                    deal.absoluteImageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey[900],
                      child: const Icon(
                        Icons.broken_image,
                        color: Colors.white24,
                        size: 40,
                      ),
                    ),
                  ),
                ),
                // Discount Badge
                if (deal.discountPercent > 0)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.redAccent,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        '${deal.discountPercent.toInt()}% OFF',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                // Category Label
                if (deal.category != null)
                  Positioned(
                    bottom: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColor().secondary.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        deal.category!.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          deal.title,
                          style: TextStyle(
                            color: AppColor().primaryText,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (deal.store != null)
                        Text(
                          deal.store!,
                          style: TextStyle(
                            color: AppColor().secondary.withOpacity(0.8),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    deal.description,
                    style: const TextStyle(color: Colors.white60, fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Text(
                        '\$${deal.salePrice}',
                        style: const TextStyle(
                          color: Colors.greenAccent,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '\$${deal.originalPrice}',
                        style: const TextStyle(
                          color: Colors.white24,
                          fontSize: 16,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColor().secondary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'VIEW DEAL',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
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
    );
  }
}
