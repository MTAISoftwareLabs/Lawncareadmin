import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:purchases_ui_flutter/purchases_ui_flutter.dart';
import 'package:lawn_care/services/storage_service.dart';
import 'package:lawn_care/services/auth_service.dart';
import 'package:lawn_care/services/payment_service.dart';
import 'package:lawn_care/utils/app_constants.dart';

// ── Purchase result enum ───────────────────────────────────────────────────
enum PurchaseResult {
  success,        // Payment accepted, subscription is active
  cancelled,      // User explicitly dismissed the payment sheet
  alreadyOwned,   // User already owns this product — restored automatically
  paymentPending, // Purchase initiated but awaiting external approval
  failed,         // Payment declined, store error, network issue, etc.
}
// ──────────────────────────────────────────────────────────────────────────

/// RevenueCat PlatformException error codes
class _RCErrorCode {
  static const String cancelled   = '1';   // purchaseCancelledError
  static const String alreadyOwned = '6';  // productAlreadyPurchasedError
  static const String pending     = '20';  // paymentPendingError
}

class SubscriptionHelper {
  static final SubscriptionHelper instance = SubscriptionHelper._();
  SubscriptionHelper._();

  final RxBool isUserSubscribed = false.obs;

  // Debounce guard: prevents the CustomerInfo listener from sending a second
  // iap/verify to the backend within 60 s of the one sent by purchasePackage.
  DateTime? _lastBackendNotifyTime;

  // ── Initialise ────────────────────────────────────────────────────────────

  Future<void> init() async {
    if (kDebugMode) {
      await Purchases.setLogLevel(LogLevel.debug);
    }

    PurchasesConfiguration configuration;
    if (Platform.isAndroid) {
      configuration = PurchasesConfiguration(AppConstants.revenueCatGoogleKey);
    } else if (Platform.isIOS) {
      configuration = PurchasesConfiguration(AppConstants.revenueCatAppleKey);
    } else {
      return;
    }

    await Purchases.configure(configuration);

    final storageService = Get.find<StorageService>();
    final cached = storageService.getCachedSubscriptionStatus();
    isUserSubscribed.value = cached;
    debugPrint("SubscriptionHelper.init: cached status = $cached");

    // Real-time listener: fires whenever a purchase completes from any source.
    // The debounce prevents a duplicate iap/verify call when this fires right
    // after purchasePackage() already notified the backend.
    Purchases.addCustomerInfoUpdateListener((customerInfo) {
      debugPrint("RevenueCat listener: CustomerInfo updated");
      _notifyBackendSuccess(customerInfo);
    });

    _silentVerify();
  }

  // ── Status check ──────────────────────────────────────────────────────────

  Future<void> _silentVerify() async {
    try {
      await isProUser();
    } catch (e) {
      debugPrint("SubscriptionHelper._silentVerify error: $e");
    }
  }

  Future<bool> isProUser({CustomerInfo? customerInfo}) async {
    try {
      final storageService = Get.find<StorageService>();
      final user = storageService.getUser();

      if (user != null && user['role'] == 'admin') {
        isUserSubscribed.value = true;
        await storageService.saveSubscriptionStatus(true);
        return true;
      }

      bool isPremium = false;
      try {
        CustomerInfo info = customerInfo ?? await Purchases.getCustomerInfo();
        isPremium =
            info.entitlements.active.isNotEmpty ||
            info.activeSubscriptions.isNotEmpty;

        debugPrint(
          "isProUser: RC entitlements=${info.entitlements.active.keys} "
          "subs=${info.activeSubscriptions}",
        );
      } catch (e) {
        debugPrint("isProUser: RevenueCat check error: $e");
        isPremium = storageService.getCachedSubscriptionStatus();
      }

      if (storageService.hasToken()) {
        try {
          final authService = Get.find<AuthService>();
          final response = await authService.getProfile();

          if (response.isOk && response.body != null) {
            final dynamic raw =
                response.body is Map && response.body.containsKey('data')
                ? response.body['data']
                : response.body;

            if (raw != null && raw is Map) {
              await storageService.saveUser(raw as Map<String, dynamic>);

              final status =
                  raw['subscriptionStatus']?.toString().toLowerCase() ??
                  raw['subscription_status']?.toString().toLowerCase() ??
                  '';
              final bool apiIsPremium =
                  status == 'premium' ||
                  raw['is_premium'] == true ||
                  raw['is_premium'] == 1 ||
                  raw['is_premium'] == "1";

              if (isPremium && !apiIsPremium) {
                debugPrint("isProUser: RC=YES API=NO — syncing backend");
                _syncWithBackendInBackground();
              } else if (!isPremium && apiIsPremium) {
                debugPrint("isProUser: RC=NO API=YES — trusting API");
                isPremium = true;
              }
            }
          }
        } catch (apiError) {
          debugPrint("isProUser: profile API error: $apiError");
          if (!isPremium) {
            isPremium = storageService.getCachedSubscriptionStatus();
          }
        }
      }

      debugPrint("isProUser: final = ${isPremium ? 'PREMIUM' : 'FREE'}");
      await storageService.saveSubscriptionStatus(isPremium);
      isUserSubscribed.value = isPremium;
      return isPremium;
    } catch (e) {
      debugPrint("isProUser unexpected error: $e");
      final cached = Get.find<StorageService>().getCachedSubscriptionStatus();
      isUserSubscribed.value = cached;
      return cached;
    }
  }

