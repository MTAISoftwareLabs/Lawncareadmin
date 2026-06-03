import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:purchases_flutter/purchases_flutter.dart' hide PurchaseResult;
import 'package:lawn_care/helpers/subscription_helper.dart';

const Color emerald = Color(0xFF10B981);
const Color _errorRed = Color(0xFFEF4444);
const Color _warningAmber = Color(0xFFF59E0B);

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  bool isYearly = true;
  Offerings? offerings;
  bool isLoading = true;
  bool isPurchasing = false;
  bool isRestoring = false;

  @override
  void initState() {
    super.initState();
    _checkIfAlreadySubscribed();
    _loadOfferings();
  }

  // If the user is already premium (e.g. navigated here by mistake), close immediately.
  Future<void> _checkIfAlreadySubscribed() async {
    if (SubscriptionHelper.instance.isUserSubscribed.value) {
      if (mounted) Get.back();
      return;
    }
    final isPro = await SubscriptionHelper.instance.isProUser();
    if (isPro && mounted) Get.back();
  }

  Future<void> _loadOfferings() async {
    final fetched = await SubscriptionHelper.instance.getOfferings();
    if (mounted) {
      setState(() {
        offerings = fetched;
        isLoading = false;
      });
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      // Auto-dismiss if subscription becomes active while screen is open
      if (SubscriptionHelper.instance.isUserSubscribed.value) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (Get.currentRoute == '/subscription') Get.back();
        });
        return const Scaffold(backgroundColor: Color(0xFF0F172A));
      }

      return Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: Stack(
          children: [
            _decorativeBg(),
            SafeArea(
              child: Column(
                children: [
                  _buildHeader(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 20),
                          _buildTitle(),
                          const SizedBox(height: 32),
                          _buildFeatureList(),
                          const SizedBox(height: 40),
                          _buildToggle(),
                          const SizedBox(height: 24),
                          _buildPriceCard(),
                          const SizedBox(height: 40),
                          _buildProceedButton(),
                          const SizedBox(height: 16),
                          _buildRestoreButton(),
                          const SizedBox(height: 20),
                          _buildFooterLinks(),
                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  // ── Decorative background ─────────────────────────────────────────────────

  Widget _decorativeBg() {
    return Stack(
      children: [
        Positioned(
          top: -100,
          right: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue.withOpacity(0.08),
            ),
          ),
        ),
        Positioned(
          bottom: -50,
          left: -50,
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: emerald.withOpacity(0.08),
            ),
          ),
        ),
      ],
    );
  }

  // ── Header ────────────────────────────────────────────────────────────────

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          ),
          const Text(
            "Go Pro",
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  // ── Title ─────────────────────────────────────────────────────────────────

  Widget _buildTitle() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: emerald.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.star_rounded, color: emerald, size: 40),
        ),
        const SizedBox(height: 24),
        const Text(
          "Unlock Premium Access",
          style: TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          "Get expert lawn care advice and instant AI diagnostics.",
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 16),
        ),
      ],
    );
  }

  // ── Feature list ──────────────────────────────────────────────────────────

  Widget _buildFeatureList() {
    const features = [
      "Unlimited AI Lawn Diagnostics",
      "Expert Plant Identification",
      "Tailored Fertilization Plans",
      "Priority Support Access",
    ];
    return Column(
      children: features
          .map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    color: emerald,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    f,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  // ── Plan toggle ───────────────────────────────────────────────────────────

  Widget _buildToggle() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(child: _toggleBtn("Monthly", !isYearly)),
          Expanded(child: _toggleBtn("Yearly", isYearly)),
        ],
      ),
    );
  }

  Widget _toggleBtn(String title, bool active) {
    return GestureDetector(
      onTap: () => setState(() => isYearly = title == "Yearly"),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: active ? emerald : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: active ? Colors.black : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // ── Price card ────────────────────────────────────────────────────────────

  Widget _buildPriceCard() {
    if (isLoading) {
      return const CircularProgressIndicator(color: emerald);
    }

    // Default fallback prices (shown if RevenueCat offerings haven't loaded)
    String price = isYearly ? "\$89.99" : "\$9.99";
    String period = isYearly ? "/ year" : "/ month";
    bool showBestValue = isYearly;

    if (offerings?.current != null) {
      final pkg = isYearly
          ? offerings!.current!.annual
          : offerings!.current!.monthly;
      if (pkg != null) price = pkg.storeProduct.priceString;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          if (showBestValue)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: emerald.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                "Best Value — 25% OFF",
                style: TextStyle(
                  color: emerald,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                price,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  period,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 18,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Purchase button ───────────────────────────────────────────────────────

  Widget _buildProceedButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: isPurchasing ? null : _handlePurchase,
        style: ElevatedButton.styleFrom(
          backgroundColor: emerald,
          foregroundColor: Colors.black,
          disabledBackgroundColor: emerald.withOpacity(0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
        ),
        child: isPurchasing
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.black,
                ),
              )
            : const Text(
                "Subscribe Now",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }

  // ── Restore button ────────────────────────────────────────────────────────

  Widget _buildRestoreButton() {
    return TextButton(
      onPressed: isRestoring ? null : _handleRestore,
      child: isRestoring
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white54,
              ),
            )
          : const Text(
              "Restore Purchases",
              style: TextStyle(color: Colors.white54, fontSize: 14),
            ),
    );
  }

  // ── Footer links ──────────────────────────────────────────────────────────

  Widget _buildFooterLinks() {
    return Column(
      children: [
        const Text(
          "Recurring billing. Cancel anytime in your device settings.",
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white38, fontSize: 12),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _footerLink("Terms of Use"),
            _vDivider(),
            _footerLink("Privacy Policy"),
          ],
        ),
      ],
    );
  }

  Widget _footerLink(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white38,
          fontSize: 12,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  Widget _vDivider() =>
      Container(width: 1, height: 12, color: Colors.white12);

  // ── Purchase logic ────────────────────────────────────────────────────────

  Future<void> _handlePurchase() async {
    if (offerings == null || offerings!.current == null) {
      _showError(
        "Store Unavailable",
        "Could not connect to the store. Please check your connection and try again.",
      );
      return;
    }

    final Package? package = isYearly
        ? offerings!.current!.annual
        : offerings!.current!.monthly;

    if (package == null) {
      _showError(
        "Package Not Found",
        isYearly
            ? "The yearly plan is not available in your region."
            : "The monthly plan is not available in your region.",
      );
      return;
    }

    setState(() => isPurchasing = true);

    final PurchaseResult result =
        await SubscriptionHelper.instance.purchasePackage(package);

    if (!mounted) return;
    setState(() => isPurchasing = false);

    switch (result) {
      case PurchaseResult.success:
        // Small delay to let reactive state propagate before popping
        await Future.delayed(const Duration(milliseconds: 300));
        if (mounted && Get.currentRoute == '/subscription') Get.back();
        Get.snackbar(
          "Welcome to Premium! 🎉",
          "You now have full access to all features.",
          backgroundColor: emerald,
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
          snackPosition: SnackPosition.TOP,
        );
        break;

      case PurchaseResult.cancelled:
        // User deliberately cancelled — no error, just a subtle note
        Get.snackbar(
          "Purchase Cancelled",
          "You can subscribe anytime you're ready.",
          backgroundColor: Colors.white12,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );
        break;

      case PurchaseResult.alreadyOwned:
        // Purchase was restored automatically
        await Future.delayed(const Duration(milliseconds: 300));
        if (mounted && Get.currentRoute == '/subscription') Get.back();
        Get.snackbar(
          "Subscription Restored",
          "Your existing subscription has been restored successfully.",
          backgroundColor: emerald,
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          duration: const Duration(seconds: 4),
        );
        break;

      case PurchaseResult.paymentPending:
        // Ask to Buy or pending store review
        Get.snackbar(
          "Purchase Pending ⏳",
          "Your purchase is awaiting approval. You'll get access as soon as it's confirmed.",
          backgroundColor: _warningAmber,
          colorText: Colors.black,
          snackPosition: SnackPosition.TOP,
          duration: const Duration(seconds: 6),
        );
        break;

      case PurchaseResult.failed:
        _showError(
          "Purchase Failed",
          "Your payment could not be processed. Please check your payment method and try again.",
        );
        break;
    }
  }

  // ── Restore logic ─────────────────────────────────────────────────────────

  Future<void> _handleRestore() async {
    setState(() => isRestoring = true);
    final bool success =
        await SubscriptionHelper.instance.restorePurchases();
    if (!mounted) return;
    setState(() => isRestoring = false);

    if (success) {
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted && Get.currentRoute == '/subscription') Get.back();
      Get.snackbar(
        "Subscription Restored",
        "Your premium subscription has been restored.",
        backgroundColor: emerald,
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 4),
      );
    } else {
      Get.snackbar(
        "Nothing to Restore",
        "No active subscription was found for this Apple ID / Google account.",
        backgroundColor: Colors.white12,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 4),
      );
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  void _showError(String title, String message) {
    Get.snackbar(
      title,
      message,
      backgroundColor: _errorRed,
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 5),
      icon: const Icon(Icons.error_outline, color: Colors.white),
    );
  }
}
