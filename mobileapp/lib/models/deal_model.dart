class DealModel {
  final int id;
  final String title;
  final String description;
  final String originalPrice;
  final String salePrice;
  final double discountPercent;
  final String image;
  final String? store;
  final String? storeUrl;
  final String? affiliateLink;
  final String? category;
  final String? couponCode;
  final String? startDate;
  final String? expiresAt;
  final bool isFeatured;
  final bool isActive;
  final String createdAt;
  final String imageUrl;

  DealModel({
    required this.id,
    required this.title,
    required this.description,
    required this.originalPrice,
    required this.salePrice,
    required this.discountPercent,
    required this.image,
    this.store,
    this.storeUrl,
    this.affiliateLink,
    this.category,
    this.couponCode,
    this.startDate,
    this.expiresAt,
    this.isFeatured = false,
    this.isActive = true,
    required this.createdAt,
    required this.imageUrl,
  });

  factory DealModel.fromJson(Map<String, dynamic> json) {
    return DealModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      originalPrice: json['originalPrice']?.toString() ?? '0.00',
      salePrice: json['salePrice']?.toString() ?? '0.00',
      discountPercent: (json['discountPercent'] ?? 0).toDouble(),
      image: json['image'] ?? '',
      store: json['store'],
      storeUrl: json['storeUrl'],
      affiliateLink: json['affiliateLink'] ?? json['affiliate_link'],
      category: json['category'],
      couponCode: json['couponCode'],
      startDate: json['startDate'] ?? json['start_date'],
      expiresAt: json['expiresAt'] ?? json['expires_at'],
      isFeatured: json['isFeatured'] ?? false,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] ?? json['created_at'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image'] ?? '',
    );
  }

  String get absoluteImageUrl {
    if (imageUrl.startsWith('http')) return imageUrl;
    return 'https://thelawncareworkshop.com/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}';
  }
}
