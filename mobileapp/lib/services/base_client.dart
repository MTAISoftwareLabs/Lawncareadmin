import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'api_endpoints.dart';
import 'storage_service.dart';

class BaseClient extends GetConnect implements GetxService {
  static BaseClient get to => Get.find();
  final StorageService _storage = Get.find<StorageService>();

  @override
  void onInit() {
    baseUrl = ApiEndpoints.baseUrl;

    httpClient.addRequestModifier<dynamic>((request) {
      final token = _storage.getToken() ?? "";
      if (token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      request.headers['Accept'] = '*/*';
      request.headers['User-Agent'] =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      final isUpload = request.url.toString().contains('upload/media');
      if (!isUpload && !request.headers.containsKey('Content-Type')) {
        request.headers['Content-Type'] = 'application/json';
      }

      // Log method + URL only — never log headers (contains Bearer token)
      print("API REQUEST: [${request.method}] ${request.url}");

      return request;
    });

    httpClient.addResponseModifier((request, response) {
      if (response.status.hasError) {
        if (request.headers['X-Skip-Error'] == 'true') {
          return response;
        }
        _handleError(response);
      }
      return response;
    });

    super.onInit();
  }

  void _handleError(Response response) {
    String message = "Something went wrong";

    if (response.status.isUnauthorized) {
      message = "Unauthorized access. Please login again.";
    } else if (response.status.isNotFound) {
      message = "Resource not found.";
    } else if (response.status.connectionError) {
      message = "No internet connection.";
    } else if (response.body != null) {
      if (response.body is Map && response.body['error'] != null) {
        message = response.body['error'].toString();
      } else if (response.body is Map && response.body['message'] != null) {
        message = response.body['message'].toString();
      }
    }

    print("API ERROR: $message (${response.statusCode})");
  }

  Future<Response> getRequest(
    String url, {
    Map<String, dynamic>? query,
  }) async => await get(url, query: query);

  Future<Response> postRequest(
    String url,
    dynamic body, {
    Map<String, String>? headers,
  }) async => await post(url, body, headers: headers);

  Future<Response> putRequest(String url, dynamic body) async =>
      await put(url, body);

  Future<Response> patchRequest(String url, dynamic body) async =>
      await patch(url, body);

  Future<Response> deleteRequest(String url, {dynamic body}) async =>
      await request(url, 'DELETE', body: body);
}
