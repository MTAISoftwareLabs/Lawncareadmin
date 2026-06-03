import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/contest_ctrl.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/screens/home_screens/contest_screens/winner_detail_screen.dart';

class WinnersScreen extends StatelessWidget {
  const WinnersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ContestCtrl controller = Get.find<ContestCtrl>();

    return Scaffold(
      backgroundColor: AppColor().alternate,
      appBar: AppBar(
        title: Text(
          'Hall of Fame',
          style: TextStyle(
            color: AppColor().secondary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColor().primary,
        iconTheme: IconThemeData(color: AppColor().secondary),
        elevation: 0,
      ),
      body: Obx(() {
        if (controller.winners.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.emoji_events_outlined,
                  size: 80,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  "No winners yet.",
                  style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Text(
                  "Be the first one!",
                  style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: controller.winners.length,
          itemBuilder: (context, index) {
            final winner = controller.winners[index];
            return GestureDetector(
              onTap: () {
                Get.to(() => WinnerDetailScreen(winner: winner));
              },
              child: Card(
                margin: const EdgeInsets.only(bottom: 16),
                color: AppColor().primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                elevation: 4,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Competition Title Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade700,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(15),
                          topRight: Radius.circular(15),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.emoji_events, color: Colors.white),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              winner.competitionTitle,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Winning Entry Image
                    if (winner.winningImageUrl.isNotEmpty)
                      ClipRRect(
                        child: Image.network(
                          ApiEndpoints.formatImageUrl(winner.winningImageUrl),
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                                height: 200,
                                color: Colors.grey[800],
                                child: const Icon(
                                  Icons.image_not_supported,
                                  color: Colors.white54,
                                  size: 50,
                                ),
                              ),
                        ),
                      ),

                    // Entry Title and Description
                    if (winner.entryTitle != null ||
                        winner.entryDescription != null)
                      Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (winner.entryTitle != null)
                              Text(
                                winner.entryTitle!,
                                style: TextStyle(
                                  color: AppColor().secondary,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            if (winner.entryDescription != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                winner.entryDescription!,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),

                    // Votes and Rank Info
                    if (winner.votes != null || winner.rank != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12.0),
                        child: Row(
                          children: [
                            if (winner.rank != null)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.amber.shade700,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.emoji_events,
                                      size: 14,
                                      color: Colors.white,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Rank #${winner.rank}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            if (winner.votes != null) ...[
                              if (winner.rank != null) const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.thumb_up,
                                      size: 14,
                                      color: AppColor().secondary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${winner.votes} votes',
                                      style: TextStyle(
                                        color: AppColor().secondary,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),

                    const SizedBox(height: 8),

                    // Winner Info
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.amber.shade700,
                                width: 2,
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 20,
                              backgroundColor: Colors.grey[300],
                              backgroundImage: winner.userImage.isNotEmpty
                                  ? NetworkImage(
                                      ApiEndpoints.formatImageUrl(
                                        winner.userImage,
                                      ),
                                    )
                                  : null,
                              child: winner.userImage.isEmpty
                                  ? const Icon(Icons.person, color: Colors.grey)
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Winner",
                                  style: TextStyle(
                                    color: Colors.amber.shade400,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  winner.userName,
                                  style: TextStyle(
                                    color: AppColor().secondary,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (winner.prize.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.card_giftcard,
                                    size: 14,
                                    color: AppColor().secondary,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    winner.prize,
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
                  ],
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
