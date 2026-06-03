import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class AdminService extends GetxService {
  final BaseClient _client = BaseClient.to;

  // Dashboard Stats
  Future<Response> getDashboardStats() async =>
      await _client.getRequest(ApiEndpoints.adminDashboardStats);

  Future<Response> getStats() async =>
      await _client.getRequest(ApiEndpoints.adminStats);

  // User Management
  Future<Response> getAllUsers() async =>
      await _client.getRequest(ApiEndpoints.adminUsers);

  Future<Response> updateUserRole(int id, String role) async {
    return await _client.putRequest(ApiEndpoints.adminUserDetail(id), {
      'role': role,
    });
  }

  Future<Response> banUser(
    int id, {
    required bool isBanned,
    String? reason,
  }) async {
    return await _client.putRequest(ApiEndpoints.adminUserBan(id), {
      'isBanned': isBanned,
      if (reason != null) 'bannedReason': reason,
    });
  }

  Future<Response> updateUserSubscription(
    int id,
    Map<String, dynamic> data,
  ) async {
    return await _client.putRequest(
      ApiEndpoints.adminUserSubscription(id),
      data,
    );
  }

  Future<Response> deleteUser(int id) async =>
      await _client.deleteRequest(ApiEndpoints.adminUserDetail(id));

  // Grass Types Management
  Future<Response> adminGetGrassTypes() async =>
      await _client.getRequest(ApiEndpoints.adminGrassTypes);
  Future<Response> adminCreateGrassType(Map<String, dynamic> data) async =>
      await _client.postRequest(ApiEndpoints.adminGrassTypes, data);
  Future<Response> adminUpdateGrassType(
    dynamic id,
    Map<String, dynamic> data,
  ) async =>
      await _client.patchRequest(ApiEndpoints.adminGrassTypeDetail(id), data);
  Future<Response> adminDeleteGrassType(dynamic id) async =>
      await _client.deleteRequest(ApiEndpoints.adminGrassTypeDetail(id));

  // Lessons Management
  Future<Response> adminGetLessons() async =>
      await _client.getRequest(ApiEndpoints.adminLessons);
  Future<Response> adminCreateLesson(Map<String, dynamic> data) async =>
      await _client.postRequest(ApiEndpoints.adminLessons, data);
  Future<Response> adminUpdateLesson(
    dynamic id,
    Map<String, dynamic> data,
  ) async =>
      await _client.patchRequest(ApiEndpoints.adminLessonDetail(id), data);
  Future<Response> adminDeleteLesson(dynamic id) async =>
      await _client.deleteRequest(ApiEndpoints.adminLessonDetail(id));

  // Deals Management
  Future<Response> adminGetDeals() async =>
      await _client.getRequest(ApiEndpoints.adminDeals);
  Future<Response> adminCreateDeal(Map<String, dynamic> data) async =>
      await _client.postRequest(ApiEndpoints.adminDeals, data);
  Future<Response> adminUpdateDeal(
    dynamic id,
    Map<String, dynamic> data,
  ) async => await _client.patchRequest(ApiEndpoints.adminDealDetail(id), data);
  Future<Response> adminDeleteDeal(dynamic id) async =>
      await _client.deleteRequest(ApiEndpoints.adminDealDetail(id));

  // Competitions Management
  Future<Response> adminGetCompetitions() async =>
      await _client.getRequest(ApiEndpoints.adminCompetitions);
  Future<Response> adminCreateCompetition(Map<String, dynamic> data) async =>
      await _client.postRequest(ApiEndpoints.adminCompetitions, data);
  Future<Response> adminUpdateCompetition(
    dynamic id,
    Map<String, dynamic> data,
  ) async =>
      await _client.patchRequest(ApiEndpoints.adminCompetitionDetail(id), data);
  Future<Response> adminDeleteCompetition(dynamic id) async =>
      await _client.deleteRequest(ApiEndpoints.adminCompetitionDetail(id));

  // Expert Questions Management
  Future<Response> adminGetQuestions() async =>
      await _client.getRequest(ApiEndpoints.adminQuestions);
  Future<Response> adminSendQuestionReply(dynamic id, String content) async =>
      await _client.postRequest(ApiEndpoints.adminQuestionReply(id), {
        'content': content,
      });

  // Diagnoses Management
  Future<Response> adminGetDiagnoses() async =>
      await _client.getRequest(ApiEndpoints.adminDiagnoses);
  Future<Response> adminUpdateDiagnosis(
    dynamic id,
    Map<String, dynamic> data,
  ) async =>
      await _client.patchRequest(ApiEndpoints.adminDiagnosisDetail(id), data);
}
