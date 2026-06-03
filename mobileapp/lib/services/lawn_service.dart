import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class LawnService extends GetxService {
  final BaseClient _client = BaseClient.to;

  // Grass Types
  Future<Response> getGrassTypes() async =>
      await _client.getRequest(ApiEndpoints.grassTypes);

  // Care Plans
  Future<Response> getLawnCarePlans() async =>
      await _client.getRequest(ApiEndpoints.lawnCarePlans);

  Future<Response> getUpcomingLawnPlans() async =>
      await _client.getRequest(ApiEndpoints.upcomingLawnPlans);

  // Lawn Profiles
  Future<Response> getLawnProfiles() async =>
      await _client.getRequest(ApiEndpoints.lawnProfiles);

  Future<Response> createLawnProfile({
    required String name,
    required int grassTypeId,
    required int size,
    required String sunExposure,
    required String soilType,
    required String irrigationType,
  }) async {
    return await _client.postRequest(ApiEndpoints.lawnProfiles, {
      'name': name,
      'grassTypeId': grassTypeId,
      'size': size,
      'sunExposure': sunExposure,
      'soilType': soilType,
      'irrigationType': irrigationType,
    });
  }

  Future<Response> updateLawnProfile(int id, Map<String, dynamic> data) async {
    return await _client.putRequest(ApiEndpoints.lawnProfileDetail(id), data);
  }

  Future<Response> deleteLawnProfile(int id) async {
    return await _client.deleteRequest(ApiEndpoints.lawnProfileDetail(id));
  }

  // Diagnosis
  Future<Response> submitDiagnosis(
    String imageUrl,
    String problemType,
    String description,
  ) async {
    return await _client.postRequest(ApiEndpoints.diagnoses, {
      'imageUrl': imageUrl,
      'problemType': problemType,
      'description': description,
    });
  }

  // Deals
  Future<Response> getDeals({String? category, bool? featured}) async {
    return await _client.getRequest(
      ApiEndpoints.deals,
      query: {
        if (category != null) 'category': category,
        if (featured != null) 'featured': featured.toString(),
      },
    );
  }

  Future<Response> getDealDetail(int id) async =>
      await _client.getRequest(ApiEndpoints.dealDetail(id));
}
