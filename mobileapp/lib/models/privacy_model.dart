class PrivacyContentModel {
  final List<PrivacySection> data;

  PrivacyContentModel({required this.data});

  factory PrivacyContentModel.fromJson(Map<String, dynamic> json) {
    return PrivacyContentModel(
      data: (json['data'] as List? ?? [])
          .map((i) => PrivacySection.fromJson(i))
          .toList(),
    );
  }
}

class PrivacySection {
  final String heading;
  final String text;

  PrivacySection({required this.heading, required this.text});

  factory PrivacySection.fromJson(Map<String, dynamic> json) {
    return PrivacySection(
      heading: json['heading']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
    );
  }
}
