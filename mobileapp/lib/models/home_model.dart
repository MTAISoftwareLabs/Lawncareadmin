class HomeDataModel {
  final bool success;
  final HomeData data;

  HomeDataModel({required this.success, required this.data});

  factory HomeDataModel.fromJson(Map<String, dynamic> json) {
    return HomeDataModel(
      success: json['success'] ?? false,
      data: HomeData.fromJson(json['data'] ?? {}),
    );
  }
}

class HomeData {
  final List<BannerItem> banners;
  final List<ExpertCornerItem> expertCorner;
  final List<TipsTricksItem> tipsTricks;
  final List<EquipmentItem> equipments;
  final List<FertilizerHerbicideItem> fertilizerHerbicide;
  final List<SoilWaterItem> soilWater;
  final List<InsectsDiseaseItem> insectsDisease;
  final List<DealItem> deals;
  final List<CalendarItem> calendars;
  final List<SelfDiagnosisItem> selfDiagnosis;
  final List<LawnLibraryItem> lawnLibrary;

  HomeData({
    required this.banners,
    required this.expertCorner,
    required this.tipsTricks,
    required this.equipments,
    required this.fertilizerHerbicide,
    required this.soilWater,
    required this.insectsDisease,
    required this.deals,
    required this.calendars,
    required this.selfDiagnosis,
    required this.lawnLibrary,
  });

  factory HomeData.fromJson(Map<String, dynamic> json) {
    return HomeData(
      banners: (json['banners'] as List? ?? [])
          .map((i) => BannerItem.fromJson(i))
          .toList(),
      expertCorner: (json['expert_corner'] as List? ?? [])
          .map((i) => ExpertCornerItem.fromJson(i))
          .toList(),
      tipsTricks: (json['tips_tricks'] as List? ?? [])
          .map((i) => TipsTricksItem.fromJson(i))
          .toList(),
      equipments: (json['equipments'] as List? ?? [])
          .map((i) => EquipmentItem.fromJson(i))
          .toList(),
      fertilizerHerbicide: (json['fertilizer_herbicide'] as List? ?? [])
          .map((i) => FertilizerHerbicideItem.fromJson(i))
          .toList(),
      soilWater: (json['soil_water'] as List? ?? [])
          .map((i) => SoilWaterItem.fromJson(i))
          .toList(),
      insectsDisease: (json['insects_disease'] as List? ?? [])
          .map((i) => InsectsDiseaseItem.fromJson(i))
          .toList(),
      deals: (json['deals'] as List? ?? [])
          .map((i) => DealItem.fromJson(i))
          .toList(),
      calendars: (json['calenders'] as List? ?? [])
          .map((i) => CalendarItem.fromJson(i))
          .toList(),
      selfDiagnosis: (json['self_diagnosis'] as List? ?? [])
          .map((i) => SelfDiagnosisItem.fromJson(i))
          .toList(),
      lawnLibrary: (json['lawn_library'] as List? ?? [])
          .map((i) => LawnLibraryItem.fromJson(i))
          .toList(),
    );
  }
}

abstract class BaseHomeItem {
  final String id;
  final String type;
  final String name;
  final String description;
  final String mediaUrl;
  final String createdAt;
  final String? category; // Added category field
  final String? productLink;

  BaseHomeItem({
    required this.id,
    required this.type,
    required this.name,
    required this.description,
    required this.mediaUrl,
    required this.createdAt,
    this.category,
    this.productLink,
  });
}

class ExpertCornerItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  ExpertCornerItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory ExpertCornerItem.fromJson(Map<String, dynamic> json) {
    return ExpertCornerItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class TipsTricksItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  TipsTricksItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory TipsTricksItem.fromJson(Map<String, dynamic> json) {
    return TipsTricksItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class EquipmentItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  EquipmentItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory EquipmentItem.fromJson(Map<String, dynamic> json) {
    return EquipmentItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class FertilizerHerbicideItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  FertilizerHerbicideItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory FertilizerHerbicideItem.fromJson(Map<String, dynamic> json) {
    return FertilizerHerbicideItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class SoilWaterItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  SoilWaterItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory SoilWaterItem.fromJson(Map<String, dynamic> json) {
    return SoilWaterItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class InsectsDiseaseItem extends BaseHomeItem {
  final String? thumbnailUrl;
  final bool isPinned;

  InsectsDiseaseItem({
    required super.id,
    required super.type,
    required super.name,
    required super.description,
    required super.mediaUrl,
    required super.createdAt,
    super.category,
    this.thumbnailUrl,
    this.isPinned = false,
    super.productLink,
  });

  factory InsectsDiseaseItem.fromJson(Map<String, dynamic> json) {
    return InsectsDiseaseItem(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      mediaUrl: json['media_url'] ?? json['media'] ?? '',
      createdAt: json['created_at'] ?? '',
      category: json['category'],
      thumbnailUrl:
          json['thumbnail_url'] ?? json['thumbnail'] ?? json['thumb_url'],
      isPinned: json['is_pinned'] ?? false,
      productLink: json['product_link'],
    );
  }
}

class DealItem {
  final String id;
  final String title;
  final String link;
  final String? imageUrl;
  final String? affiliateLink;
  final String? description;
  final String? originalPrice;
  final String? salePrice;

  DealItem({
    required this.id,
    required this.title,
    required this.link,
    this.imageUrl,
    this.affiliateLink,
    this.description,
    this.originalPrice,
    this.salePrice,
  });

  factory DealItem.fromJson(Map<String, dynamic> json) {
    return DealItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      link: json['link'] ?? '',
      imageUrl: json['image_url'],
      affiliateLink: json['affiliate_link'],
      description: json['description'],
      originalPrice: json['originalPrice']?.toString(),
      salePrice: json['salePrice']?.toString(),
    );
  }
}

class CalendarItem {
  final String id;
  final String title;
  final String imageUrl;
  final String routeName;
  final List<CalendarPlan> plans;
  final List<WeekEvent> weekEvents;

  CalendarItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.routeName,
    required this.plans,
    required this.weekEvents,
  });

  factory CalendarItem.fromJson(Map<String, dynamic> json) {
    return CalendarItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      imageUrl: json['image_url'] ?? '',
      routeName: json['route_name'] ?? '',
      plans: (json['plans'] as List? ?? [])
          .map((i) => CalendarPlan.fromJson(i))
          .toList(),
      weekEvents: (json['week_events'] as List? ?? [])
          .map((i) => WeekEvent.fromJson(i))
          .toList(),
    );
  }
}

class CalendarPlan {
  final String type;
  final String title;
  final String pdfUrl;

