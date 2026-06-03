import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';
import 'package:lawn_care/widgets/custome_backbotton.dart';

class BaseFunctionalScreen extends StatelessWidget {
  final String title;
  const BaseFunctionalScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColor().primary, AppColor().accent4],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    CostomeBackBotton(onPressed: () => Get.back()),
                    Expanded(
                      child: Center(
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text(
                            title,
                            style: TextStyle(
                              color: AppColor().secondary,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 40),
                  ],
                ),
              ),
              Expanded(
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        '$title Coming Soon',
                        style: TextStyle(color: AppColor().info, fontSize: 18),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'Calendar');
  }
}

class AskAIScreen extends StatelessWidget {
  const AskAIScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'Ask AI');
  }
}

class SelfDiagnosisScreen extends StatelessWidget {
  const SelfDiagnosisScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'Self Diagnosis');
  }
}

class AIWeedIDScreen extends StatelessWidget {
  const AIWeedIDScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'AI Weed ID');
  }
}

class GrassIDScreen extends StatelessWidget {
  const GrassIDScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'Lawn Library');
  }
}

class InsectsAndDiseaseIDScreen extends StatelessWidget {
  const InsectsAndDiseaseIDScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const BaseFunctionalScreen(title: 'Insects & Disease ID');
  }
}
