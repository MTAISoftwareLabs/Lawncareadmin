import 'dart:convert';
import 'dart:math';
import 'package:get/get.dart';
import 'package:lawn_care/models/user_event.dart';
import 'package:lawn_care/services/notification_service.dart';
import 'package:lawn_care/services/storage_service.dart';

class UserEventCtrl extends GetxController {
  var events = <UserEvent>[].obs;
  final NotificationService _notificationService =
      Get.find<NotificationService>();
  final StorageService _storageService = Get.find<StorageService>();

  @override
  void onInit() {
    super.onInit();
    loadEvents();
  }

  Future<void> loadEvents() async {
    final String? eventsJson = _storageService.loadUserEvents();
    if (eventsJson != null) {
      final List<dynamic> decoded = jsonDecode(eventsJson);
      events.value = decoded.map((e) => UserEvent.fromJson(e)).toList();
    }
  }

  Future<void> saveEvents() async {
    final String encoded = jsonEncode(events.map((e) => e.toJson()).toList());
    await _storageService.saveUserEvents(encoded);
  }

  Future<void> addEvent(String title, DateTime date, {String? notes}) async {
    final int notifId = Random().nextInt(100000);
    final newEvent = UserEvent(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      date: date,
      notes: notes,
      notificationId: notifId,
    );

    events.add(newEvent);
    await saveEvents();

    // Schedule notification
    await _notificationService.scheduleReminder(
      id: notifId,
      title: "Lawn Care Reminder",
      body: title,
      scheduledDate: date,
    );

    Get.snackbar(
      "Reminder Set",
      "Notification scheduled for ${date.toString().substring(0, 16)}",
    );
  }

  Future<void> toggleComplete(String id) async {
    final index = events.indexWhere((e) => e.id == id);
    if (index != -1) {
      var event = events[index];
      event.isCompleted = !event.isCompleted;
      events[index] = event;
      events.refresh();
      await saveEvents();
    }
  }

  Future<void> deleteEvent(String id) async {
    final event = events.firstWhereOrNull((e) => e.id == id);
    if (event != null) {
      if (event.notificationId != null) {
        await _notificationService.cancelReminder(event.notificationId!);
      }
      events.removeWhere((e) => e.id == id);
      await saveEvents();
    }
  }

  List<UserEvent> getEventsForDay(DateTime date) {
    return events.where((e) {
      return e.date.year == date.year &&
          e.date.month == date.month &&
          e.date.day == date.day;
    }).toList();
  }
}
