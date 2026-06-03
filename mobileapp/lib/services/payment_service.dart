import 'package:get/get.dart';
import 'base_client.dart';
import 'api_endpoints.dart';

class PaymentService extends GetxService {
  final BaseClient _client = BaseClient.to;

  // ── Stripe ────────────────────────────────────────────────────────────────

  Future<Response> getStripeConfig() async =>
      await _client.getRequest(ApiEndpoints.stripeConfig);

  Future<Response> getStripeProducts() async =>
      await _client.getRequest(ApiEndpoints.stripeProducts);

  Future<Response> createCheckoutSession(
    String priceId,
    String successUrl,
    String cancelUrl,
  ) async {
    return await _client.postRequest(ApiEndpoints.createCheckout, {
      'priceId': priceId,
      'successUrl': successUrl,
      'cancelUrl': cancelUrl,
    });
  }

  Future<Response> createCustomerPortal(String returnUrl) async {
    return await _client.postRequest(ApiEndpoints.createPortal, {
      'returnUrl': returnUrl,
    });
  }

  Future<Response> getSubscriptionStatus() async =>
      await _client.getRequest(ApiEndpoints.subscriptionStatus);

  Future<Response> getSubscriptionPlans() async =>
      await _client.getRequest(ApiEndpoints.subscriptionPlans);

  Future<Response> getUserSubscription() async =>
      await _client.getRequest(ApiEndpoints.subscription);

  Future<Response> createSubscription(int planId) async {
    return await _client.postRequest(ApiEndpoints.subscription, {
      'planId': planId,
    });
  }

  Future<Response> createSubscriptionV2({
    required int planId,
    required String paymentMethodId,
  }) async {
    return await _client.postRequest(ApiEndpoints.subscriptionsCreate, {
      'planId': planId,
      'paymentMethodId': paymentMethodId,
    });
  }

  Future<Response> cancelSubscription() async {
    return await _client.postRequest(ApiEndpoints.subscriptionsCancel, {});
  }

  // ── In-App Purchases — Full Lifecycle ─────────────────────────────────────

  /// Called when a purchase is verified and completed successfully.
  /// Tells the backend to set subscriptionStatus = "premium".
  Future<Response> verifyIap({
    required String platform,
    String? receipt,
    String? purchaseToken,
    required String productId,
    String? packageName,
    Map<String, dynamic>? extraData,
  }) async {
    return await _client.postRequest(ApiEndpoints.verifyIap, {
      'platform': platform,
      if (receipt != null) 'receipt': receipt,
      if (purchaseToken != null) 'purchaseToken': purchaseToken,
      'productId': productId,
      if (packageName != null) 'packageName': packageName,
      if (extraData != null) ...extraData,
    });
  }

  /// Called when a purchase attempt fails due to a payment or store error.
  /// Lets the backend log the failure for analytics/support.
  Future<Response> reportIapFailed({
    required String platform,
    required String productId,
    required String errorCode,
    required String errorMessage,
    String? packageName,
    Map<String, dynamic>? extraData,
  }) async {
    return await _client.postRequest(ApiEndpoints.failedIap, {
      'platform': platform,
      'productId': productId,
      'errorCode': errorCode,
      'errorMessage': errorMessage,
      if (packageName != null) 'packageName': packageName,
      if (extraData != null) ...extraData,
    });
  }

  /// Called when a user explicitly cancels the purchase flow
  /// (dismisses the payment sheet without completing payment).
  /// Lets the backend log the cancellation for analytics.
  Future<Response> reportIapCancelled({
    required String platform,
    required String productId,
    String? packageName,
    Map<String, dynamic>? extraData,
  }) async {
    return await _client.postRequest(ApiEndpoints.cancelledIap, {
      'platform': platform,
      'productId': productId,
      if (packageName != null) 'packageName': packageName,
      if (extraData != null) ...extraData,
    });
  }
}
