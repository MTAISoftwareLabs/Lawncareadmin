import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class DeviceService extends GetxService {
  final BaseClient _client = BaseClient.to;
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> registerDeviceToken() async {
    try {
      String? fcmToken = await _firebaseMessaging.getToken();

      if (fcmToken == null || fcmToken.isEmpty) {
        print("DeviceService: Failed to get FCM token");
        return;
      }

      String deviceType = Platform.isAndroid ? 'android' : 'ios';
      final payload = {'fcm_token': fcmToken, 'device_type': deviceType};
      final response = await _client.postRequest(ApiEndpoints.device, payload);

      print(
        "DeviceService: FCM registration — status=${response.statusCode}, "
        "type=$deviceType, token=${fcmToken.substring(0, 20)}...",
      );

      if (!response.isOk) {
        print("DeviceService: FCM token registration failed — ${response.statusText}");
      }
    } catch (e) {
      print("DeviceService: Error registering device token: $e");
    }
  }

  void setupTokenRefreshListener() {
    _firebaseMessaging.onTokenRefresh.listen((newToken) {
      print("DeviceService: FCM token refreshed");
      registerDeviceToken();
    });
  }
}
