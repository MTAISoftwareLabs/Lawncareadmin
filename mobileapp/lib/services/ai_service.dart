import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/app_constants.dart';

class AiService extends GetConnect implements GetxService {
  static AiService get to => Get.find();

  @override
  void onInit() {
    baseUrl = AppConstants.openAiBaseUrl;
    httpClient.timeout = const Duration(seconds: 60);
    super.onInit();
  }

  Future<Response> sendPrompt(String prompt) async {
    final body = {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "system",
          "content":
              "You are **AI of Lawncare Workshop**, a helpful lawn-care assistant. "
              "Always introduce yourself as 'AI of Lawncare Workshop'. "
              "Only answer questions related to lawn care, grass, irrigation, mowing, fertilizer, weeds, pests, "
              "or similar topics. If a user asks something else, politely refuse and redirect them back to lawn care topics.",
        },
        {"role": "user", "content": prompt},
      ],
      "max_tokens": 1000,
    };

    debugPrint("AiService.sendPrompt: prompt length=${prompt.length}");
    final response = await post(
      '/chat/completions',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AppConstants.openAiApiKey}',
      },
    );
    debugPrint("AiService.sendPrompt: status=${response.statusCode}");
    return response;
  }

  Future<Response> refineText(String text) async {
    final body = {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "system",
          "content":
              "You are a helpful lawn care assistant. Your task is to refine the user's post to make it more professional, clear, and grammatically correct, while keeping the original meaning and tone. Keep it concise.",
        },
        {"role": "user", "content": "Refine this text: $text"},
      ],
      "max_tokens": 300,
    };

    debugPrint("AiService.refineText: text length=${text.length}");
    final response = await post(
      '/chat/completions',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AppConstants.openAiApiKey}',
      },
    );
    debugPrint("AiService.refineText: status=${response.statusCode}");
    return response;
  }

  Future<Response> identifyPlant(File image) async {
    try {
      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);

      final body = {
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content":
                "You are an expert botanist specialized in lawn care. Identify the weed or grass in the image. "
                "Provide a clear, brief identification including common name and scientific name. "
                "Also give 1-2 sentences on how to manage or treat it if it's considered a weed in a lawn.",
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "What is this plant? Identify it for me.",
              },
              {
                "type": "image_url",
                "image_url": {"url": "data:image/jpeg;base64,$base64Image"},
              },
            ],
          },
        ],
        "max_tokens": 500,
      };

      debugPrint(
          "AiService.identifyPlant: base64 length=${base64Image.length}");
      final response = await post(
        '/chat/completions',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${AppConstants.openAiApiKey}',
        },
      );
      debugPrint("AiService.identifyPlant: status=${response.statusCode}");
      return response;
    } catch (e) {
      debugPrint("AiService.identifyPlant: encoding error: $e");
      return Response(statusCode: 500, statusText: "Encoding error: $e");
    }
  }
}
