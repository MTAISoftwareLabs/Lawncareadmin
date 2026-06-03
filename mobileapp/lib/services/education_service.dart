import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class EducationService extends GetxService {
  final BaseClient _client = BaseClient.to;

  Future<Response> getAllLessons({String? category, int? grassType}) async {
    return await _client.getRequest(
      ApiEndpoints.lessons,
      query: {
        if (category != null) 'category': category,
        if (grassType != null) 'grassType': grassType.toString(),
      },
    );
  }

  Future<Response> getLessonDetail(int id) async =>
      await _client.getRequest(ApiEndpoints.lessonDetail(id));

  Future<Response> updateLessonProgress(
    int id,
    int progress,
    bool completed,
  ) async {
    return await _client.postRequest(ApiEndpoints.lessonProgress(id), {
      'progress': progress,
      'completed': completed,
    });
  }

  Future<Response> getRecentLessons() async =>
      await _client.getRequest(ApiEndpoints.recentLessons);
}
