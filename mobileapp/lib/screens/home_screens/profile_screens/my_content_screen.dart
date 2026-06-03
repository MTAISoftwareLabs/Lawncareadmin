import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/my_content_ctrl.dart';
import 'package:lawn_care/screens/home_screens/forum_screen.dart';
import 'package:lawn_care/screens/home_screens/post_detail_screen.dart';
import 'package:lawn_care/utils/appcolor.dart';

class MyContentScreen extends StatelessWidget {
  const MyContentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final MyContentCtrl controller = Get.put(MyContentCtrl());

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColor().alternate,
        appBar: AppBar(
          centerTitle: true,
          title: Text(
            'My Contents',
            style: TextStyle(
              color: AppColor().secondary,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Colors.white70),
            onPressed: () => Get.back(),
          ),
          backgroundColor: AppColor().primary,
          elevation: 0,
          bottom: TabBar(
            indicatorColor: AppColor().secondary,
            labelColor: AppColor().secondary,
            unselectedLabelColor: Colors.white70,
            tabs: const [
              Tab(text: "Forum Posts"),
              Tab(text: "Contest Entries"),
            ],
          ),
          actions: [
            IconButton(
              onPressed: controller.fetchMyPosts,
              icon: const Icon(Icons.refresh, color: Colors.white70),
            ),
          ],
        ),
        body: Container(
          height: double.infinity,
          width: double.infinity,
          color: AppColor().alternate,
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator());
            }

            return TabBarView(
              children: [
                // Tab 1: Forum Posts
                _buildForumPostsList(controller),

                // Tab 2: Contest Entries
                _buildContestEntriesList(controller),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildForumPostsList(MyContentCtrl controller) {
    if (controller.myPosts.isEmpty) {
      return _buildEmptyState("You haven't posted in the forum yet.");
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      itemCount: controller.myPosts.length,
      itemBuilder: (context, index) {
        final post = controller.myPosts[index];
        return ForumPostCard(
          post: post,
          onLike: () {},
          onComment: () => Get.to(() => PostDetailScreen(post: post)),
        );
      },
    );
  }

  Widget _buildContestEntriesList(MyContentCtrl controller) {
    if (controller.myContestEntries.isEmpty) {
      return _buildEmptyState("You haven't joined any competitions yet.");
    }
    return GridView.builder(
      padding: const EdgeInsets.all(20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
        childAspectRatio: 0.8,
      ),
      itemCount: controller.myContestEntries.length,
      itemBuilder: (context, index) {
        final entry = controller.myContestEntries[index];
        return GestureDetector(
          onTap: () {
            // Open detail if needed or just show image
            // Get.to(() => ContestEntryDetailScreen(entry: entry)); // Ensure import if used
          },
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1E3A25),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: AppColor().primary, width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(15),
                    ),
                    child: Image.network(
                      entry.imageUrl.startsWith('http')
                          ? entry.imageUrl
                          : 'https://thelawncareworkshop.com/${entry.imageUrl}',
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (c, o, s) => Container(
                        color: Colors.grey,
                        child: const Icon(Icons.error),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.caption,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '${entry.votes} votes',
                        style: TextStyle(
                          color: AppColor().secondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.post_add_rounded, size: 80, color: AppColor().primary),
          const SizedBox(height: 20),
          Text(
            message,
            style: TextStyle(
              color: AppColor().primary,
              fontSize: 18,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
