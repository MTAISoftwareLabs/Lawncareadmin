import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class AiService extends GetxService {
  static AiService get to => Get.find();
  final BaseClient _client = BaseClient.to;

  String? extractContent(dynamic body) {
    if (body is! Map) return null;
    final data = body['data'];
    if (data is Map && data['content'] != null) {
      return data['content'].toString();
    }
    if (body['content'] != null) {
      return body['content'].toString();
    }
    return null;
  }

  Future<Response> sendPrompt(String prompt) async {
    debugPrint("AiService.sendPrompt: prompt length=${prompt.length}");
    final response = await _client.postRequest(ApiEndpoints.aiChat, {
      'prompt': prompt,
    });
    debugPrint("AiService.sendPrompt: status=${response.statusCode}");
    return response;
  }

  Future<Response> refineText(String text) async {
    debugPrint("AiService.refineText: text length=${text.length}");
    final response = await _client.postRequest(ApiEndpoints.aiRefine, {
      'text': text,
    });
    debugPrint("AiService.refineText: status=${response.statusCode}");
    return response;
  }
}
