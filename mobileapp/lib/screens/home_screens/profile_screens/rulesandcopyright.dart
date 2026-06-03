import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';

class Rulesandcopyright extends StatelessWidget {
  const Rulesandcopyright({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor().alternate,
      appBar: AppBar(
        centerTitle: true,

        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColor().alternate),
          onPressed: () => Get.back(),
        ),
        backgroundColor: AppColor().primary,
        elevation: 0,
      ),
      body: Container(
        height: double.infinity,
        width: double.infinity,
        color: AppColor().alternate,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                child: Text(
                  'Monthly Competition Rules',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: AppColor().primaryText,
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(10.0, 0.0, 10.0, 0.0),
                child: Text(
                  'Rules for the Monthly Lawn Competition\n1. Eligibility\nThe competition is open to individuals who own or maintain the lawn they are submitting.\nParticipants must be at least 18 years old to enter.\nOnly one submission is allowed per household per month.\n2. Submission Requirements\nParticipants must submit:\nOne high-quality photo of their lawn.\nOne 5-second video to verify the authenticity of the photo.\nAll submissions must be uploaded through the competition page in the app.\nPhotos and videos must clearly display the lawn and not include filters, excessive editing, or watermarks.\n3. Submission Deadline\nSubmissions are open from the 1st to the 15th of each month.\nLate submissions will not be accepted.\n4. Voting Rules\nVoting begins on the 16th of each month and ends on the last day of the month.\nEach registered user can cast one vote per entry.\nUsers may not vote for their own submission.\nAttempts to manipulate votes (e.g., through bots or duplicate accounts) will result in disqualification.\n5. Judging Criteria\nThe winner is determined by the highest number of votes at the end of the voting period.\nIn case of a tie, the competition organizers will select a winner based on:\nLawn health.\nAesthetic appeal.\nCreativity in lawn design (if applicable).\n6. Prizes\nThe winner will receive:\nA badge or trophy icon added to their app profile.\nA featured spot in the Hall of Fame section of the app.\n(Optional: Any additional prize, such as a gift card or product sponsorship.)\n7. Disqualification\nEntries may be disqualified for:\nFailing to submit a verification video.\nSubmitting fraudulent or plagiarized content.\nViolating any of the competition rules.\nOrganizers reserve the right to remove any entry deemed inappropriate or offensive.\n8. Content Rights\nBy entering the competition, participants grant the app organizers the right to use submitted photos and videos for promotional purposes, including marketing and social media campaigns.\n9. Updates and Changes\nThe organizers reserve the right to modify the rules, timelines, or prizes at any time. Participants will be notified of any changes via the app.',
                  style: TextStyle(color: AppColor().primaryText),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
