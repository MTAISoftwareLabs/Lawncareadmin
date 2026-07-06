import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;
import 'package:get/get.dart';
import 'dart:convert';
import 'dart:io';
import 'package:app_badger/app_badger.dart';
import 'package:lawn_care/controllers/home_ctrls/home_ctrl.dart';
import 'package:lawn_care/controllers/home_ctrls/landing_navbar_ctrl.dart';
import 'package:lawn_care/screens/deals/deals_list_screen.dart';
import 'package:lawn_care/screens/home_screens/calendar_screens/choose_lawn_screen.dart';
import 'package:lawn_care/screens/home_screens/chat_screens/chat_detail_screen.dart';
import 'package:lawn_care/screens/home_screens/profile_screens/notifications_screen.dart';
import 'package:lawn_care/screens/library_screen/lawn_library_screen.dart';
import 'package:lawn_care/screens/self_diagnosis/self_diagnosis_screen.dart';

import 'api_endpoints.dart';
import 'base_client.dart';

class NotificationService extends GetxService {
  final BaseClient _client = BaseClient.to;
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
  FlutterLocalNotificationsPlugin();

  static Map<String, dynamic>? pendingNotificationData;
  String? _fcmToken;

  Future<Response> getUserNotifications() async =>
      await _client.getRequest(ApiEndpoints.notifications);

  Future<Response> markAsRead(dynamic id) async {
    final response = await _client.postRequest(ApiEndpoints.notificationRead(id), {});

    // Update badge count after marking as read
    if (response.isOk) {
      await _updateBadgeCount();
    }

    return response;
  }

  Future<Response> deleteNotification(dynamic id) async {
    final response = await _client.postRequest(ApiEndpoints.notificationDelete(id), {'id': id});

    // Update badge count after deleting
    if (response.isOk) {
      await _updateBadgeCount();
    }

    return response;
  }

  /// 🧹 Clear app badge number
  Future<void> clearBadgeCount() async {
    try {
      // Check if flutter_app_badger is available
      if (await AppBadger.isBadgeSupported()) {
        AppBadger.removeBadge();
        print('✅ Badge count cleared');
      } else {
        print('⚠️ App badge not supported on this device');
      }
    } catch (e) {
      print('❌ Error clearing badge: $e');
    }
  }

  /// 🔢 Update badge count based on unread notifications
  Future<void> _updateBadgeCount() async {
    try {
      if (!await AppBadger.isBadgeSupported()) {
        return;
      }

      final response = await getUserNotifications();
      if (response.isOk && response.body != null) {
        int unreadCount = response.body['unread_count'] ?? 0;

        if (unreadCount > 0) {
          AppBadger.updateBadgeCount(unreadCount);
          print('📱 Badge count updated to: $unreadCount');
        } else {
          AppBadger.removeBadge();
          print('📱 Badge removed (0 unread)');
        }
      }
    } catch (e) {
      print('❌ Error updating badge count: $e');
    }
  }

  /// 👂 Setup app lifecycle listener to clear badge on app resume
  void _setupAppLifecycleListener() {
    WidgetsBinding.instance.addObserver(
      AppLifecycleObserver(onResume: () {
        print('🔄 App resumed, clearing badge');
        clearBadgeCount();
        _updateBadgeCount(); // Refresh badge with current unread count
      }),
    );
  }

  static const String _androidChannelId = 'lawncare_notifications';
  static const String _androidChannelName = 'Push Notifications';

  Future<void> requestPermissions() async {
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    print('🔔 [FCM] permission: ${settings.authorizationStatus}');

    if (Platform.isAndroid) {
      final androidPlugin =
          _flutterLocalNotificationsPlugin
              .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin
              >();
      await androidPlugin?.requestNotificationsPermission();
    }

    final bool? iosGranted = await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(alert: true, badge: true, sound: true);

    print('🔔 [LOCAL] permission: $iosGranted');
  }