  CalendarPlan({required this.type, required this.title, required this.pdfUrl});

  factory CalendarPlan.fromJson(Map<String, dynamic> json) {
    return CalendarPlan(
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      pdfUrl: json['pdf_url'] ?? '',
    );
  }
}

class WeekEvent {
  final String id;
  final String header;
  final String feature;
  final String date;
  final String imageUrl;

  WeekEvent({
    required this.id,
    required this.header,
    required this.feature,
    required this.date,
    required this.imageUrl,
  });

  factory WeekEvent.fromJson(Map<String, dynamic> json) {
    return WeekEvent(
      id: json['id'] ?? '',
      header: json['header'] ?? '',
      feature: json['feature'] ?? '',
      date: json['date'] ?? '',
      imageUrl: json['image_url'] ?? '',
    );
  }
}

class SelfDiagnosisItem {
  final String id;
  final String title;
  final String imageUrl;
  final String? categoryTitle;
  final List<Question> questions;

  SelfDiagnosisItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.categoryTitle,
    required this.questions,
  });

  factory SelfDiagnosisItem.fromJson(Map<String, dynamic> json) {
    dynamic questionsData = json['questions'];
    List<Question> questions = [];
    String? categoryTitle;

    if (questionsData is List) {
      questions = questionsData.map((i) => Question.fromJson(i)).toList();
    } else if (questionsData is Map<String, dynamic>) {
      categoryTitle = questionsData['title'];
      if (questionsData['questions'] is List) {
        questions = (questionsData['questions'] as List)
            .map((i) => Question.fromJson(i))
            .toList();
      }
    }

    return SelfDiagnosisItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      imageUrl: json['image_url'] ?? '',
      categoryTitle: categoryTitle,
      questions: questions,
    );
  }
}

class Question {
  final String id;
  final String question;
  final List<Answer> answers;

  Question({required this.id, required this.question, required this.answers});

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? '',
      question: json['question'] ?? '',
      answers: (json['answers'] as List? ?? [])
          .map((i) => Answer.fromJson(i))
          .toList(),
    );
  }
}

class Answer {
  final String? id;
  final String text;
  final String? nextQuestionId;
  final Diagnosis? diagnosis;

  Answer({this.id, required this.text, this.nextQuestionId, this.diagnosis});

  factory Answer.fromJson(Map<String, dynamic> json) {
    // Check if diagnosis fields are present as siblings (new format) or in a nested object (old format)
    Diagnosis? diag;
    if (json['diagnosis'] != null) {
      if (json['diagnosis'] is Map<String, dynamic>) {
        diag = Diagnosis.fromJson(json['diagnosis']);
      } else if (json['diagnosis'] is String) {
        // New format where 'diagnosis' is just a string title and others are siblings
        diag = Diagnosis.fromJson(json);
      }
    }

    return Answer(
      id: json['id'],
      text: json['text'] ?? '',
      nextQuestionId: json['next'] ?? json['next_question_id'],
      diagnosis: diag,
    );
  }
}

class Diagnosis {
  final String title;
  final List<String> details;
  final String solution;
  final String affiliateTitle;
  final String affiliateLink;

  Diagnosis({
    required this.title,
    required this.details,
    required this.solution,
    required this.affiliateTitle,
    required this.affiliateLink,
  });

  factory Diagnosis.fromJson(Map<String, dynamic> json) {
    // Handle both formats: nested object or flat siblings
    String title = '';
    if (json['diagnosis'] is String) {
      title = json['diagnosis'];
    } else {
      title = json['title'] ?? '';
    }

    return Diagnosis(
      title: title,
      details: List<String>.from(json['details'] ?? []),
      solution: json['solution'] ?? '',
      affiliateTitle: json['link'] ?? json['affiliate_title'] ?? '',
      affiliateLink: json['affiliate_link'] ?? '',
    );
  }
}

class LawnLibraryItem {
  final String id;
  final String name;
  final String imageUrl;
  final String downloadUrl;

  LawnLibraryItem({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.downloadUrl,
  });

  factory LawnLibraryItem.fromJson(Map<String, dynamic> json) {
    return LawnLibraryItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      imageUrl: json['image_url'] ?? '',
      downloadUrl: json['download_url'] ?? '',
    );
  }
}

class BannerItem {
  final String id;
  final String title;
  final String imageUrl;
  final String redirectUrl;

  BannerItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.redirectUrl,
  });

  factory BannerItem.fromJson(dynamic json) {
    if (json is String) {
      return BannerItem(id: '', title: '', imageUrl: json, redirectUrl: '');
    }
    final map = json as Map<String, dynamic>;
    return BannerItem(
      id: map['id']?.toString() ?? '',
      title: map['title'] ?? '',
      imageUrl: map['image_url'] ?? map['media_url'] ?? '',
      redirectUrl: map['redirect_url'] ?? '',
    );
  }
}
