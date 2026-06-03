import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/post_detail_ctrl.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:lawn_care/models/forum_model.dart';
import 'package:lawn_care/screens/home_screens/forum_screen.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

class PostDetailScreen extends StatelessWidget {
  final ForumPost post;

  const PostDetailScreen({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final PostDetailCtrl controller = Get.put(PostDetailCtrl(post));

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColor().primary,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 10),
          child: CostomeBackBotton(onPressed: () => Get.back()),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: Icon(Icons.notifications_none, color: AppColor().secondary),
          ),
        ],
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Original Post
                      ForumPostCard(
                        post: post,
                        onLike: () {}, // Handled in detail if needed
                        onComment: () {},
                      ),

                      const SizedBox(height: 10),
                      Text(
                        'Write a Comment',
                        style: TextStyle(
                          color: AppColor().primary,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 15),

                      // Posting as User
                      GetBuilder<ProfileCtrl>(
                        init: Get.isRegistered<ProfileCtrl>()
                            ? Get.find<ProfileCtrl>()
                            : null,
                        builder: (p) {
                          final name = p.userName.value;
                          final avatar = p.userAvatar.value;
                          return Row(
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundImage: avatar.isNotEmpty
                                    ? NetworkImage(
                                        ApiEndpoints.formatImageUrl(avatar),
                                      )
                                    : null,
                                child: avatar.isEmpty
                                    ? const Icon(Icons.person, size: 14)
                                    : null,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Commenting as $name',
                                style: TextStyle(
                                  color: AppColor().primary.withOpacity(0.8),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 10),

                      // Comment Input
                      Container(
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: AppColor().primary,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            TextField(
                              controller: controller.commentController,
                              style: const TextStyle(color: Colors.white),
                              maxLines: 4,
                              decoration: const InputDecoration(
                                hintText: 'Type your comment here...',
                                hintStyle: TextStyle(color: Colors.white38),
                                border: InputBorder.none,
                              ),
                            ),
                            Obx(
                              () => InkWell(
                                onTap: controller.isRefining.value
                                    ? null
                                    : controller.refineCommentText,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (controller.isRefining.value)
                                        const SizedBox(
                                          width: 12,
                                          height: 12,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      else
                                        const Icon(
                                          Icons.auto_awesome,
                                          size: 14,
                                          color: Colors.white,
                                        ),
                                      const SizedBox(width: 5),
                                      Text(
                                        controller.isRefining.value
                                            ? 'Refining...'
                                            : 'Refine AI',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      const SizedBox(height: 20),

                      // Post Button
                      Obx(
                        () => SizedBox(
                          width: double.infinity,
                          height: 55,
                          child: ElevatedButton(
                            onPressed: controller.isPosting.value
                                ? null
                                : controller.addComment,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColor().secondary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                                side: BorderSide(
                                  color: AppColor().secondary,
                                  width: 2,
                                ),
                              ),
                            ),
                            child: controller.isPosting.value
                                ? const CircularProgressIndicator()
                                : const Text(
                                    'Post a comment',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),
                      Row(
                        children: [
                          Icon(
                            Icons.comment_outlined,
                            color: Colors.white.withOpacity(0.5),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'Comments',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      const Divider(color: Colors.white24),
                      const SizedBox(height: 10),

                      // Comments List
                      Obx(() {
                        if (controller.isLoading.value &&
                            controller.comments.isEmpty) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        }

                        if (controller.comments.isEmpty) {
                          return const Center(
                            child: Text(
                              'No comments yet.',
                              style: TextStyle(color: Colors.white54),
                            ),
                          );
                        }

                        return ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: controller.comments.length,
                          itemBuilder: (context, index) {
                            final comment = controller.comments[index];
                            return _buildCommentItem(comment);
                          },
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCommentItem(ForumComment comment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColor().primary.withOpacity(0.1),
        border: Border.all(color: AppColor().primary.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundImage: comment.author.userImage.isNotEmpty
                    ? NetworkImage(
                        ApiEndpoints.formatImageUrl(comment.author.userImage),
                      )
                    : null,
                child: comment.author.userImage.isEmpty
                    ? const Icon(Icons.person, size: 14)
                    : null,
              ),
              const SizedBox(width: 8),
              Text(
                comment.author.userName,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              Text(
                _formatTime(comment.createdAt),
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.only(left: 36), // Align with text
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  comment.content,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
                if (comment.imageUrls.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      ApiEndpoints.formatImageUrl(comment.imageUrls.first),
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        height: 100,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.broken_image,
                            color: Colors.white24,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
    if (difference.inHours < 24) return '${difference.inHours}h ago';
    return '${difference.inDays}d ago';
  }
}
