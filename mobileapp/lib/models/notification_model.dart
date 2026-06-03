class NotificationModel {
  final int id;
  final String title;
  final String message;
  final String type;
  final String? imageUrl;
  final String? link;
  final bool isRead;
  final String createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.imageUrl,
    this.link,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'push',
      imageUrl: json['imageUrl'] ?? json['image_url'],
      link: json['link'],
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      createdAt: json['createdAt'] ?? json['created_at'] ?? '',
    );
  }
}
