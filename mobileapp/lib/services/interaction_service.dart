import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class InteractionService extends GetxService {
  final BaseClient _client = BaseClient.to;

  // Expert Q&A
  Future<Response> getPublicQuestions() async =>
      await _client.getRequest(ApiEndpoints.expertQuestions);

  Future<Response> getMyQuestions() async =>
      await _client.getRequest(ApiEndpoints.myQuestions);

  Future<Response> submitQuestion(
    String question,
    String category,
    String? imageUrl,
  ) async {
    return await _client.postRequest(ApiEndpoints.expertQuestions, {
      'question': question,
      'category': category,
      if (imageUrl != null) 'imageUrl': imageUrl,
    });
  }

  // Competitions
  Future<Response> getAllCompetitions() async =>
      await _client.getRequest(ApiEndpoints.competitions);

  Future<Response> getActiveCompetition() async =>
      await _client.getRequest(ApiEndpoints.activeCompetition);

  Future<Response> getCompetitionDetail(int id) async =>
      await _client.getRequest(ApiEndpoints.competitionDetail(id));

  Future<Response> submitCompetitionEntry(
    int id,
    String imageUrl,
    String caption,
  ) async {
    return await _client.postRequest(ApiEndpoints.submitEntry(id as String), {
      'imageUrl': imageUrl,
      'caption': caption,
    });
  }

  Future<Response> voteForEntry(int id) async =>
      await _client.postRequest(ApiEndpoints.voteEntry(id as String), {});

  Future<Response> getPastWinners() async =>
      await _client.getRequest(ApiEndpoints.competitionWinners);
}