  Future<void> _createNotificationChannel() async {
    if (!Platform.isAndroid) return;

    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      _androidChannelId,
      _androidChannelName,
      description: 'Push notifications from Lawncare Workshop',
      importance: Importance.max,
    );

    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(channel);
  }

  Future<NotificationService> init() async {
    await requestPermissions();
    await _createNotificationChannel();

    /// Android settings
    const AndroidInitializationSettings androidSettings =
    AndroidInitializationSettings('@mipmap/ic_launcher');

    /// iOS settings
    const DarwinInitializationSettings iosSettings =
    DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    final InitializationSettings initializationSettings =
    InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        print('🔔 [TAP FOREGROUND] payload: ${response.payload}');
        final data = _parsePayload(response.payload);
        if (data != null) {
          // Clear badge when notification is tapped
          clearBadgeCount();
          _handleNotificationNavigation(data);
        }
      },
    );

    /// Foreground banners are shown via flutter_local_notifications so both
    /// Android and iOS behave the same when the admin sends notification+data.
    await FirebaseMessaging.instance
        .setForegroundNotificationPresentationOptions(
      alert: false,
      badge: true,
      sound: false,
    );

    tzdata.initializeTimeZones();

    /// Foreground messages — always show a banner while the app is open.
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('🔔 [FOREGROUND MSG] data: ${message.data}');
      showLocalNotification(message);
      _updateBadgeCount();
      if (Get.isRegistered<HomeCtrl>()) {
        Get.find<HomeCtrl>().fetchUnreadNotificationCount();
      }
    });

    /// Background notification tap
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('🔔 [BACKGROUND TAP] data: ${message.data}');
      // Clear badge when notification is tapped
      clearBadgeCount();
      _handleNotificationNavigation(message.data);
    });

    /// Terminated state notification
    final RemoteMessage? initialMessage =
    await _firebaseMessaging.getInitialMessage();

    if (initialMessage != null) {
      print('🔔 [TERMINATED TAP] data: ${initialMessage.data}');
      pendingNotificationData = initialMessage.data;
      // Clear badge when app opens from terminated state
      clearBadgeCount();
    }

    /// ✅ Clear badge on app start
    await clearBadgeCount();

    /// ✅ Update badge with current unread count
    await _updateBadgeCount();

    /// ✅ Setup app lifecycle listener
    _setupAppLifecycleListener();

    /// ✅ Get FCM Token with proper iOS handling
    await _setupFCMToken();

    return this;
  }

  /// 🎯 Handle FCM Token with APNS delay
  Future<void> _setupFCMToken() async {
    // Listen for token refreshes (this will fire when APNS token is ready)
    _firebaseMessaging.onTokenRefresh.listen((token) {
      print('🔄 FCM Token Refreshed: $token');
      _fcmToken = token;
      _sendTokenToServer(token);
    }).onError((error) {
      print('❌ Token refresh error: $error');
    });

    // Try to get initial token with retry logic
    await _getFCMTokenWithRetry();
  }

  /// 🔄 Retry logic for iOS APNS token delay
  Future<void> _getFCMTokenWithRetry({int maxAttempts = 5}) async {
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        String? token = await _firebaseMessaging.getToken();

        if (token != null && token.isNotEmpty) {
          print('✅ FCM Token (attempt $attempt): $token');
          _fcmToken = token;
          await _sendTokenToServer(token);
          return;
        } else {
          print('⚠️ Token is null, attempt $attempt of $maxAttempts');
        }
      } catch (e) {
        print('❌ Error getting token (attempt $attempt): $e');

        // On iOS, APNS token error is expected initially
        if (Platform.isIOS && e.toString().contains('apns-token-not-set')) {
          print('🍎 iOS APNS token not ready yet, waiting...');
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        await Future.delayed(Duration(seconds: attempt));
      }
    }

    print('⚠️ Could not get FCM token after $maxAttempts attempts');
    print('💡 Token will be available via onTokenRefresh listener');
  }

  /// 📤 Send token to your backend
  Future<void> _sendTokenToServer(String token) async {
    try {
      // Replace with your actual API endpoint
      // await _client.postRequest(ApiEndpoints.updateFcmToken, {'fcm_token': token});
      print('📤 Token sent to server: $token');
    } catch (e) {
      print('❌ Failed to send token to server: $e');
    }
  }

  /// 🍎 Check APNS token status (iOS only)
  Future<void> checkAPNSToken() async {
    if (Platform.isIOS) {
      String? apnsToken = await _firebaseMessaging.getAPNSToken();
      if (apnsToken != null) {
        print('🍎 APNS Token: $apnsToken');
      } else {
        print('⚠️ APNS token not yet available');
      }
    }
  }

  /// 📱 Public method to get current FCM token
  Future<String?> getCurrentFCMToken() async {
    if (_fcmToken != null && _fcmToken!.isNotEmpty) {
      return _fcmToken;
    }

    // Fallback: try to get fresh token
    try {
      String? token = await _firebaseMessaging.getToken();
      if (token != null && token.isNotEmpty) {
        _fcmToken = token;
        return token;
      }
    } catch (e) {
      print('Error getting fresh token: $e');
    }

    return null;
  }

  /// Handles notification taps from foreground, background, and cold start.
  ///
  /// Admin panel sends `actionType` + `actionUrl` in the FCM data payload.
  /// See docs/push-notification-payload.md for the full mapping.
  static void consumePendingNavigation() {
    if (pendingNotificationData != null) {
      final data = pendingNotificationData!;
      pendingNotificationData = null;

      Future.delayed(const Duration(milliseconds: 500), () {
        _handleNotificationNavigation(data);
      });
    }
  }

  static void _handleNotificationNavigation(Map<String, dynamic> data) {
    print('🔔 [NAVIGATE] $data');

    // Clear badge when navigating from notification
    final notificationService = Get.find<NotificationService>();
    notificationService.clearBadgeCount();

    if (_tryNavigateToChat(data)) {
      return;
    }

    final String? actionType =
        _extractString(data, ['actionType', 'action_type'])?.toLowerCase();
    final String? actionUrl =
        _extractString(data, ['actionUrl', 'action_url', 'url', 'link']);

    if (actionType != null &&
        _handleAdminActionType(actionType, actionUrl, data)) {
      return;
    }

    _navigateToPushNotifications(data);
  }

  static bool _tryNavigateToChat(Map<String, dynamic> data) {
    final String? type = _extractString(data, ['type']);
    final String? chatId = _extractString(data, [
      'chat_id',
      'conversation_id',
      'chatId',
      'conversationId',
      'room_id',
      'roomId',
    ]);

    if (chatId == null || chatId.isEmpty) {
      return false;
    }

    if (type != null && type != 'chat') {
      return false;
    }

    final String userName =
        _extractString(data, [
          'user_name',
          'userName',
          'sender_name',
          'senderName',
        ]) ??
            'User';
    Get.to(() => ChatDetailScreen(chatId: chatId, userName: userName));
    return true;
  }

  /// Maps admin panel action types to in-app navigation.
  static bool _handleAdminActionType(
    String actionType,
    String? actionUrl,
    Map<String, dynamic> data,
  ) {
    switch (actionType) {
      case 'link':
      case 'notifications':
      case 'notification':
        _navigateToPushNotifications(data);
        return true;
      case 'screen':
        if (_navigateToAppScreen(actionUrl, data)) {
          return true;
        }
        _navigateToPushNotifications(data);
        return true;
      case 'deal':
        Get.to(() => const DealsListScreen());
        return true;
      case 'lesson':
        Get.to(() => const LawnLibraryScreen());
        return true;
      case 'competition':
        _switchTab(4);
        return true;
      default:
        return false;
    }
  }

  static void _switchTab(int index) {
    if (Get.isRegistered<LandingNavbarCtrl>()) {
      Get.find<LandingNavbarCtrl>().selectedIndex.value = index;
    }
  }

  static bool _navigateToAppScreen(String? screen, Map<String, dynamic> data) {
    final String name = screen?.toLowerCase().trim() ?? '';

    switch (name) {
      case 'home':
        _switchTab(0);
        return true;
      case 'search':
        _switchTab(1);
        return true;
      case 'forum':
        _switchTab(2);
        return true;
      case 'questions':
      case 'quiz':
        _switchTab(3);
        return true;
      case 'contest':
      case 'competition':
        _switchTab(4);
        return true;
      case 'profile':
        _switchTab(5);
        return true;
      case 'notifications':
      case 'push_notifications':
      case 'push notifications':
        _navigateToPushNotifications(data);
        return true;
      case 'deals':
        Get.to(() => const DealsListScreen());
        return true;
      case 'lessons':
      case 'library':
      case 'lawn_library':
        Get.to(() => const LawnLibraryScreen());
        return true;
      case 'diagnosis':
      case 'self_diagnosis':
      case 'self diagnosis':
        Get.to(() => const SelfDiagnosisScreen());
        return true;
      case 'calendar':
        Get.to(() => const ChooseLawnScreen());
        return true;
      default:
        return false;
    }
  }

  /// Opens Profile → Push Notifications. Pass `notification_id` in [data] to
  /// auto-open a specific saved notification after the list loads.
  static void _navigateToPushNotifications(Map<String, dynamic> data) {
    if (Get.isRegistered<LandingNavbarCtrl>()) {
      Get.find<LandingNavbarCtrl>().selectedIndex.value = 5;
    }

    final String? notificationId = _extractString(data, [
      'notification_id',
      'notificationId',
      'id',
    ]);

    final int? openNotificationId =
        notificationId != null ? int.tryParse(notificationId) : null;

    Get.to(
      () => NotificationsScreen(openNotificationId: openNotificationId),
    );
  }

  static String? _extractString(Map<String, dynamic> data, List<String> keys) {
    for (final key in keys) {
      final val = data[key];
      if (val != null && val.toString().isNotEmpty) {
        return val.toString();
      }
    }
    return null;
  }

  Map<String, dynamic>? _parsePayload(String? payload) {
    if (payload == null || payload.isEmpty) return null;

    try {
      return Map<String, dynamic>.from(jsonDecode(payload));
    } catch (_) {
      return null;
    }
  }

  void showLocalNotification(RemoteMessage message) {
    String? title;
    String? body;

    if (message.notification != null) {
      title = message.notification!.title;
      body = message.notification!.body;
    } else {
      title = message.data['title'];
      body = message.data['body'] ?? message.data['message'];
    }

    if (title == null && body == null) return;

    final payload = jsonEncode(message.data);

    _flutterLocalNotificationsPlugin.show(
      message.hashCode,
      title ?? "Notification",
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannelId,
          _androidChannelName,
          channelDescription: 'Push notifications from Lawncare Workshop',
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: payload,
    );

    // Update badge count when showing local notification
    _updateBadgeCount();
  }

  Future<void> scheduleReminder({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
  }) async {
    final details = NotificationDetails(
      android: AndroidNotificationDetails(
        _androidChannelId,
        _androidChannelName,
        channelDescription: 'Push notifications from Lawncare Workshop',
        importance: Importance.max,
        priority: Priority.high,
      ),
      iOS: const DarwinNotificationDetails(),
    );

    final tz.TZDateTime scheduled =
    tz.TZDateTime.from(scheduledDate, tz.local);

    await _flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      scheduled,
      details,
      uiLocalNotificationDateInterpretation:
      UILocalNotificationDateInterpretation.absoluteTime, androidScheduleMode: AndroidScheduleMode.exact,
    );
  }

  Future<void> cancelReminder(int id) async {
    await _flutterLocalNotificationsPlugin.cancel(id);
  }
}

/// 📱 App Lifecycle Observer
class AppLifecycleObserver with WidgetsBindingObserver {
  final VoidCallback onResume;

  AppLifecycleObserver({required this.onResume});

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      onResume();
    }
  }
}