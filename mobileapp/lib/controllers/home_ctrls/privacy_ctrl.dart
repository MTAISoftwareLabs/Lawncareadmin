import 'package:get/get.dart';
import 'package:lawn_care/models/privacy_model.dart';
import 'package:lawn_care/services/content_service.dart';

class PrivacyCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();

  final RxList<PrivacySection> privacySections = <PrivacySection>[].obs;
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchPrivacyContent();
  }

  Future<void> fetchPrivacyContent() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await _contentService.getPrivacyContent();

      if (response.statusCode == 200 && response.body != null) {
        final model = PrivacyContentModel.fromJson(response.body);
        privacySections.assignAll(model.data);
      } else {
        errorMessage.value = 'Failed to load privacy content';
      }
    } catch (e) {
      print('Error fetching privacy content: $e');
      errorMessage.value = 'Error fetching privacy content';
    } finally {
      isLoading.value = false;
    }
  }
}
