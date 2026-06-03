import 'package:get/get.dart';
import 'base_client.dart';
import 'auth_service.dart';
import 'content_service.dart';
import 'interaction_service.dart';
import 'payment_service.dart';
import 'education_service.dart';
import 'lawn_service.dart';
import 'notification_service.dart';
import 'admin_service.dart';
import 'storage_service.dart';
import 'ai_service.dart';
import 'plant_id_service.dart';
import 'device_service.dart';
import 'package:lawn_care/controllers/subscription_ctrl.dart';
import 'package:lawn_care/helpers/subscription_helper.dart';

class ApiServices {
  static Future<void> init() async {
    // Initialize StorageService first
    await Get.putAsync(() => StorageService().init());

    // Initialize BaseClient
    Get.put(BaseClient());

    // Initialize all services
    Get.lazyPut(() => AuthService());
    Get.lazyPut(() => ContentService());
    Get.lazyPut(() => InteractionService());
    Get.lazyPut(() => PaymentService());
    Get.lazyPut(() => EducationService());
    Get.lazyPut(() => LawnService());

    // Initialize RevenueCat
    await SubscriptionHelper.instance.init();

    // Initialize Subscription Controller
    Get.put(SubscriptionCtrl());

    await Get.putAsync(() => NotificationService().init());
    Get.lazyPut(() => AdminService());
    Get.lazyPut(() => AiService());
    Get.lazyPut(() => PlantIdService());
    Get.put(DeviceService());
  }
}
