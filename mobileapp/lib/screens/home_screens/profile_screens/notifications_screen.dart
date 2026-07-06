import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/notifications_ctrl.dart';
import 'package:lawn_care/models/notification_model.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/full_screen_image_viewer.dart';
import 'package:url_launcher/url_launcher.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, this.openNotificationId});

  final int? openNotificationId;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final NotificationsCtrl controller;

  @override
  void initState() {
    super.initState();
    if (Get.isRegistered<NotificationsCtrl>()) {
      Get.delete<NotificationsCtrl>();
    }
    controller = Get.put(
      NotificationsCtrl(openNotificationId: widget.openNotificationId),
    );

    ever(controller.notificationToOpen, (notification) {
      if (notification != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showNotificationDetails(notification);
          controller.notificationToOpen.value = null;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().primary,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColor().primaryText),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Push Notifications',
          style: TextStyle(
            color: AppColor().primaryText,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: AppColor().alternate,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.delete_sweep, color: AppColor().secondary),
            onPressed: () {
              Get.dialog(
                CupertinoAlertDialog(
                  title: const Text("Clear All"),
                  content: const Text(
                    "Are you sure you want to delete all notifications?",
                  ),
                  actions: [
                    CupertinoDialogAction(
                      child: const Text("Cancel"),
                      onPressed: () => Get.back(),
                    ),
                    CupertinoDialogAction(
                      isDestructiveAction: true,
                      onPressed: () {
                        Get.back();
                        controller.clearAll();
                      },
                      child: const Text("Delete"),
                    ),
                  ],
                ),
              );
            },
            tooltip: 'Clear All',
          ),
        ],
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().primary,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            children: [
              // Toggle Row
              Container(
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: AppColor().secondary.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                ),
                padding: const EdgeInsets.only(bottom: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Enable Push Notifications',
                      style: TextStyle(
                        color: AppColor().secondary,
                        fontSize: 16,
                      ),
                    ),
                    Obx(
                      () => CupertinoSwitch(
                        value: controller.isEnabled.value,
                        activeColor: AppColor().sedaryBackground,
                        trackColor:
                            AppColor().sedaryBackground.withOpacity(0.5),
                        onChanged: controller.toggleNotifications,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              Expanded(
                child: Obx(() {
                  if (controller.isLoading.value &&
                      controller.notificationsList.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (controller.notificationsList.isEmpty) {
                    return _buildEmptyState();
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.only(top: 10),
                    itemCount: controller.notificationsList.length,
                    separatorBuilder: (context, index) =>
                        Divider(color: AppColor().secondary.withOpacity(0.1)),
                    itemBuilder: (context, index) {
                      final n = controller.notificationsList[index];
                      return Dismissible(
                        key: Key(n.id.toString()),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          color: Colors.redAccent.withOpacity(0.8),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (_) => controller.deleteNotification(n.id),
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading:
                              n.imageUrl != null && n.imageUrl!.isNotEmpty
                                  ? GestureDetector(
                                      onTap: () => Get.to(
                                        () => FullScreenImageViewer(
                                          imageUrl: n.imageUrl!,
                                          tag: 'notif_list_${n.id}',
                                        ),
                                      ),
                                      child: Hero(
                                        tag: 'notif_list_${n.id}',
                                        child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          child: Image.network(
                                            n.imageUrl!,
                                            width: 44,
                                            height: 44,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error,
                                                    stackTrace) =>
                                                _buildNotificationIcon(),
                                          ),
                                        ),
                                      ),
                                    )
                                  : _buildNotificationIcon(),
                          title: Text(
                            n.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          // Show a two-line preview; tapping opens the full scrollable dialog
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                n.message,
                                style: const TextStyle(color: Colors.white70),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (n.createdAt.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    _formatTime(n.createdAt),
                                    style: const TextStyle(
                                      color: Colors.white38,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          trailing: Icon(
                            Icons.chevron_right,
                            color: AppColor().secondary.withOpacity(0.5),
                          ),
                          onTap: () => _handleNotificationTap(n),
                          onLongPress: () {
                            Get.dialog(
                              CupertinoAlertDialog(
                                title: const Text("Delete Notification"),
                                content: const Text(
                                  "Are you sure you want to delete this notification?",
                                ),
                                actions: [
                                  CupertinoDialogAction(
                                    child: const Text("Cancel"),
                                    onPressed: () => Get.back(),
                                  ),
                                  CupertinoDialogAction(
                                    isDestructiveAction: true,
                                    onPressed: () {
                                      Get.back();
                                      controller.deleteNotification(n.id);
                                    },
                                    child: const Text("Delete"),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationIcon() {
    return CircleAvatar(
      backgroundColor: AppColor().secondary.withOpacity(0.1),
      child: Icon(Icons.notifications, color: AppColor().secondary),
    );
  }

  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: const BoxDecoration(
            color: Color(0xFF202020),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.notifications_none,
            size: 60,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 30),
        Text(
          'There are no notifications',
          style: TextStyle(
            color: AppColor().secondary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 15),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            'You will receive notifications about new stuff and the latest discounts/sales.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }

  String _formatTime(String isoString) {
    try {
      final dt = DateTime.parse(isoString);
      return "${dt.month}/${dt.day} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}";
    } catch (e) {
      return "";
    }
  }

  void _handleNotificationTap(NotificationModel notification) {
    _showNotificationDetails(notification);
  }

  Future<void> _openUrl(String link) async {
    try {
      if (!link.startsWith('http')) {
        link = 'https://$link';
      }
      final Uri uri = Uri.parse(link.trim());
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'Error',
          'Could not open link: $link',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.withOpacity(0.8),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to open link: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.8),
        colorText: Colors.white,
      );
    }
  }

  void _showNotificationDetails(NotificationModel notification) {
    final context = Get.context!;
    final maxHeight = MediaQuery.of(context).size.height * 0.78;

    Get.dialog(
      Dialog(
        backgroundColor: AppColor().alternate,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: maxHeight),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Title row (fixed, not scrollable) ──────────────────────
                Row(
                  children: [
                    Icon(
                      Icons.notifications_active,
                      color: AppColor().secondary,
                      size: 28,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        notification.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: AppColor().secondary),
                      onPressed: () => Get.back(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Scrollable body (image + message + link) ────────────────
                Flexible(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (notification.imageUrl != null &&
                            notification.imageUrl!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: GestureDetector(
                              onTap: () => Get.to(
                                () => FullScreenImageViewer(
                                  imageUrl: notification.imageUrl!,
                                  tag: 'notif_dialog_${notification.id}',
                                ),
                              ),
                              child: Hero(
                                tag: 'notif_dialog_${notification.id}',
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    notification.imageUrl!,
                                    width: double.infinity,
                                    height: 180,
                                    fit: BoxFit.cover,
                                    errorBuilder:
                                        (context, error, stackTrace) =>
                                            const SizedBox.shrink(),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColor().primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Selectable so users can copy text or links
                              SelectableText(
                                notification.message,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                              ),
                              if (notification.link != null &&
                                  notification.link!.isNotEmpty) ...[
                                const SizedBox(height: 16),
                                InkWell(
                                  onTap: () =>
                                      _openUrl(notification.link!),
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: AppColor()
                                          .sedaryBackground
                                          .withOpacity(0.3),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: AppColor().sedaryBackground,
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.link,
                                          color: AppColor().primaryText,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: SelectableText(
                                            notification.link!,
                                            style: TextStyle(
                                              color: AppColor().primaryText,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Icon(
                                          Icons.open_in_new,
                                          color: AppColor().primaryText,
                                          size: 16,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // ── Close button (fixed at bottom) ──────────────────────────
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Get.back(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColor().sedaryBackground,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Close',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
