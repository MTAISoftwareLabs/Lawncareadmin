import 'package:flutter/foundation.dart';

class Competition {
  final String id;
  final String title;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String rules;
  final bool isActive;
  final String? prizeImage;
  final String? prize;

  Competition({
    required this.id,
    required this.title,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.rules,
    required this.isActive,
    this.prizeImage,
    this.prize,
  });

  factory Competition.fromJson(Map<String, dynamic> json) {
    final prizeImg =
        json['banner_image']?.toString() ??
        json['prizeImageUrl']?.toString() ??
        json['image']?.toString() ??
        json['prize_image']?.toString();

    print("Competition.fromJson: prizeImage=$prizeImg");

    return Competition(
      id: (json['contest_id'] ?? json['id'] ?? '0').toString(),
      title:
          json['contest_title']?.toString() ?? json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      startDate:
          DateTime.tryParse(
            json['start_date']?.toString() ??
                json['startDate']?.toString() ??
                '',
          )?.toLocal() ??
          DateTime.now(),
      endDate:
          DateTime.tryParse(
            json['end_date']?.toString() ?? json['endDate']?.toString() ?? '',
          )?.toLocal() ??
          DateTime.now(),
      rules:
          json['rules_summary']?.toString() ?? json['rules']?.toString() ?? '',
      isActive:
          json['isActive'] == true ||
          json['isActive'] == 1 ||
          json['status'] == 'active' ||
          json['status'] == 'upcoming',
      prizeImage: prizeImg,
      prize: json['prize_details']?.toString() ?? json['prize']?.toString(),
    );
  }
}

class CompetitionEntry {
  final int id;
  final int userId;
  final String userName;
  final String userImage;
  final String imageUrl;
  final String caption;
  final int votes;
  final bool isVotedByMe;

  CompetitionEntry({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userImage,
    required this.imageUrl,
    required this.caption,
    required this.votes,
    required this.isVotedByMe,
  });

  factory CompetitionEntry.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;

    if (user != null) {
      return CompetitionEntry(
        id: json['id'] ?? 0,
        userId: json['userId'] ?? user['id'] ?? 0,
        userName: user['name'] ?? 'Anonymous',
        userImage: user['avatar'] ?? '',
        imageUrl: json['imageUrl'] ?? '',
        caption: json['description'] ?? json['caption'] ?? '',
        votes: json['votes'] ?? 0,
        isVotedByMe: json['is_voted_by_me'] ?? json['isVotedByMe'] ?? false,
      );
    }

    return CompetitionEntry(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      userName: json['user_name'] ?? 'Anonymous',
      userImage: json['user_image'] ?? '',
      imageUrl: json['image_url'] ?? '',
      caption: json['caption'] ?? '',
      votes: json['votes'] ?? 0,
      isVotedByMe: json['is_voted_by_me'] ?? false,
    );
  }
}

class Winner {
  final int id;
  final String userName;
  final String userImage;
  final String competitionTitle;
  final String winningImageUrl;
  final String prize;
  final String? entryTitle;
  final String? entryDescription;
  final int? votes;
  final int? rank;
  final DateTime? createdAt;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? prizeImageUrl;

  Winner({
    required this.id,
    required this.userName,
    required this.userImage,
    required this.competitionTitle,
    required this.winningImageUrl,
    required this.prize,
    this.entryTitle,
    this.entryDescription,
    this.votes,
    this.rank,
    this.createdAt,
    this.startDate,
    this.endDate,
    this.prizeImageUrl,
  });

  factory Winner.fromJson(Map<String, dynamic> json) {
    final entry = json['entry'] as Map<String, dynamic>?;
    final user = json['user'] as Map<String, dynamic>?;
    final winnerObj = json['winner'] as Map<String, dynamic>?;
    final competition = json['competition'] as Map<String, dynamic>?;

    if (entry != null && user != null && competition != null) {
      return Winner(
        id: entry['id'] ?? 0,
        userName: user['name'] ?? 'Winner',
        userImage: user['avatar'] ?? '',
        competitionTitle: competition['title'] ?? '',
        winningImageUrl: entry['imageUrl'] ?? '',
        prize: '',
        entryTitle: entry['title'],
        entryDescription: entry['description'],
        votes: entry['votes'],
        rank: entry['rank'],
        createdAt: entry['createdAt'] != null
            ? DateTime.tryParse(entry['createdAt'])?.toLocal()
            : null,
      );
    }

    return Winner(
      id: (json['competition_id'] ?? json['id'] ?? 0) as int,
      userName: winnerObj?['name'] ?? json['user_name'] ?? 'Winner',
      userImage: winnerObj?['avatar'] ?? json['user_image'] ?? '',
      competitionTitle: json['competition_title'] ?? json['title'] ?? '',
      winningImageUrl: json['entry_image'] ?? json['winning_image_url'] ?? '',
      prize: json['prize']?.toString() ?? '',
      entryTitle: json['entry_title'],
      entryDescription: json['entry_description'] ?? json['description'],
      votes: json['votes'],
      rank: json['rank'],
      prizeImageUrl: json['prize_image_url'],
      startDate: json['start_date'] != null
          ? DateTime.tryParse(json['start_date'])?.toLocal()
          : null,
      endDate: json['end_date'] != null
          ? DateTime.tryParse(json['end_date'])?.toLocal()
          : null,
    );
  }
}
