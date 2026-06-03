import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'dart:io';
import 'base_client.dart';
import 'api_endpoints.dart';

class ContentService extends GetxService {
  final BaseClient _client = BaseClient.to;

  Future<Response> getBanners() async =>
      await _client.getRequest(ApiEndpoints.banners);

  Future<Response> getHomeData() async =>
      await _client.getRequest(ApiEndpoints.home);

  Future<Response> getLibraryCategories() async =>
      await _client.getRequest(ApiEndpoints.libraryCategories);

  Future<Response> getLibraryItems({
    int? categoryId,
    String? searchQuery,
    int page = 1,
    int limit = 20,
  }) async {
    return await _client.getRequest(
      ApiEndpoints.libraryItems,
      query: {
        if (categoryId != null) 'category_id': categoryId.toString(),
        if (searchQuery != null) 'search_query': searchQuery,
        'page': page.toString(),
        'limit': limit.toString(),
      },
    );
  }

  Future<Response> getLibraryItemDetail(int id) async =>
      await _client.getRequest(ApiEndpoints.libraryItemDetail(id));

  Future<Response> toggleFavorite(int id) async =>
      await _client.postRequest(ApiEndpoints.toggleFavorite(id), {});

  Future<Response> getUserFavorites() async =>
      await _client.getRequest(ApiEndpoints.favorites);

  Future<Response> getForumPosts({
    int page = 1,
    int limit = 20,
    String sortBy = 'newest',
  }) async {
    return await _client.getRequest(
      ApiEndpoints.forumPosts,
      query: {
        'page': page.toString(),
        'limit': limit.toString(),
        'sort_by': sortBy,
      },
    );
  }

  Future<Response> getForumPostDetail(String id) async =>
      await _client.getRequest(ApiEndpoints.forumPostDetail(id));

  Future<Response> getActiveCompetition() async =>
      await _client.getRequest(ApiEndpoints.activeCompetition);

  Future<Response> getCompetitionDetail(int id) async =>
      await _client.getRequest(ApiEndpoints.competitionDetail(id));

  Future<Response> getCompetitionWinners() async =>
      await _client.getRequest(ApiEndpoints.competitionWinners);

  Future<Response> getCompetitionEntries() async =>
      await _client.getRequest(ApiEndpoints.currentEntries);

  Future<Response> submitCompetitionEntry(
    String id,
    String imageUrl,
    String caption,
  ) async {
    return await _client.postRequest(
      ApiEndpoints.submitEntry(id),
      {'title': caption, 'description': caption, 'imageUrl': imageUrl},
      headers: {'X-Skip-Error': 'true'},
    );
  }

  Future<Response> voteEntry(int entryId) async =>
      await _client.postRequest(ApiEndpoints.voteEntry(entryId.toString()), {});

  Future<Response> createForumPost(
    String content,
    List imageUrls,
    String userName,
  ) async {
    return await _client.postRequest(ApiEndpoints.forumPosts, {
      'content': content,
      'image_urls': imageUrls,
      'author_name': userName,
      'user_name': userName,
      'name': userName,
    });
  }

  Future<Response> uploadMedia(File file) async {
    final fileName = file.path.split(RegExp(r'[/\\]')).last;
    final extension = fileName.split('.').last.toLowerCase();
    final contentType = extension == 'png' ? 'image/png' : 'image/jpeg';

    // Read bytes first — GetConnect's MultipartFile requires List<int>,
    // not a File object directly (passing File causes a null status response).
    final bytes = await file.readAsBytes();

    final formData = FormData({
      'file': MultipartFile(bytes, filename: fileName, contentType: contentType),
    });

    print("ContentService.uploadMedia: file=$fileName type=$contentType size=${bytes.length}b");
    return await _client.postRequest(ApiEndpoints.uploadMedia, formData);
  }

  Future<Response> toggleLikePost(String id) async =>
      await _client.postRequest(ApiEndpoints.likePost(id), {});

  Future<Response> getPostComments(String id, {int page = 1}) async {
    return await _client.getRequest(
      ApiEndpoints.postComments(id),
      query: {'page': page.toString()},
    );
  }

  Future<Response> addComment(
    String id,
    String content,
    String? imageUrl,
    String userName,
  ) async {
    return await _client.postRequest(ApiEndpoints.postComments(id), {
      'content': content,
      'image_urls': imageUrl != null ? [imageUrl] : [],
      'author_name': userName,
      'user_name': userName,
      'name': userName,
    });
  }

  Future<Response> getTestimonials() async =>
      await _client.getRequest(ApiEndpoints.testimonials);

  Future<Response> getFaqs() async =>
      await _client.getRequest(ApiEndpoints.faqs);

  Future<Response> getBlogPosts() async =>
      await _client.getRequest(ApiEndpoints.blog);

  Future<Response> getBlogPostDetail(String slug) async =>
      await _client.getRequest(ApiEndpoints.blogDetail(slug));

  Future<Response> getSiteSettings() async =>
      await _client.getRequest(ApiEndpoints.settings);

  Future<Response> getPrivacyContent() async =>
      await _client.getRequest(ApiEndpoints.privacyContent);

  Future<Response> getChats() async =>
      await _client.getRequest(ApiEndpoints.chatList);

  Future<Response> startChat(String recipientId) async {
    return await _client.postRequest(ApiEndpoints.chatList, {
      'recipientId': int.tryParse(recipientId) ?? recipientId,
    });
  }

  Future<Response> getChatMessages(String chatId, {int page = 1}) async {
    final url = '${ApiEndpoints.chatMessages(chatId)}?page=$page';
    print("ContentService.getChatMessages: chatId=$chatId page=$page");
    return await _client.getRequest(url);
  }

  Future<Response> sendMessage(
    String chatId,
    String content, {
    String? imageUrl,
    String type = 'text',
  }) async {
    return await _client.postRequest(ApiEndpoints.chatMessages(chatId), {
      'content': content,
      'type': type,
      if (imageUrl != null) 'file_url': imageUrl,
    });
  }

  Future<Response> deleteMessage(String messageId) async {
    return await _client.deleteRequest(ApiEndpoints.deleteMessage(messageId));
  }

  Future<Response> startSupportChat() async {
    return await _client.postRequest(ApiEndpoints.supportStartChat, {});
  }

  Future<Response> getDeals() async =>
      await _client.getRequest(ApiEndpoints.deals);
}
