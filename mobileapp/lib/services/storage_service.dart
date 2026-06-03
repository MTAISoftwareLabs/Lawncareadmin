import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService extends GetxService {
  late final SharedPreferences _prefs;

  Future<StorageService> init() async {
    _prefs = await SharedPreferences.getInstance();
    return this;
  }

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _themeKey = 'is_dark_mode';
  static const String _guestKey = 'is_guest';
  static const String _subscriptionStatusKey = 'cached_subscription_status';
  static const String _subscriptionCheckedAtKey = 'subscription_checked_at';
  static const String _userEventsPrefix = 'user_events_';
  static const String _avatarPrefix = 'avatar_';

  // Token
  Future<bool> saveToken(String token) async {
    return await _prefs.setString(_tokenKey, token);
  }

  String? getToken() {
    return _prefs.getString(_tokenKey)?.trim();
  }

  // Guest Mode
  Future<bool> saveIsGuest(bool isGuest) async {
    return await _prefs.setBool(_guestKey, isGuest);
  }

  bool isGuest() {
    return _prefs.getBool(_guestKey) ?? false;
  }

  // User Data
  Future<bool> saveUser(Map<String, dynamic> user) async {
    return await _prefs.setString(_userKey, jsonEncode(user));
  }

  /// Merges [partial] fields into the existing stored user data.
  /// Fields present in [partial] overwrite those in storage;
  /// fields not in [partial] are left untouched.
  Future<void> mergeUser(Map<String, dynamic> partial) async {
    final existing = getUser() ?? {};
    existing.addAll(partial);
    await saveUser(existing);
  }

  Map<String, dynamic>? getUser() {
    final userData = _prefs.getString(_userKey);
    if (userData != null) {
      return jsonDecode(userData) as Map<String, dynamic>;
    }
    return null;
  }

  // ── Per-user avatar (survives logout) ──────────────────────────────────────
  /// Persists the avatar URL under a user-specific key so it survives logout.
  Future<void> saveAvatarForUser(String userId, String avatarUrl) async {
    if (userId.isEmpty || avatarUrl.isEmpty) return;
    await _prefs.setString('$_avatarPrefix$userId', avatarUrl);
  }

  /// Returns the last-known avatar URL for [userId], or null.
  String? getAvatarForUser(String userId) {
    if (userId.isEmpty) return null;
    return _prefs.getString('$_avatarPrefix$userId');
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Per-user calendar events (survives logout) ─────────────────────────────
  /// Returns the SharedPreferences key for the current user's events.
  String getUserEventsKey() {
    final userData = getUser();
    if (userData != null) {
      final id = (userData['id'] ?? userData['user_id'])?.toString();
      if (id != null && id.isNotEmpty) {
        return '$_userEventsPrefix$id';
      }
    }
    return '${_userEventsPrefix}guest';
  }

  Future<void> saveUserEvents(String eventsJson) async {
    await _prefs.setString(getUserEventsKey(), eventsJson);
  }

  String? loadUserEvents() {
    return _prefs.getString(getUserEventsKey());
  }
  // ──────────────────────────────────────────────────────────────────────────

  // ── Subscription Status Cache ──────────────────────────────────────────────
  Future<void> saveSubscriptionStatus(bool isPremium) async {
    await _prefs.setBool(_subscriptionStatusKey, isPremium);
    await _prefs.setString(
      _subscriptionCheckedAtKey,
      DateTime.now().toIso8601String(),
    );
  }

  bool getCachedSubscriptionStatus() {
    return _prefs.getBool(_subscriptionStatusKey) ?? false;
  }

  int? minutesSinceLastSubscriptionCheck() {
    final raw = _prefs.getString(_subscriptionCheckedAtKey);
    if (raw == null) return null;
    final checkedAt = DateTime.tryParse(raw);
    if (checkedAt == null) return null;
    return DateTime.now().difference(checkedAt).inMinutes;
  }

  Future<void> clearSubscriptionCache() async {
    await _prefs.remove(_subscriptionStatusKey);
    await _prefs.remove(_subscriptionCheckedAtKey);
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Theme
  Future<bool> saveThemeMode(bool isDarkMode) async {
    return await _prefs.setBool(_themeKey, isDarkMode);
  }

  bool isDarkMode() {
    return _prefs.getBool(_themeKey) ?? true;
  }

  static const String _notificationsKey = 'notification_history';

  // Notification History
  Future<void> saveNotification(Map<String, dynamic> notification) async {
    final list = getNotifications();
    notification['receivedAt'] = DateTime.now().toIso8601String();
    list.insert(0, notification);
    if (list.length > 50) list.removeLast();
    await _prefs.setString(_notificationsKey, jsonEncode(list));
  }

  List<Map<String, dynamic>> getNotifications() {
    final data = _prefs.getString(_notificationsKey);
    if (data != null) {
      final List<dynamic> decoded = jsonDecode(data);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return [];
  }

  Future<void> clearNotifications() async {
    await _prefs.remove(_notificationsKey);
  }

  /// Clears auth/session data only.
  /// Per-user events (user_events_{id}), avatars (avatar_{id}), and theme
  /// are intentionally preserved so they survive logout → login.
  Future<void> clearAuthData() async {
    await _prefs.remove(_tokenKey);
    await _prefs.remove(_userKey);
    await _prefs.remove(_guestKey);
    await _prefs.remove(_subscriptionStatusKey);
    await _prefs.remove(_subscriptionCheckedAtKey);
    await _prefs.remove(_notificationsKey);
  }

  // Full clear (e.g. account deletion)
  Future<bool> clearAll() async {
    return await _prefs.clear();
  }

  bool hasToken() {
    final token = getToken();
    return token != null && token.isNotEmpty;
  }
}
