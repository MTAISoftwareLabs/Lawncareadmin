class UserEvent {
  String id;
  String title;
  DateTime date;
  String? notes;
  bool isCompleted;
  int? notificationId;

  UserEvent({
    required this.id,
    required this.title,
    required this.date,
    this.notes,
    this.isCompleted = false,
    this.notificationId,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'date': date.toIso8601String(),
    'notes': notes,
    'isCompleted': isCompleted,
    'notificationId': notificationId,
  };

  factory UserEvent.fromJson(Map<String, dynamic> json) => UserEvent(
    id: json['id'],
    title: json['title'],
    date: DateTime.parse(json['date']).toLocal(),
    notes: json['notes'],
    isCompleted: json['isCompleted'] ?? false,
    notificationId: json['notificationId'],
  );
}
