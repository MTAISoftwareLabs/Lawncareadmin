import 'package:flutter/material.dart';
import 'package:get/get.dart';

class EditAddressCtrl extends GetxController {
  final zipController = TextEditingController();

  void saveZip() {
    print("Saving Zip Code: ${zipController.text}");
    Get.back();
  }

  @override
  void onClose() {
    zipController.dispose();
    super.onClose();
  }
}