  // ── Purchase ──────────────────────────────────────────────────────────────

  Future<Offerings?> getOfferings() async {
    try {
      return await Purchases.getOfferings();
    } catch (e) {
      debugPrint("getOfferings error: $e");
      return null;
    }
  }

  Future<PurchaseResult> purchasePackage(Package package) async {
    final String productId = package.storeProduct.identifier;
    final String platform = Platform.isAndroid ? 'android' : 'ios';
    final String pkgName = Platform.isAndroid
        ? AppConstants.androidPackageName
        : AppConstants.iosBundleId;

    try {
      final result = await Purchases.purchasePackage(package);

      final bool isActive =
          result.customerInfo.entitlements.active.isNotEmpty ||
          result.customerInfo.activeSubscriptions.isNotEmpty;

      debugPrint(
        "purchasePackage: isActive=$isActive "
        "subs=${result.customerInfo.activeSubscriptions}",
      );

      if (isActive) {
        await _notifyBackendSuccess(result.customerInfo, package: package);
        await isProUser(customerInfo: result.customerInfo);
        isUserSubscribed.value = true;
        await Get.find<StorageService>().saveSubscriptionStatus(true);
        return PurchaseResult.success;
      }

      debugPrint("purchasePackage: completed but no active entitlement");
      await _reportFailed(
        platform: platform,
        productId: productId,
        packageName: pkgName,
        errorCode: 'NO_ENTITLEMENT',
        errorMessage: 'Purchase completed but no active entitlement found',
      );
      return PurchaseResult.failed;
    } on PlatformException catch (e) {
      final String code = e.code;
      debugPrint("purchasePackage PlatformException: code=$code");

      switch (code) {
        case _RCErrorCode.cancelled:
          await _reportCancelled(
            platform: platform,
            productId: productId,
            packageName: pkgName,
          );
          return PurchaseResult.cancelled;

        case _RCErrorCode.alreadyOwned:
          debugPrint("purchasePackage: already owned, restoring...");
          final restored = await restorePurchases();
          return restored ? PurchaseResult.alreadyOwned : PurchaseResult.failed;

        case _RCErrorCode.pending:
          await _reportFailed(
            platform: platform,
            productId: productId,
            packageName: pkgName,
            errorCode: 'PAYMENT_PENDING',
            errorMessage: e.message ?? 'Payment is pending approval',
          );
          return PurchaseResult.paymentPending;

        default:
          await _reportFailed(
            platform: platform,
            productId: productId,
            packageName: pkgName,
            errorCode: code,
            errorMessage: e.message ?? 'Unknown purchase error',
          );
          return PurchaseResult.failed;
      }
    } catch (e) {
      debugPrint("purchasePackage unexpected error: $e");
      await _reportFailed(
        platform: platform,
        productId: productId,
        packageName: pkgName,
        errorCode: 'UNEXPECTED',
        errorMessage: e.toString(),
      );
      return PurchaseResult.failed;
    }
  }

  // ── Restore ───────────────────────────────────────────────────────────────

  Future<bool> restorePurchases() async {
    try {
      CustomerInfo customerInfo = await Purchases.restorePurchases();
      final bool isPro =
          customerInfo.entitlements.active.isNotEmpty ||
          customerInfo.activeSubscriptions.isNotEmpty;

      if (isPro) {
        await _notifyBackendSuccess(customerInfo);
        await isProUser(customerInfo: customerInfo);
        isUserSubscribed.value = true;
        await Get.find<StorageService>().saveSubscriptionStatus(true);
        return true;
      }
      return false;
    } catch (e) {
      debugPrint("restorePurchases error: $e");
      return false;
    }
  }

  // ── Backend notifications ─────────────────────────────────────────────────

