import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:lawn_care/models/forum_model.dart';
import 'package:lawn_care/models/contest_model.dart';
import 'package:lawn_care/services/content_service.dart';

class MyContentCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();
  final ProfileCtrl _profileCtrl = Get.find<ProfileCtrl>();

  var myPosts = <ForumPost>[].obs;
  var myContestEntries = <CompetitionEntry>[].obs;
  var isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchMyPosts();
  }

  Future<void> fetchMyPosts() async {
    try {
      isLoading.value = true;

      // 1. Fetch Forum Posts
      final postResponse = await _contentService.getForumPosts(limit: 100);

      // 2. Fetch Competitions (to get entries from them)
      final contestResponse = await _contentService.getActiveCompetition();

      final String currentUserId = _profileCtrl.userId.value;
      final String currentName = _profileCtrl.userName.value.toLowerCase();

      // Process Forum Posts
      if (postResponse.statusCode == 200 && postResponse.body != null) {
        final List<dynamic> data = postResponse.body['data'] ?? [];
        final allPosts = data.map((json) => ForumPost.fromJson(json)).toList();

        myPosts.value = allPosts.where((p) {
          final postUserId = p.author.userId;
          final postUserName = p.author.userName.toLowerCase();

          return (currentUserId.isNotEmpty && postUserId == currentUserId) ||
              (currentName.isNotEmpty && postUserName == currentName) ||
              (postUserName == 'guest' && currentName == 'guest');
        }).toList();
      }

      // Process Contest Entries
      if (contestResponse.statusCode == 200 && contestResponse.body != null) {
        var body = contestResponse.body;
        List<dynamic> competitionsList = [];

        // The response is a List of Competitions (roots)
        if (body is List) {
          competitionsList = body;
        } else if (body is Map) {
          // Handle wrapper keys just in case
          var extracted = body['data'] ?? body['competitions'];
          if (extracted is List) {
            competitionsList = extracted;
          } else {
            // Single object returned?
            competitionsList = [body];
          }
        }

        print("DEBUG: Found ${competitionsList.length} competitions");

        List<CompetitionEntry> allCollectedEntries = [];

        for (var comp in competitionsList) {
          if (comp is Map && comp['entries'] != null) {
            var entriesList = comp['entries'];
            if (entriesList is List) {
              for (var entryJson in entriesList) {
                try {
                  allCollectedEntries.add(
                    CompetitionEntry.fromJson(
                      Map<String, dynamic>.from(entryJson),
                    ),
                  );
                } catch (e) {
                  print("Error parsing entry: $e");
                }
              }
            }
          }
        }

        print("DEBUG: Collected ${allCollectedEntries.length} total entries.");
        print("DEBUG: Filter Target: UserID='$currentUserId'");

        myContestEntries.value = allCollectedEntries.where((e) {
          final entryUserId = e.userId.toString();
          // Match by ID primarily
          return (currentUserId.isNotEmpty && entryUserId == currentUserId);
        }).toList();

        print("DEBUG: Final Filtered User Entries: ${myContestEntries.length}");
      }

      print(
        "Fetched ${myPosts.length} posts and ${myContestEntries.length} entries for user $currentName ($currentUserId)",
      );
    } catch (e) {
      print("Error fetching my content: $e");
    } finally {
      isLoading.value = false;
    }
  }
}
