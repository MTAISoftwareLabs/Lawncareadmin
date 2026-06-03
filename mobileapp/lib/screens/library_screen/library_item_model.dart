class LibraryItem {
  final String? id;
  final String title;
  final String description;
  final String imagePath;
  final bool isFavorite;
  final String? link;
  final String type; // e.g., 'article', 'video', 'product'
  final String? category; // Added category field
  final String? productLink;
  final String? originalPrice;
  final String? salePrice;

  // New fields for deals
  final int? discountPercent;
  final String? store;
  final String? storeUrl;
  final String? affiliateLink;
  final String? couponCode;
  final String? startDate;
  final String? expiresAt;
  final bool? isFeatured;
  final bool? isActive;
  final String? createdAt;

  LibraryItem({
    this.id,
    required this.title,
    required this.description,
    required this.imagePath,
    this.isFavorite = false,
    this.link,
    required this.type,
    this.category,
    this.productLink,
    this.originalPrice,
    this.salePrice,
    this.discountPercent,
    this.store,
    this.storeUrl,
    this.affiliateLink,
    this.couponCode,
    this.startDate,
    this.expiresAt,
    this.isFeatured,
    this.isActive,
    this.createdAt,
  });

  factory LibraryItem.fromDealJson(Map<String, dynamic> json) {
    String imgUrl = json['imageUrl'] ?? json['image'] ?? '';

    return LibraryItem(
      id: json['id']?.toString(),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imagePath: imgUrl,
      type: 'product',
      category: json['category'] ?? 'Deals',
      link:
          json['affiliateLink'] ??
          json['affiliate_link'] ??
          json['storeUrl'] ??
          '',
      productLink:
          json['affiliateLink'] ??
          json['affiliate_link'] ??
          json['storeUrl'] ??
          '',
      originalPrice: json['originalPrice']?.toString(),
      salePrice: json['salePrice']?.toString(),
      discountPercent: json['discountPercent'] is int
          ? json['discountPercent']
          : int.tryParse(json['discountPercent']?.toString() ?? ''),
      store: json['store'],
      storeUrl: json['storeUrl'],
      affiliateLink: json['affiliateLink'] ?? json['affiliate_link'],
      couponCode: json['couponCode'],
      startDate: json['startDate'] ?? json['start_date'],
      expiresAt: json['expiresAt'] ?? json['expires_at'],
      isFeatured: json['isFeatured'],
      isActive: json['isActive'],
      createdAt: json['createdAt'],
    );
  }

  LibraryItem copyWith({
    String? id,
    String? title,
    String? description,
    String? imagePath,
    bool? isFavorite,
    String? link,
    String? type,
    String? category,
    String? productLink,
    String? originalPrice,
    String? salePrice,
    int? discountPercent,
    String? store,
    String? storeUrl,
    String? affiliateLink,
    String? couponCode,
    String? startDate,
    String? expiresAt,
    bool? isFeatured,
    bool? isActive,
    String? createdAt,
  }) {
    return LibraryItem(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imagePath: imagePath ?? this.imagePath,
      isFavorite: isFavorite ?? this.isFavorite,
      link: link ?? this.link,
      type: type ?? this.type,
      category: category ?? this.category,
      productLink: productLink ?? this.productLink,
      originalPrice: originalPrice ?? this.originalPrice,
      salePrice: salePrice ?? this.salePrice,
      discountPercent: discountPercent ?? this.discountPercent,
      store: store ?? this.store,
      storeUrl: storeUrl ?? this.storeUrl,
      affiliateLink: affiliateLink ?? this.affiliateLink,
      couponCode: couponCode ?? this.couponCode,
      startDate: startDate ?? this.startDate,
      expiresAt: expiresAt ?? this.expiresAt,
      isFeatured: isFeatured ?? this.isFeatured,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
