import 'dart:io';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lawn_care/services/plant_id_service.dart';

class WeedIdCtrl extends GetxController {
  final PlantIdService _plantIdService = Get.find<PlantIdService>();

  final Rx<File?> selectedImage = Rx<File?>(null);
  var isAnalyzing = false.obs;
  var identificationResult = "".obs;

  Future<void> pickImage(ImageSource source) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: source);

    if (image != null) {
      selectedImage.value = File(image.path);
      identificationResult.value = ""; // Clear previous result
      await analyzeImage();
    }
  }

  Future<void> analyzeImage() async {
    if (selectedImage.value == null) return;

    try {
      isAnalyzing.value = true;
      final response =
          await _plantIdService.identifyPlantIssue(selectedImage.value!);

      if (response != null && response['result'] != null) {
        final classification = response['result']['classification'];
        if (classification != null &&
            classification['suggestions'] != null &&
            (classification['suggestions'] as List).isNotEmpty) {
          final best = (classification['suggestions'] as List).first;
          final name = best['name'];
          final probability = (best['probability'] * 100).toStringAsFixed(1);
          final details = best['details'] ?? {};
          final commonNames =
              (details['common_names'] as List?)?.join(', ') ?? '';
          final description = details['description']?['value'] ??
              'No detailed description available.';

          identificationResult.value =
              "IDENTIFIED: $name ($probability%)\n\n"
              "COMMON NAMES: $commonNames\n\n"
              "DESCRIPTION: $description";
        } else {
          identificationResult.value =
              "AI could not identify this plant. Please try a clearer photo.";
        }
      } else {
        identificationResult.value =
            "Identification failed: ${response?['error'] ?? 'Unknown error'}";
      }
    } catch (e) {
      identificationResult.value =
          "An error occurred during identification: $e";
    } finally {
      isAnalyzing.value = false;
    }
  }

  void reset() {
    selectedImage.value = null;
    identificationResult.value = "";
    isAnalyzing.value = false;
  }
}
