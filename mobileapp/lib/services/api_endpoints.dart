class ApiEndpoints {
  static const String baseUrl = 'https://thelawncareworkshop.com/api/';

  // Authentication
  static const String register = 'auth/register';
  static const String login = 'auth/login';
  static const String phoneLogin = 'auth/phone-login';
  static const String verifyOtp = 'auth/verify-otp';
  static const String socialLogin = 'auth/social-login';
  static const String me = 'auth/me';
  static const String logout = 'auth/logout';
  static const String forgotPassword = 'auth/forgot-password';
  static const String resetPassword = 'auth/reset-password';

  // User Profile & Devices
  static const String profile = 'user/profile';
  static const String device = 'user/device';
  static const String devices = 'user/devices';

  // Payments & Subscriptions
  static const String stripeConfig = 'stripe/config';
  static const String stripeProducts = 'stripe/products';
  static const String createCheckout = 'stripe/create-checkout';
  static const String createPortal = 'stripe/create-portal';
  static const String subscriptionStatus = 'stripe/subscription-status';
  static const String subscriptionPlans = 'subscription-plans';
  static const String subscription = 'subscription';
  static const String subscriptionsCreate = 'subscriptions/create';
  static const String subscriptionsCancel = 'subscriptions/cancel';

  // In-App Purchase (IAP) endpoints — full lifecycle
  static const String verifyIap = 'iap/verify';       // Purchase succeeded
  static const String failedIap = 'iap/failed';       // Purchase failed (payment error, store error, etc.)
  static const String cancelledIap = 'iap/cancelled'; // User explicitly cancelled the purchase flow

  // Content Library
  static const String libraryCategories = 'library/categories';
  static const String libraryItems = 'library/items';
  static const String favorites = 'favorites';
  static String libraryItemDetail(int id) => 'library/items/$id';
  static String toggleFavorite(int id) => 'library/items/$id/favorite';

  // Forum & Community
  static const String forumPosts = 'forum/posts';
  static String forumPostDetail(dynamic id) => 'forum/posts/$id';
  static String likePost(dynamic id) => 'forum/posts/$id/like';
  static String postComments(dynamic id) => 'forum/posts/$id/comments';

  // Expert Q&A
  static const String expertQuestions = 'expert-questions';
  static const String myQuestions = 'expert-questions/my';

  // Competitions
  static const String competitions = 'competitions';
  static const String activeCompetition = 'competitions';
  static const String competitionWinners = 'contest/winners';
  static String competitionDetail(int id) => 'competitions/$id';
  static String submitEntry(String id) => 'contest/entries';
  static const String currentEntries = 'contest/entries';
  static String voteEntry(String id) => 'entries/$id/vote';

  // Lessons
  static const String lessons = 'lessons';
  static const String recentLessons = 'lessons/recent';
  static String lessonDetail(int id) => 'lessons/$id';
  static String lessonProgress(int id) => 'lessons/$id/progress';

  // Lawn Care
  static const String grassTypes = 'grass-types';
  static const String lawnCarePlans = 'lawn-care-plans';
  static const String upcomingLawnPlans = 'lawn-plans/upcoming';
  static const String lawnProfiles = 'lawn-profiles';
  static String lawnProfileDetail(int id) => 'lawn-profiles/$id';
  static const String diagnoses = 'diagnoses';

  // Deals & Content
  static const String deals = 'deals';
  static String dealDetail(int id) => 'deals/$id';
  static const String banners = 'banners';
  static const String testimonials = 'testimonials';
  static const String faqs = 'faqs';
  static const String blog = 'blog';
  static String blogDetail(String slug) => 'blog/$slug';
  static const String settings = 'settings';

  // Notifications
  static const String notifications = 'notifications';
  static String notificationRead(dynamic id) => 'notifications/$id/read';
  static String notificationDelete(dynamic id) => 'notifications/$id';

  // Admin Dashboard
  static const String adminDashboardStats = 'admin/dashboard-stats';
  static const String adminStats = 'admin/stats';
  static const String adminUsers = 'admin/users';
  static String adminUserDetail(int id) => 'admin/users/$id';
  static String adminUserBan(int id) => 'admin/users/$id/ban';
  static String adminUserSubscription(int id) => 'admin/users/$id/subscription';

  static const String adminGrassTypes = 'admin/grass-types';
  static String adminGrassTypeDetail(dynamic id) => 'admin/grass-types/$id';

  static const String adminLessons = 'admin/lessons';
  static String adminLessonDetail(dynamic id) => 'admin/lessons/$id';

  static const String adminDeals = 'admin/deals';
  static String adminDealDetail(dynamic id) => 'admin/deals/$id';

  static const String adminCompetitions = 'admin/competitions';
  static String adminCompetitionDetail(dynamic id) => 'admin/competitions/$id';

  static const String adminQuestions = 'admin/questions';
  static String adminQuestionReply(dynamic id) => 'admin/questions/$id/reply';

  static const String adminDiagnoses = 'admin/diagnoses';
  static String adminDiagnosisDetail(dynamic id) => 'admin/diagnoses/$id';

  static const String home = 'home';
  static const String privacyContent = 'privacy-content';

  // Chat
  static const String chatList = 'chats';
  static const String chatUpload = 'chats/upload';
  static const String chatUnreadCount = 'chats/unread-count';
  static String chatMessages(dynamic id) => 'chats/$id/messages';
  static String deleteMessage(dynamic id) => 'chats/messages/$id';
  static const String supportStartChat = 'support/start-chat';

  // Media Upload
  static const String uploadMedia = 'upload/media';

  static String formatImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('assets/')) return url;
    if (url.startsWith('data:')) return url;

    String base = baseUrl.replaceAll('/api/', '');
    if (url.startsWith('/')) {
      return '$base$url';
    }
    return '$base/$url';
  }
}
