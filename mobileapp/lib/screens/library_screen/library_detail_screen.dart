import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:url_launcher/url_launcher.dart';

class LibraryDetailScreen extends StatelessWidget {
  final LibraryItem item;

  const LibraryDetailScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          item.type.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Section
            Container(
              height: 300,
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(child: _buildImage()),
            ),

            // Content Section
            Container(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: TextStyle(
                      color: AppColor().secondary, // Goldish
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    height: 2,
                    width: 60,
                    decoration: BoxDecoration(
                      color: AppColor().secondary,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    item.description,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      height: 1.6,
                      letterSpacing: 0.3,
                    ),
                  ),
                  if (item.type == 'product' &&
                      (item.originalPrice != null ||
                          item.salePrice != null)) ...[
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        if (item.originalPrice != null &&
                            item.originalPrice != item.salePrice)
                          Text(
                            '\$${item.originalPrice}',
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 16,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        if (item.salePrice != null) ...[
                          if (item.originalPrice != null &&
                              item.originalPrice != item.salePrice)
                            const SizedBox(width: 10),
                          Text(
                            '\$${item.salePrice}',
                            style: const TextStyle(
                              color: Colors.greenAccent,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                  const SizedBox(height: 40),
                  if (item.productLink != null &&
                      item.productLink!.isNotEmpty) ...[
                    ElevatedButton(
                      onPressed: () async {
                        final Uri url = Uri.parse(item.productLink!);
                        if (!await launchUrl(
                          url,
                          mode: LaunchMode.externalApplication,
                        )) {
                          print('Could not launch ${item.productLink}');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColor().secondary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.shopping_cart, color: Colors.white),
                          const SizedBox(width: 8),
                          const Text(
                            'View Product',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    String path = item.imagePath.trim();
    if (path.isEmpty) {
      return Container(
        color: Colors.grey[300],
        child: const Icon(Icons.image, color: Colors.grey, size: 64),
      );
    }

    // Network Image check
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
          errorBuilder: (context, error, stackTrace) => _errorWidget(),
        );
      } catch (e) {
        // Fallback
      }
    }

    // Relative path check
    if (!path.startsWith('assets/')) {
      final String absoluteUrl =
          'https://thelawncareworkshop.com/${path.startsWith('/') ? path.substring(1) : path}';
      return Image.network(
        absoluteUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Image.asset(
            path,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => _errorWidget(),
          );
        },
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
      child: const Icon(Icons.broken_image, color: Colors.grey, size: 64),
    );
  }
}
