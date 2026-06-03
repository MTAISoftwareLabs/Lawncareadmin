import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/controllers/home_ctrls/contest_ctrl.dart';
import 'package:lawn_care/services/api_endpoints.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/screens/home_screens/contest_screens/contest_entry_detail_screen.dart';
import 'package:lawn_care/widgets/full_screen_image.dart';

class ContestScreen extends StatelessWidget {
  const ContestScreen({super.key});

  // ... (keeping existing code until the grid view)

  // I cannot replace the whole file easily. I will split this into two replacements if possible,
  // or one large replacement for the grid item.
  // Let's rely on the replace_file_content's ability to match context.

  @override
  Widget build(BuildContext context) {
    final ContestCtrl controller = Get.put(ContestCtrl());

    return Scaffold(
      backgroundColor: AppColor().alternate,
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: SafeArea(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator());
            }

            final competition = controller.activeCompetition.value;

            return RefreshIndicator(
              onRefresh: controller.fetchActiveCompetition,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Container
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 20,
                      ),
                      decoration: BoxDecoration(
                        color: AppColor().primary,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            'Lawn of the Month',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                              color: AppColor().secondary,
                              decoration: TextDecoration.underline,
                              decorationColor: AppColor().secondary,
                              fontFamily: 'Roboto',
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            competition?.title ?? 'No Active Contest',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                              color: competition != null
                                  ? AppColor().primaryText
                                  : Colors.white54,
                              fontFamily: 'Roboto',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 25),
                    if (competition == null && !controller.isLoading.value)
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: AppColor().primary.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "Check back later for new competitions!",
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white38),
                          ),
                        ),
                      ),

                    if (competition != null) ...[
                      // Prize Section
                      Column(
                        children: [
                          // Watch Image Container
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(15),
                              child: Builder(
                                builder: (context) {
                                  final imageUrl = ApiEndpoints.formatImageUrl(
                                    competition.prizeImage,
                                  );
                                  print("DEBUG: Contest Prize URL: $imageUrl");

                                  if (imageUrl.isEmpty) {
                                    return Image.asset(
                                      'assets/images/luxury_watch_prize.png',
                                      height: 200,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                    );
                                  }

                                  return GestureDetector(
                                    onTap: () => Get.to(
                                      () => FullScreenImage(
                                        imageUrl: competition.prizeImage!,
                                      ),
                                    ),
                                    child: Image.network(
                                      imageUrl,
                                      height: 200,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (
                                            context,
                                            error,
                                            stackTrace,
                                          ) => Image.asset(
                                            'assets/images/luxury_watch_prize.png',
                                            height: 200,
                                            width: double.infinity,
                                            fit: BoxFit.cover,
                                          ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 15),
                          Text(
                            competition.description,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColor().primaryText,
                              fontSize: 16,
                              fontFamily: 'Roboto',
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            competition.rules,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColor().primaryText.withOpacity(0.9),
                              fontSize: 14,
                              fontStyle: FontStyle.italic,
                              fontFamily: 'Roboto',
                            ),
                          ),
                          const SizedBox(height: 15),
                          if (competition.prize != null &&
                              competition.prize!.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: AppColor().primary,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'Prize',
                                    style: TextStyle(
                                      color: AppColor().primaryText.withOpacity(
                                        0.7,
                                      ),
                                      fontSize: 12,
                                      fontFamily: 'Roboto',
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    competition.prize!,
                                    style: TextStyle(
                                      color: AppColor().secondary,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Roboto',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          const SizedBox(height: 15),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.calendar_month,
                                color: Colors.white,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${competition.startDate.month}/${competition.startDate.day}/${competition.startDate.year} - ${competition.endDate.month}/${competition.endDate.day}/${competition.endDate.year}',
                                style: TextStyle(
                                  color: AppColor().primaryText.withOpacity(
                                    0.8,
                                  ),
                                  fontSize: 14,
                                  fontFamily: 'Roboto',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),

                      // Enter Competition Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColor().primary,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Enter Competition',
                              style: TextStyle(
                                color: AppColor().secondary,
                                fontSize: 23,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Roboto',
                              ),
                            ),
                            const SizedBox(height: 15),
                            _buildStepText('1. Upload lawn photo'),
                            _buildStepText('2. Write short description'),
                            _buildStepText('3. Submit entry'),
                            const SizedBox(height: 20),
                            Align(
                              alignment: Alignment.centerRight,
                              child: ElevatedButton(
                                onPressed: controller.startEntry,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColor().secondary,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 35,
                                    vertical: 15,
                                  ),
                                  elevation: 5,
                                ),
                                child: const Text(
                                  'Start Entry',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                    fontFamily: 'Roboto',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 40),

                      // Current Entries Section
                      if (controller.entries.isNotEmpty) ...[
                        Text(
                          'Current Entries',
                          style: TextStyle(
                            color: AppColor().secondary,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Roboto',
                          ),
                        ),
                        const SizedBox(height: 15),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 15,
                                mainAxisSpacing: 15,
                                childAspectRatio: 0.8,
                              ),
                          itemCount: controller.entries.length,
                          itemBuilder: (context, index) {
                            final entry = controller.entries[index];
                            return GestureDetector(
                              onTap: () {
                                Get.to(
                                  () => ContestEntryDetailScreen(entry: entry),
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E3A25),
                                  borderRadius: BorderRadius.circular(15),
                                  border: Border.all(
                                    color: AppColor().primary,
                                    width: 1,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius:
                                            const BorderRadius.vertical(
                                              top: Radius.circular(15),
                                            ),
                                        child: Builder(
                                          builder: (context) {
                                            final entryUrl =
                                                ApiEndpoints.formatImageUrl(
                                                  entry.imageUrl,
                                                );
                                            print(
                                              "DEBUG: Contest Entry URL: $entryUrl",
                                            );
                                            return GestureDetector(
                                              onTap: () => Get.to(
                                                () => FullScreenImage(
                                                  imageUrl: entry.imageUrl,
                                                ),
                                              ),
                                              child: Image.network(
                                                entryUrl,
                                                width: double.infinity,
                                                fit: BoxFit.cover,
                                                errorBuilder: (c, e, s) =>
                                                    Container(
                                                      color: Colors.grey[800],
                                                      child: const Icon(
                                                        Icons.broken_image,
                                                        color: Colors.white54,
                                                      ),
                                                    ),
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  entry.userName,
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 2),
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
                                          GestureDetector(
                                            onTap: () {
                                              controller.voteForEntry(entry.id);
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              color: Colors
                                                  .transparent, // Hit test
                                              child: Icon(
                                                entry.isVotedByMe
                                                    ? Icons.favorite
                                                    : Icons.favorite_border,
                                                color: entry.isVotedByMe
                                                    ? Colors.red
                                                    : AppColor().secondary,
                                                size: 22,
                                              ),
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
                        ),
                      ],
                    ],

                    const SizedBox(height: 30),

                    // Footer Buttons
                    _buildFooterButton(
                      'View Last Winners',
                      controller.viewLastWinners,
                    ),
                    const SizedBox(height: 15),
                    _buildFooterButton(
                      'Competition Rules',
                      controller.viewRules,
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildStepText(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Text(
        text,
        style: TextStyle(
          color: AppColor().secondary,
          fontSize: 12,
          fontFamily: 'Roboto',
        ),
      ),
    );
  }

  Widget _buildFooterButton(String text, VoidCallback onPressed) {
    return Center(
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.black, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          backgroundColor: Colors.transparent,
        ),
        child: Text(
          text,
          style: TextStyle(
            color: Colors.grey[700],
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
