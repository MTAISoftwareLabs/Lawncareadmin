import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lawn_care/screens/library_screen/library_detail_screen.dart';
import 'package:lawn_care/screens/library_screen/deal_detail_screen.dart';
import 'package:lawn_care/screens/library_screen/video_player_screen.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:get/get.dart';

class LibraryItemCard extends StatelessWidget {
  final LibraryItem item;
  final VoidCallback? onFavoritePressed;

  const LibraryItemCard({
    super.key,
    required this.item,
    this.onFavoritePressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Check if explicitly marked as video
        bool isVideoContent = item.type.toLowerCase() == 'video';
        String? videoUrl = item.link;

        // Auto-detect video from Link URL extension
        if (item.link != null && item.link!.isNotEmpty) {
          final lowerLink = item.link!.toLowerCase();
          if (lowerLink.endsWith('.mp4') ||
              lowerLink.endsWith('.mov') ||
              lowerLink.endsWith('.avi') ||
              lowerLink.endsWith('.mkv') ||
              lowerLink.endsWith('.webm')) {
            isVideoContent = true;
          }
        }

        // Auto-detect from ImagePath if link is missing or ambiguous
        if (!isVideoContent && (videoUrl == null || videoUrl.isEmpty)) {
          final lowerPath = item.imagePath.toLowerCase();
          if (lowerPath.endsWith('.mp4') ||
              lowerPath.endsWith('.mov') ||
              lowerPath.endsWith('.webm')) {
            isVideoContent = true;
            if (!item.imagePath.startsWith('http') &&
                !item.imagePath.startsWith('assets/')) {
              videoUrl =
                  'https://thelawncareworkshop.com/${item.imagePath.startsWith('/') ? item.imagePath.substring(1) : item.imagePath}';
            } else {
              videoUrl = item.imagePath;
            }
          }
        }

        if (isVideoContent && videoUrl != null && videoUrl.isNotEmpty) {
          Get.to(
            () => VideoPlayerScreen(videoUrl: videoUrl!, title: item.title),
          );
        } else if (item.category == 'Deals' || item.type == 'product') {
          Get.to(() => DealDetailScreen(item: item));
        } else {
          Get.to(() => LibraryDetailScreen(item: item));
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColor().secondaryBackground,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: AppColor().secondary, width: 1.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Section
            Expanded(
              flex: 3,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(13),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(13),
                  ),
                  child: Stack(fit: StackFit.expand, children: [_buildImage()]),
                ),
              ),
            ),
            // Content Section
            Expanded(
              flex: 2,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                        maxWidth: constraints.maxWidth,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(10.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ..._buildContentRow(),
                            if (item.type == 'product' &&
                                (item.description.isNotEmpty ||
                                    item.originalPrice != null ||
                                    item.salePrice != null))
                              ..._buildProductDetails(),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildContentRow() {
    return [
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              item.title,
              style: TextStyle(
                color: AppColor().primaryText,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          GestureDetector(
            onTap: onFavoritePressed,
            child: Icon(
              item.isFavorite ? Icons.favorite : Icons.favorite_border,
              color: Colors.white,
              size: 20,
            ),
          ),
        ],
      ),
    ];
  }

  List<Widget> _buildProductDetails() {
    return [
      const SizedBox(height: 4),
      if (item.description.isNotEmpty)
        Text(
          item.description,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      if (item.originalPrice != null || item.salePrice != null)
        Row(
          children: [
            if (item.originalPrice != null &&
                item.originalPrice != item.salePrice)
              Text(
                '\$${item.originalPrice}',
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 10,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            if (item.salePrice != null) ...[
              if (item.originalPrice != null &&
                  item.originalPrice != item.salePrice)
                const SizedBox(width: 4),
              Text(
                '\$${item.salePrice}',
                style: const TextStyle(
                  color: Colors.greenAccent,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
    ];
  }

  Widget _buildImage() {
    String path = item.imagePath.trim();
    if (path.isEmpty) {
      return Container(
        color: Colors.grey[300],
        child: Icon(Icons.image, color: Colors.grey[600]),
      );
    }

    // Network Image check - be more inclusive
    if (path.startsWith('http') ||
        path.startsWith('https') ||
        path.startsWith('//')) {
      final String url = path.startsWith('//') ? 'https:$path' : path;
      return Image.network(
        url,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          color: Colors.grey[300],
          child: Icon(Icons.broken_image, color: Colors.grey[600]),
        ),
      );
    }

    // Handle base64
    if (path.contains('base64,') ||
        (path.length > 100 && !path.contains('/'))) {
      try {
        final String base64Data = path.contains(',')
            ? path.split(',').last.trim()
            : path;
        return Image.memory(
          base64Decode(base64Data),
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            color: Colors.grey[300],
            child: Icon(Icons.broken_image, color: Colors.grey[600]),
          ),
        );
      } catch (e) {
        // Fallback to asset if decoding fails
      }
    }

    // If it doesn't look like an asset path (doesn't start with 'assets/'),
    // try prepending the base domain as it might be a relative path from API.
    if (!path.startsWith('assets/')) {
      final String absoluteUrl =
          'https://thelawncareworkshop.com/${path.startsWith('/') ? path.substring(1) : path}';
      return Image.network(
        absoluteUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          // If the network attempt fails, try it as an asset just in case
          return Image.asset(
            path,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              color: Colors.grey[300],
              child: Icon(Icons.broken_image, color: Colors.grey[600]),
            ),
          );
        },
      );
    }

    // Final fallback to asset
    return Image.asset(
      path,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        color: Colors.grey[300],
        child: Icon(Icons.broken_image, color: Colors.grey[600]),
      ),
    );
  }
}
