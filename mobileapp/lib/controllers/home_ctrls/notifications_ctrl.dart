import 'package:get/get.dart';
import 'package:lawn_care/models/notification_model.dart';
import 'package:lawn_care/services/notification_service.dart';

class NotificationsCtrl extends GetxController {
  NotificationsCtrl({this.openNotificationId});

  final int? openNotificationId;
  final NotificationService _notificationService =
      Get.find<NotificationService>();
  final RxBool isEnabled = true.obs;
  final RxBool isLoading = false.obs;
  final RxList<NotificationModel> notificationsList = <NotificationModel>[].obs;
  final Rxn<NotificationModel> notificationToOpen = Rxn<NotificationModel>();

  @override
  void onInit() {
    super.onInit();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    try {
      isLoading.value = true;
      final response = await _notificationService.getUserNotifications();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.body['data'] ?? [];
        notificationsList.value = data
            .map((json) => NotificationModel.fromJson(json))
            .toList();
        _queueNotificationToOpen();
      }
    } catch (e) {
      print("Error fetching notifications: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void _queueNotificationToOpen() {
    if (openNotificationId == null || notificationToOpen.value != null) {
      return;
    }

    for (final notification in notificationsList) {
      if (notification.id == openNotificationId) {
        notificationToOpen.value = notification;
        return;
      }
    }
  }

  void markAsRead(dynamic id) async {
    try {
      final response = await _notificationService.markAsRead(id);
      if (response.statusCode == 200) {
        // Refresh list from server
        fetchNotifications();
      }
    } catch (e) {
      print("Error marking notification as read: $e");
    }
  }

  void deleteNotification(dynamic id) async {
    try {
      final response = await _notificationService.deleteNotification(id);
      if (response.statusCode == 200) {
        notificationsList.removeWhere((n) => n.id == id);
        Get.snackbar(
          "Success",
          "Notification deleted",
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      print("Error deleting notification: $e");
    }
  }

  void clearAll() async {
    try {
      isLoading.value = true;
      // Copy the list to avoid concurrent modification issues during loop
      final List<NotificationModel> toDelete = List.from(notificationsList);

      for (var notification in toDelete) {
        await _notificationService.deleteNotification(notification.id);
      }

      notificationsList.clear();
      Get.snackbar(
        "Success",
        "All notifications cleared",
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      print("Error clearing notifications: $e");
    } finally {
      isLoading.value = false;
    }
  }

  void toggleNotifications(bool value) {
    isEnabled.value = value;
  }
}
