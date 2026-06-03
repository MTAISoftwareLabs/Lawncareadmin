import 'package:flutter/foundation.dart';

class Chat {
  final String id;
  final String userName;
  final String? userImage;
  final String? lastMessage;
  final DateTime updatedAt;
  final int unreadCount;
  final String? recipientId;

  Chat({
    required this.id,
    required this.userName,
    this.userImage,
    this.lastMessage,
    required this.updatedAt,
    this.unreadCount = 0,
    this.recipientId,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    final userData =
        json['participant'] ??
        json['user'] ??
        json['recipient'] ??
        json['recipient_user'];
    String name = 'User';
    String? rId;
    String? avatar;

    if (userData is Map) {
      name =
          userData['username'] ??
          userData['name'] ??
          userData['display_name'] ??
          'User';
      rId = userData['id']?.toString() ?? userData['user_id']?.toString();
      avatar =
          userData['user_image'] ??
          userData['avatar'] ??
          userData['image_url'] ??
          userData['image'];
    } else {
      name = json['username'] ?? json['name'] ?? json['chat_name'] ?? 'User';
      rId =
          json['recipient_id']?.toString() ??
          json['recipientId']?.toString() ??
          json['user_id']?.toString();
      avatar = json['user_image'] ?? json['avatar'] ?? json['image_url'];
    }

    if (rId == "1" ||
        name.toLowerCase().contains("admin") ||
        name.toLowerCase() == "support" ||
        name.toLowerCase().contains("expert")) {
      name = "TurfguyRoss";
    }

    print("Chat.fromJson: recipientId=$rId name=$name");

    final lastMsgData =
        json['lastMessage'] ?? json['last_message'] ?? json['message'];
    String? messageText;
    if (lastMsgData is Map) {
      messageText =
          lastMsgData['content'] ??
          lastMsgData['message'] ??
          lastMsgData['text'];
    } else {
      messageText = lastMsgData?.toString();
    }

    return Chat(
      id: (json['conversationId'] ??
                json['id'] ??
                json['conversation_id'] ??
                json['chat_id'])
            ?.toString() ??
        '',
      userName: name,
      userImage: avatar,
      lastMessage: messageText,
      updatedAt:
          DateTime.tryParse(
            json['lastMessageAt'] ??
                json['time'] ??
                json['updated_at'] ??
                json['updatedAt'] ??
                json['created_at'] ??
                '',
          )?.toLocal() ??
          DateTime.now(),
      unreadCount:
          json['unreadCount'] ?? json['unread_count'] ?? 0,
      recipientId: rId,
    );
  }
}

class Message {
  final String id;
  final String senderId;
  final String senderName;
  final String senderRole;
  final String content;
  final String type;
  final String? fileUrl;
  final DateTime createdAt;
  final bool isRead;
  final bool isMe;

  Message({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.content,
    this.type = 'text',
    this.fileUrl,
    required this.createdAt,
    this.isRead = false,
    this.isMe = false,
  });

  factory Message.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    final senderId =
        (json['sender_id'] ??
                json['user_id'] ??
                json['senderId'] ??
                json['user']?['id'])
            ?.toString() ??
        '';

    final senderName =
        (json['sender']?['name'] ??
                json['user']?['username'] ??
                json['user']?['name'] ??
                json['sender_name'] ??
                'User')
            .toString();

    String role =
        (json['sender_role'] ??
                json['role'] ??
                json['user']?['role'] ??
                json['sender_type'] ??
                '')
            .toString()
            .toLowerCase();

    if (role.isEmpty || role == "user") {
      final nameLower = senderName.toLowerCase();
      if (senderId == "1" ||
          nameLower.contains("admin") ||
          nameLower.contains("support") ||
          nameLower.contains("expert")) {
        role = "admin";
      } else {
        role = "user";
      }
    }

    final createdAtStr =
        json['created_at'] ??
        json['createdAt'] ??
        json['time'] ??
        json['date'] ??
        '';

    String content = json['content'] ?? json['message'] ?? json['text'] ?? '';
    String? fileUrl =
        json['mediaUrl'] ??
        json['file_url'] ??
        json['file'] ??
        json['imageUrl'] ??
        json['image'] ??
        json['attachment'];

    if (fileUrl == null || fileUrl.isEmpty) {
      final urlRegex = RegExp(
        r'(https?://[^\s]+|/(?:uploads|storage|media)/[^\s]+)',
      );
      final match = urlRegex.firstMatch(content);
      if (match != null) {
        fileUrl = match.group(0);
        content = content.replaceFirst(fileUrl!, '').trim();
        content = content
            .replaceFirst(RegExp(r'ATTACHMENT:\s*$', multiLine: true), '')
            .trim();
        content = content
            .replaceFirst(RegExp(r'FILE:\s*$', multiLine: true), '')
            .trim();
      }
    }

    String finalType =
        json['type'] ??
        json['messageType'] ??
        (fileUrl != null ? 'image' : 'text');

    return Message(
      id: (json['id'] ?? json['message_id'])?.toString() ?? '',
      senderId: senderId,
      senderName: senderName,
      senderRole: role,
      content: content,
      type: finalType,
      fileUrl: fileUrl,
      createdAt: DateTime.tryParse(createdAtStr)?.toLocal() ?? DateTime.now(),
      isRead: json['is_read'] ?? json['isRead'] ?? json['read'] ?? false,
      isMe:
          json['isMine'] ??
          (currentUserId != null ? (senderId == currentUserId) : false),
    );
  }
}