  /// POST iap/verify — tells backend to set subscriptionStatus = "premium".
  ///
  /// Debounced: if this method was called within the last 60 seconds (e.g. by
  /// the CustomerInfo listener firing right after purchasePackage() already
  /// notified the backend), the duplicate call is silently dropped. This
  /// prevents Google Play / App Store from seeing two separate subscription
  /// activations, which can manifest as a double charge event in some stores.
  Future<void> _notifyBackendSuccess(
    CustomerInfo customerInfo, {
    Package? package,
  }) async {
    final now = DateTime.now();
    if (_lastBackendNotifyTime != null &&
        now.difference(_lastBackendNotifyTime!).inSeconds < 60) {
      debugPrint(
        "_notifyBackendSuccess: debounced (last call was "
        "${now.difference(_lastBackendNotifyTime!).inSeconds}s ago)",
      );
      return;
    }
    _lastBackendNotifyTime = now;

    try {
      final paymentService = Get.find<PaymentService>();
      final storageService = Get.find<StorageService>();
      final user = storageService.getUser();
      final String userId = (user?['id'] ?? user?['user_id'] ?? '').toString();

      final String productId = customerInfo.activeSubscriptions.isNotEmpty
          ? customerInfo.activeSubscriptions.first
          : (package?.storeProduct.identifier ?? 'unknown');

      final entitlement = customerInfo.entitlements.active.values.isNotEmpty
          ? customerInfo.entitlements.active.values.first
          : null;

      final Map<String, dynamic> body = {
        'platform': Platform.isAndroid ? 'android' : 'ios',
        'productId': productId,
        'purchaseToken': customerInfo.originalAppUserId,
        'transactionId': entitlement?.productIdentifier ?? '',
        'packageName': Platform.isAndroid
            ? AppConstants.androidPackageName
            : AppConstants.iosBundleId,
        'user_id': userId,
        'status': 'success',
        if (package != null) ...{
          'price': package.storeProduct.price,
          'currency': package.storeProduct.currencyCode,
        },
        if (entitlement != null) ...{
          'expirationDate': entitlement.expirationDate,
          'purchaseDate': entitlement.latestPurchaseDate,
        },
      };

      debugPrint("_notifyBackendSuccess: sending iap/verify for $productId");

      final res = await paymentService.verifyIap(
        platform: body['platform'],
        purchaseToken: body['purchaseToken'],
        productId: body['productId'],
        packageName: body['packageName'],
        extraData: body,
      );

      debugPrint("iap/verify response: ${res.statusCode}");
    } catch (e) {
      debugPrint("_notifyBackendSuccess error: $e");
    }
  }

  Future<void> _reportFailed({
    required String platform,
    required String productId,
    required String errorCode,
    required String errorMessage,
    String? packageName,
  }) async {
    try {
      final paymentService = Get.find<PaymentService>();
      final storageService = Get.find<StorageService>();
      final user = storageService.getUser();
      final String userId = (user?['id'] ?? user?['user_id'] ?? '').toString();

      debugPrint("_reportFailed: code=$errorCode");

      await paymentService.reportIapFailed(
        platform: platform,
        productId: productId,
        errorCode: errorCode,
        errorMessage: errorMessage,
        packageName: packageName,
        extraData: {'user_id': userId},
      );
    } catch (e) {
      debugPrint("_reportFailed error: $e");
    }
  }

  Future<void> _reportCancelled({
    required String platform,
    required String productId,
    String? packageName,
  }) async {
    try {
      final paymentService = Get.find<PaymentService>();
      final storageService = Get.find<StorageService>();
      final user = storageService.getUser();
      final String userId = (user?['id'] ?? user?['user_id'] ?? '').toString();

      debugPrint("_reportCancelled: product=$productId");

      await paymentService.reportIapCancelled(
        platform: platform,
        productId: productId,
        packageName: packageName,
        extraData: {'user_id': userId},
      );
    } catch (e) {
      debugPrint("_reportCancelled error: $e");
    }
  }

  // ── Sync helpers ──────────────────────────────────────────────────────────

  void _syncWithBackendInBackground() {
    Future.microtask(() async {
      try {
        CustomerInfo info = await Purchases.getCustomerInfo();
        await _notifyBackendSuccess(info);
      } catch (e) {
        debugPrint("Background backend sync error: $e");
      }
    });
  }

  Future<bool> syncWithAppStore() async {
    try {
      CustomerInfo info = await Purchases.getCustomerInfo();
      if (info.entitlements.active.isNotEmpty) {
        await _notifyBackendSuccess(info);
        return true;
      }
    } catch (e) {
      debugPrint("syncWithAppStore error: $e");
    }
    return false;
  }

  // ── Paywall (RevenueCat native UI) ────────────────────────────────────────

  Future<void> openSubscriptionPage() async {
    try {
      await RevenueCatUI.presentPaywall();
      await isProUser();
    } catch (e) {
      debugPrint("openSubscriptionPage error: $e");
    }
  }

  // ── Gating helper ─────────────────────────────────────────────────────────

  void checkSubscription(VoidCallback onPremiumFeature) async {
    if (isUserSubscribed.value) {
      onPremiumFeature();
      _silentVerify();
      return;
    }
    final isPro = await isProUser();
    if (isPro) {
      onPremiumFeature();
    } else {
      Get.toNamed('/subscription');
    }
  }

  // ── RevenueCat user management ────────────────────────────────────────────

  Future<void> logIn(String userId) async {
    try {
      await Purchases.logIn(userId);
      _silentVerify();
    } catch (e) {
      debugPrint("RevenueCat logIn error: $e");
    }
  }

  Future<void> logOut() async {
    try {
      await Purchases.logOut();
      isUserSubscribed.value = false;
      _lastBackendNotifyTime = null;
      await Get.find<StorageService>().clearSubscriptionCache();
    } catch (e) {
      debugPrint("RevenueCat logOut error: $e");
    }
  }
}
