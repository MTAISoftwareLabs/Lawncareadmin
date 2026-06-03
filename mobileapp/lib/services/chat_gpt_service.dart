import 'package:flutter/foundation.dart';
import 'package:openai_dart/openai_dart.dart';
import 'package:lawn_care/utils/app_constants.dart';

class ChatGptService {
  final OpenAIClient _client = OpenAIClient(apiKey: AppConstants.openAiApiKey);

  Future<String?> getLawnCareAdvice(String prompt) async {
    try {
      final response = await _client.createChatCompletion(
        request: CreateChatCompletionRequest(
          model: const ChatCompletionModel.modelId('gpt-4o'),
          messages: [
            const ChatCompletionMessage.system(
              content:
                  'You are a professional lawn-care assistant bot. Provide expert advice on lawn care, plant health, and maintenance.',
            ),
            ChatCompletionMessage.user(
              content: ChatCompletionUserMessageContent.string(prompt),
            ),
          ],
          maxTokens: 1000,
        ),
      );
      debugPrint("ChatGptService: response received");
      return response.choices.first.message.content;
    } catch (e) {
      debugPrint("ChatGptService: error $e");
      return null;
    }
  }
}
