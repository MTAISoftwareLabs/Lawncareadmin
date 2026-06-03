import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/firebase_options.dart';
import 'package:lawn_care/screens/splash_screen/splash_screen.dart';
import 'package:lawn_care/screens/subscription_screen/subscription_screen.dart';
import 'package:lawn_care/services/api_services.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/services/notification_service.dart';
import 'package:upgrader/upgrader.dart';

/// 🔔 Background notification handler (REQUIRED for iOS)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  debugPrint("🔔 Background Message Received");
  debugPrint("Message ID: ${message.messageId}");
  debugPrint("Title: ${message.notification?.title}");
  debugPrint("Body: ${message.notification?.body}");
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  /// 🔥 Initialize Firebase
  await Firebase.initializeApp(
   // options: DefaultFirebaseOptions.currentPlatform,
  );

  /// 🔔 Register background message handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  /// 📲 Request notification permission (iOS required)
  NotificationSettings settings = await FirebaseMessaging.instance.requestPermission(
    alert: true,
    badge: true,
    sound: true,
    provisional: false,
  );

  debugPrint("🔔 Notification Permission: ${settings.authorizationStatus}");

  /// 🔔 Allow foreground notifications on iOS
  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );

  /// 📱 Get FCM Token with retry logic for iOS
  if (settings.authorizationStatus == AuthorizationStatus.authorized) {
    await _getFCMTokenWithRetry();
  } else {
    debugPrint("⚠️ Notification permission not granted, skipping token fetch");
  }

  /// 🌐 Initialize API services
  await ApiServices.init();

  /// 💾 Initialize storage service
  Get.put(StorageService());

  /// 🔔 Initialize Notification Service
  await Get.putAsync(() async {
    return await NotificationService().init();
  });

  runApp(const MyApp());
}

/// 📱 Get FCM Token with retry mechanism for iOS APNS token delay
Future<void> _getFCMTokenWithRetry({int maxAttempts = 5}) async {
  for (int attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      String? token = await FirebaseMessaging.instance.getToken();
      if (token != null && token.isNotEmpty) {
        debugPrint("📱 FCM TOKEN (attempt $attempt): $token");

        /// Optional: Save token to your backend
        // await _saveTokenToServer(token);

        return;
      } else {
        debugPrint("⚠️ Token is null, attempt $attempt of $maxAttempts");
      }
    } catch (e) {
      debugPrint("❌ Error getting token (attempt $attempt): $e");
    }

    /// Wait before retrying (increasing delay)
    if (attempt < maxAttempts) {
      await Future.delayed(Duration(seconds: attempt));
    }
  }

  debugPrint("❌ Failed to get FCM token after $maxAttempts attempts");

  /// Set up listener for when token becomes available later
  FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) {
    debugPrint("📱 FCM Token (via refresh): $fcmToken");
    /// Optional: Save token to your backend
    // _saveTokenToServer(fcmToken);
  }).onError((error) {
    debugPrint("❌ Token refresh error: $error");
  });
}

/// Optional: Save token to your backend
// Future<void> _saveTokenToServer(String token) async {
//   try {
//     // Your API call to save token
//     // await ApiServices.saveFCMToken(token);
//     debugPrint("✅ Token saved to server");
//   } catch (e) {
//     debugPrint("❌ Failed to save token: $e");
//   }
// }

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final StorageService storageService = Get.find<StorageService>();

    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: "Lawn Care",
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      darkTheme: ThemeData.dark(),
      themeMode: storageService.isDarkMode()
          ? ThemeMode.dark
          : ThemeMode.light,
      getPages: [
        GetPage(
          name: '/subscription',
          page: () => const SubscriptionScreen(),
        ),
      ],
      home: UpgradeAlert(
        dialogStyle: UpgradeDialogStyle.cupertino,
        child: const SplashScreen(),
      ),
    );
  }
}