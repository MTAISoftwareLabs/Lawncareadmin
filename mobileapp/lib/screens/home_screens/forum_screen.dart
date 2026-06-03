import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/forum_ctrl.dart';
import 'package:lawn_care/controllers/home_ctrls/profile_ctrl.dart';
import 'package:lawn_care/models/forum_model.dart';
import 'package:lawn_care/screens/home_screens/post_detail_screen.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/full_screen_image.dart';

class ForumScreen extends StatelessWidget {
  const ForumScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ForumCtrl controller = Get.put(ForumCtrl());

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColor().primary,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Text(
          'LawnCare Forum',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: AppColor().secondary,
          ),
        ),
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Container(
          height: double.infinity,
          width: double.infinity,
          color: AppColor().alternate,
          child: SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: Obx(() {
                    if (controller.isLoading.value &&
                        controller.posts.isEmpty) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    return RefreshIndicator(
                      onRefresh: controller.fetchPosts,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 20,
                        ),
                        itemCount: controller.posts.length + 1,
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            return _buildStartThreadSection(controller);
                          }
                          final post = controller.posts[index - 1];
                          return ForumPostCard(
                            post: post,
                            onLike: () => controller.toggleLike(post.postId),
                            onComment: () =>
                                Get.to(() => PostDetailScreen(post: post)),
                          );
                        },
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStartThreadSection(ForumCtrl controller) {
    return Container(
      margin: const EdgeInsets.only(bottom: 30),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColor().primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Text(
            'Connect With Other\nLawn Care Enthusiasts!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColor().secondaryText,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Ask questions, share tips, and grow the perfect lawn!',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppColor().primaryText),
          ),
          const SizedBox(height: 20),

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
                    radius: 18,
                    backgroundImage: avatar.isNotEmpty
                        ? NetworkImage(ApiEndpoints.formatImageUrl(avatar))
                        : null,
                    child: avatar.isEmpty
                        ? const Icon(Icons.person, size: 20)
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Posting as $name',
                    style: TextStyle(
                      color: AppColor().primary.withOpacity(0.9),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 15),

          // Comment Input
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: AppColor().secondary, width: 1),

              color: AppColor().secondaryBackground,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                TextField(
                  controller: controller.commentController,
                  maxLines: 2,
                  style: TextStyle(color: AppColor().secondary),
                  decoration: InputDecoration(
                    hintText: 'Type your Comment',
                    hintStyle: TextStyle(
                      color: AppColor().secondary.withOpacity(0.7),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(15),
                  ),
                ),
                Obx(
                  () => Padding(
                    padding: const EdgeInsets.only(right: 10, bottom: 5),
                    child: InkWell(
                      onTap: controller.isRefining.value
                          ? null
                          : controller.refinePostText,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColor().primary.withOpacity(0.3),
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
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Upload Photo Box
          GestureDetector(
            onTap: controller.pickImage,
            child: Obx(
              () => Container(
                height: 150,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColor().secondaryBackground,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: AppColor().secondary, width: 1),
                  image: controller.selectedImage.value != null
                      ? DecorationImage(
                          image: FileImage(controller.selectedImage.value!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child:
                    (controller.uploadedImageUrl.value == null &&
                        controller.selectedImage.value == null)
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.camera_alt_outlined,
                            color: AppColor().secondary.withOpacity(0.5),
                            size: 40,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Upload Photo',
                            style: TextStyle(
                              color: AppColor().secondary,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      )
                    : Stack(
                        children: [
                          if (controller.isUploading.value)
                            Container(
                              color: Colors.black38,
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            ),
                          Positioned(
                            right: 10,
                            top: 10,
                            child: GestureDetector(
                              onTap: controller.removeImage,
                              child: Container(
                                padding: const EdgeInsets.all(5),
                                decoration: const BoxDecoration(
                                  color: Colors.black54,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                          if (controller.isUploading.value)
                            const Positioned(
                              bottom: 10,
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Text(
                                  'Uploading...',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          // Show network image when uploaded URL is available
                          if (controller.uploadedImageUrl.value != null)
                            Positioned.fill(
                              child: Image.network(
                                ApiEndpoints.formatImageUrl(
                                  controller.uploadedImageUrl.value,
                                ),
                                fit: BoxFit.cover,
                              ),
                            )
                          else if (controller.selectedImage.value != null)
                            Positioned.fill(
                              child: Image.file(
                                controller.selectedImage.value!,
                                fit: BoxFit.cover,
                              ),
                            ),
                        ],
                      ),
              ),
            ),
          ),
          const SizedBox(height: 30),

          // Start Thread Button
          Obx(
            () => SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: controller.isPosting.value
                    ? null
                    : controller.startThread,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColor().accent1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: controller.isPosting.value
                    ? const CircularProgressIndicator()
                    : Text(
                        'Start a Thread',
                        style: TextStyle(
                          color: AppColor().primary.withOpacity(0.8),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ForumPostCard extends StatelessWidget {
  final ForumPost post;
  final VoidCallback onLike;
  final VoidCallback onComment;

  const ForumPostCard({
    super.key,
    required this.post,
    required this.onLike,
    required this.onComment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColor().primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: post.author.userImage.isNotEmpty
                    ? NetworkImage(
                        ApiEndpoints.formatImageUrl(post.author.userImage),
                      )
                    : null,
                child: post.author.userImage.isEmpty
                    ? const Icon(Icons.person)
                    : null,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.author.userName,
                    style: TextStyle(
                      color: AppColor().secondary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    _formatTime(post.createdAt),
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            post.content,
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
          if (post.imageUrls.isNotEmpty) ...[
            const SizedBox(height: 15),
            GestureDetector(
              onTap: () =>
                  Get.to(() => FullScreenImage(imageUrl: post.imageUrls.first)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.network(
                  ApiEndpoints.formatImageUrl(post.imageUrls.first),
                  width: double.infinity,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      height: 200,
                      width: double.infinity,
                      color: Colors.grey[800],
                      child: const Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 150,
                      width: double.infinity,
                      color: Colors.grey[800],
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.broken_image,
                            color: Colors.white54,
                            size: 40,
                          ),
                          SizedBox(height: 10),
                          Text(
                            'Image failed to load',
                            style: TextStyle(color: Colors.white54),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
          const SizedBox(height: 15),
          Row(
            children: [
              IconButton(
                onPressed: onLike,
                icon: Icon(
                  post.isLikedByMe ? Icons.thumb_up : Icons.thumb_up_outlined,
                  color: post.isLikedByMe ? AppColor().secondary : Colors.white,
                  size: 20,
                ),
              ),
              Text(
                '${post.likesCount}',
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 20),
              IconButton(
                onPressed: onComment,
                icon: const Icon(
                  Icons.comment_outlined,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              Text(
                '${post.commentsCount}',
                style: const TextStyle(color: Colors.white),
              ),
              const Spacer(),
              Builder(
                builder: (context) {
                  final profile = Get.isRegistered<ProfileCtrl>()
                      ? Get.find<ProfileCtrl>()
                      : null;
                  final isMyPost =
                      (profile != null &&
                          profile.userId.value.isNotEmpty &&
                          post.author.userId == profile.userId.value) ||
                      (profile != null &&
                          profile.userName.value.toLowerCase() ==
                              post.author.userName.toLowerCase());

                  // if (isMyPost) {
                  //   return const Icon(
                  //     Icons.delete_outline,
                  //     color: Colors.white,
                  //     size: 20,
                  //   );
                  // }
                  return const SizedBox.shrink();
                },
              ),
            ],
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
