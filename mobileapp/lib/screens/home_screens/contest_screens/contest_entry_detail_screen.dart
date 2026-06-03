import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/contest_ctrl.dart';
import 'package:lawn_care/models/contest_model.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/utils/appcolor.dart';

class ContestEntryDetailScreen extends StatelessWidget {
  final CompetitionEntry entry;

  const ContestEntryDetailScreen({super.key, required this.entry});

  @override
  Widget build(BuildContext context) {
    // Find existing controller
    final ContestCtrl controller = Get.find<ContestCtrl>();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Get.back(),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Full Screen Image
          Positioned.fill(
            child: InteractiveViewer(
              child: Builder(
                builder: (context) {
                  final url = ApiEndpoints.formatImageUrl(entry.imageUrl);
                  return Image.network(
                    url,
                    fit: BoxFit.contain,
                    errorBuilder: (c, e, s) => const Center(
                      child: Icon(
                        Icons.broken_image,
                        color: Colors.white,
                        size: 50,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Bottom Detail Panel
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withOpacity(0.9),
                    Colors.black.withOpacity(0.0),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    entry.userName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    entry.caption,
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  Obx(() {
                    // Need to find the entry in the controller's list to get reactive updates
                    // We use firstWhereOrNull logic but since we passed an entry, it should exist.
                    // However, safe coding suggests handling if not found (though unlikely).
                    final currentEntry = controller.entries.firstWhere(
                      (e) => e.id == entry.id,
                      orElse: () => entry,
                    );

                    return Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            controller.voteForEntry(currentEntry.id);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: currentEntry.isVotedByMe
                                  ? Colors.white
                                  : AppColor().primary,
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(
                                color: currentEntry.isVotedByMe
                                    ? AppColor().primary
                                    : Colors.transparent,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  currentEntry.isVotedByMe
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  color: currentEntry.isVotedByMe
                                      ? Colors.red
                                      : AppColor().secondary,
                                  size: 24,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  currentEntry.isVotedByMe ? 'Liked' : 'Like',
                                  style: TextStyle(
                                    color: currentEntry.isVotedByMe
                                        ? Colors.black
                                        : AppColor().secondary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 15),
                        Text(
                          '${currentEntry.votes} Likes',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    );
                  }),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
