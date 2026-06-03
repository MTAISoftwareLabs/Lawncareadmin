import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class AuthService extends GetxService {
  final BaseClient _client = BaseClient.to;

  Future<Response> register(
    String email,
    String password,
    String name,
    String phone,
  ) async {
    return await _client.postRequest(ApiEndpoints.register, {
      'email': email,
      'password': password,
      'name': name,
      'phone': phone,
    });
  }

  Future<Response> login(String email, String password) async {
    // Never log credentials — even in debug builds
    print("AuthService.login: request for $email");
    return await _client.postRequest(ApiEndpoints.login, {
      'email': email,
      'password': password,
    });
  }

  Future<Response> requestOtp(String phone) async {
    return await _client.postRequest(ApiEndpoints.phoneLogin, {'phone': phone});
  }

  Future<Response> verifyOtp(String sessionId, String otpCode) async {
    return await _client.postRequest(ApiEndpoints.verifyOtp, {
      'session_id': sessionId,
      'otp_code': otpCode,
    });
  }

  Future<Response> socialLogin({
    required String provider,
    required String accessToken,
    required String providerUserId,
    required String email,
    required String name,
    required String avatar,
  }) async {
    return await _client.postRequest(ApiEndpoints.socialLogin, {
      'provider': provider,
      'access_token': accessToken,
      'provider_user_id': providerUserId,
      'email': email,
      'name': name,
      'avatar': avatar,
    });
  }

  Future<Response> getCurrentUser() async {
    return await _client.getRequest(ApiEndpoints.me);
  }

  Future<Response> getProfile() async {
    return await _client.getRequest(ApiEndpoints.profile);
  }

  Future<Response> updateProfile(Map<String, dynamic> data) async {
    return await _client.putRequest(ApiEndpoints.profile, data);
  }

  Future<Response> uploadProfileImage(XFile imageFile) async {
    final FormData formData = FormData({
      'file': MultipartFile(
        await imageFile.readAsBytes(),
        filename: imageFile.name,
      ),
    });
    return await _client.postRequest(ApiEndpoints.uploadMedia, formData);
  }

  Future<Response> logout() async {
    return await _client.postRequest(ApiEndpoints.logout, {});
  }

  Future<Response> forgotPassword(String email) async {
    return await _client.postRequest(ApiEndpoints.forgotPassword, {
      'email': email,
    });
  }

  Future<Response> resetPassword(String token, String password) async {
    return await _client.postRequest(ApiEndpoints.resetPassword, {
      'token': token,
      'password': password,
    });
  }

  Future<Response> registerDevice(String fcmToken, String deviceType) async {
    return await _client.postRequest(ApiEndpoints.device, {
      'fcm_token': fcmToken,
      'device_type': deviceType,
    });
  }

  Future<Response> unregisterDevice(String fcmToken) async {
    return await _client.deleteRequest(
      ApiEndpoints.device,
      body: {'fcm_token': fcmToken},
    );
  }

  Future<Response> getDevices() async {
    return await _client.getRequest(ApiEndpoints.devices);
  }
}
