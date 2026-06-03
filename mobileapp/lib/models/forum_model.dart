class ForumPost {
  final String postId;
  final ForumAuthor author;
  final String content;
  final List<String> imageUrls;
  final int likesCount;
  final int commentsCount;
  final bool isLikedByMe;
  final DateTime createdAt;

  ForumPost({
    required this.postId,
    required this.author,
    required this.content,
    required this.imageUrls,
    required this.likesCount,
    required this.commentsCount,
    required this.isLikedByMe,
    required this.createdAt,
  });

  factory ForumPost.fromJson(Map<String, dynamic> json) {
    final dynamic contentData = json['content'];
    String parsedContent = '';
    List<String> parsedImageUrls = [];

    if (contentData is Map) {
      parsedContent =
          contentData['text'] ??
          contentData['content'] ??
          contentData['body'] ??
          '';
      parsedImageUrls = List<String>.from(
        contentData['image_urls'] ??
            contentData['images'] ??
            contentData['media'] ??
            [],
      );
    } else {
      parsedContent =
          contentData?.toString() ?? json['text'] ?? json['body'] ?? '';

      // Prioritize top-level image_urls if flat
      if (json['image_urls'] != null) {
        parsedImageUrls = List<String>.from(json['image_urls']);
      } else if (json['images'] != null) {
        parsedImageUrls = List<String>.from(json['images']);
      } else if (json['image_url'] != null) {
        parsedImageUrls = [json['image_url'].toString()];
      } else if (json['url'] != null &&
          (json['url'].toString().contains('.jpg') ||
              json['url'].toString().contains('.png'))) {
        parsedImageUrls = [json['url'].toString()];
      } else if (json['image'] != null) {
        parsedImageUrls = [json['image'].toString()];
      }
    }

    return ForumPost(
      postId: json['post_id']?.toString() ?? '',
      author: ForumAuthor.fromJson(json['author'] ?? json),
      content: parsedContent,
      imageUrls: parsedImageUrls,
      likesCount:
          json['likes_count'] ??
          json['total_likes'] ??
          json['statistics']?['total_likes'] ??
          json['stats']?['likes_count'] ??
          json['likesCount'] ??
          json['likes'] ??
          0,
      commentsCount:
          json['comments_count'] ??
          json['total_comments'] ??
          json['statistics']?['total_comments'] ??
          json['stats']?['comments_count'] ??
          json['commentsCount'] ??
          json['comments'] ??
          0,
      isLikedByMe:
          json['is_liked'] ?? json['isLiked'] ?? json['liked'] ?? false,
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ).toLocal(),
    );
  }
}

class ForumAuthor {
  final String userId;
  final String userName;
  final String userImage;

  ForumAuthor({
    required this.userId,
    required this.userName,
    required this.userImage,
  });

  factory ForumAuthor.fromJson(dynamic json) {
    if (json is! Map) {
      return ForumAuthor(
        userId: '',
        userName: json?.toString() ?? 'User',
        userImage: '',
      );
    }
    return ForumAuthor(
      userId:
          (json['user_id'] ?? json['id'] ?? json['userId'] ?? json['author_id'])
              ?.toString() ??
          '',
      userName:
          json['user_name'] ??
          json['name'] ??
          json['username'] ??
          json['full_name'] ??
          json['author_name'] ??
          json['display_name'] ??
          'User',
      userImage:
          json['user_image'] ??
          json['image'] ??
          json['avatar'] ??
          json['profile_image'] ??
          json['author_image'] ??
          '',
    );
  }
}

class ForumComment {
  final String commentId;
  final ForumAuthor author;
  final String content;
  final List<String> imageUrls;
  final DateTime createdAt;

  ForumComment({
    required this.commentId,
    required this.author,
    required this.content,
    required this.imageUrls,
    required this.createdAt,
  });

  factory ForumComment.fromJson(Map<String, dynamic> json) {
    final dynamic contentData = json['content'];
    String parsedContent = '';
    List<String> parsedImageUrls = [];

    if (contentData is Map) {
      parsedContent = contentData['text'] ??
          contentData['content'] ??
          contentData['body'] ??
          contentData['message'] ??
          '';
      parsedImageUrls = List<String>.from(
        contentData['image_urls'] ??
            contentData['images'] ??
            contentData['media'] ??
            [],
      );
    } else {
      parsedContent = contentData?.toString() ??
          json['text'] ??
          json['body'] ??
          json['message'] ??
          '';

      // Prioritize top-level image_urls if flat
      if (json['image_urls'] != null) {
        parsedImageUrls = List<String>.from(json['image_urls']);
      } else if (json['images'] != null) {
        parsedImageUrls = List<String>.from(json['images']);
      }
    }

    return ForumComment(
      commentId: json['comment_id']?.toString() ?? '',
      author: ForumAuthor.fromJson(json['author'] ?? json),
      content: parsedContent,
      imageUrls: parsedImageUrls,
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ).toLocal(),
    );
  }
}
