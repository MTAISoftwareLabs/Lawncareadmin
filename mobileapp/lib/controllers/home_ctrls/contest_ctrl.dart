import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lawn_care/models/contest_model.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/screens/home_screens/contest_screens/contest_entry_screen.dart';
import 'package:lawn_care/screens/home_screens/contest_screens/winners_screen.dart';

class ContestCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();

  var isLoading = false.obs;
  var isSubmitting = false.obs;
  var activeCompetition = Rxn<Competition>();
  var entries = <CompetitionEntry>[].obs; // For future use if we fetch entries
  var winners = <Winner>[].obs;

  // Entry Submission
  Rx<File?> selectedImage = Rx<File?>(null);
  var isUploading = false.obs;
  String? uploadedImageUrl;
  final TextEditingController captionController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    fetchActiveCompetition();
    fetchWinners();
    fetchEntries();
  }

  Future<void> fetchActiveCompetition() async {
    try {
      isLoading.value = true;
      final response = await _contentService.getActiveCompetition();
      print("DEBUG: Contest API Status: ${response.statusCode}");
      print("DEBUG: Contest API Body: ${response.body}");

      if (response.statusCode == 200 && response.body != null) {
        var body = response.body;

        // If body is String, try to decode it
        if (body is String) {
          try {
            body = json.decode(body);
            print("DEBUG: Decoded String body to: ${body.runtimeType}");
          } catch (e) {
            print("DEBUG: Error decoding string body: $e");
          }
        }

        Map<String, dynamic>? competitionData;
        List? list;

        if (body is List) {
          print("DEBUG: Body is a List of length ${body.length}");
          list = body;
        } else if (body is Map) {
          print("DEBUG: Body is a Map with keys: ${body.keys}");
          // Check for 'data' key or 'competitions' key
          var data = body['data'] ?? body['competitions'] ?? body['entries'];
          if (data is List) {
            print("DEBUG: Found List in 'data' key");
            list = data;
          } else if (data is Map) {
            print("DEBUG: Found single Map in 'data' key");
            competitionData = Map<String, dynamic>.from(data);
          } else {
            print("DEBUG: Using body Map directly");
            competitionData = Map<String, dynamic>.from(body);
          }
        }

        if (list != null && list.isNotEmpty) {
          print("DEBUG: Parsing first item of list: ${list.first}");
          competitionData = Map<String, dynamic>.from(list.first);
        }

        if (competitionData != null) {
          // Parse the competition
          activeCompetition.value = Competition.fromJson(competitionData);
          print(
            "DEBUG: Successfully parsed Competition: ${activeCompetition.value?.title}",
          );

          // Extract entries if they're included in the response
          if (competitionData['entries'] != null) {
            final entriesList = competitionData['entries'] as List?;
            if (entriesList != null) {
              entries.value = entriesList
                  .map(
                    (json) => CompetitionEntry.fromJson(
                      Map<String, dynamic>.from(json),
                    ),
                  )
                  .toList();
              print(
                "DEBUG: Extracted ${entries.length} entries from competition response",
              );
            }
          }
        } else {
          print("DEBUG: No valid competition found in list/map");
          activeCompetition.value = null;
        }
      } else {
        print("DEBUG: Status not 200 or empty body");
        activeCompetition.value = null;
      }
    } catch (e, stack) {
      print("DEBUG: ERROR in fetchActiveCompetition: $e");
      print(stack.toString());
    } finally {
      isLoading.value = false;
      // Refresh entries when competition is fetched (if not already extracted)
      if (entries.isEmpty) {
        fetchEntries();
      }
    }
  }

  Future<void> fetchEntries() async {
    try {
      final response = await _contentService.getCompetitionEntries();
      print("DEBUG: Entries API Status: ${response.statusCode}");
      print("DEBUG: Entries API Body: ${response.body}");
      if (response.statusCode == 200 && response.body != null) {
        var body = response.body;
        List? list;

        if (body is List) {
          list = body;
        } else if (body is Map) {
          var data = body['data'] ?? body['entries'];
          if (data is List) {
            list = data;
          }
        }

        if (list != null) {
          entries.value = list
              .map(
                (json) =>
                    CompetitionEntry.fromJson(Map<String, dynamic>.from(json)),
              )
              .toList();
          print("DEBUG: Fetched ${entries.length} entries");
        }
      }
    } catch (e) {
      print("DEBUG: Error fetching entries: $e");
    }
  }

  Future<void> fetchWinners() async {
    try {
      final response = await _contentService.getCompetitionWinners();
      print("DEBUG: Winners API Status: ${response.statusCode}");
      print("DEBUG: Winners API Body: ${response.body}");

      if (response.statusCode == 200 && response.body != null) {
        var body = response.body;
        List? list;

        if (body is List) {
          list = body;
        } else if (body is Map) {
          var data = body['data'] ?? body['winners'];
          if (data is List) {
            list = data;
          }
        }

        if (list != null) {
          winners.value = list
              .map((json) => Winner.fromJson(Map<String, dynamic>.from(json)))
              .toList();
          print("DEBUG: Fetched ${winners.length} winners");
        }
      }
    } catch (e, stack) {
      print("DEBUG: Error fetching winners: $e");
      print(stack.toString());
    }
  }

  Future<void> pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (image != null) {
      selectedImage.value = File(image.path);
      await _uploadSelectedImage();
    }
  }

  Future<void> _uploadSelectedImage() async {
    if (selectedImage.value == null) return;

    try {
      isUploading.value = true;
      uploadedImageUrl = null;
      print(
        "API DEBUG: Starting contest image upload: ${selectedImage.value!.path}",
      );

      final uploadResponse = await _contentService.uploadMedia(
        selectedImage.value!,
      );

      if (uploadResponse.isOk && uploadResponse.body != null) {
        final body = uploadResponse.body;
        if (body is Map) {
          String? url;
          if (body['data'] is Map && body['data']['url'] != null) {
            url = body['data']['url'].toString();
          } else if (body['url'] != null) {
            url = body['url'].toString();
          } else if (body['data'] is String) {
            url = body['data'].toString();
          }

          if (url != null && url.isNotEmpty) {
            uploadedImageUrl = url;
            print("API DEBUG: Contest image uploaded: $uploadedImageUrl");
          } else {
            Get.snackbar("Error", body['message']?.toString() ?? "Upload failed");
          }
        }
      } else {
        Get.snackbar(
          "Error",
          "Failed to upload image. Status: ${uploadResponse.statusCode}",
        );
      }
    } catch (e) {
      Get.snackbar("Error", "Image upload error: $e");
    } finally {
      isUploading.value = false;
    }
  }

  void removeImage() {
    selectedImage.value = null;
    uploadedImageUrl = null;
    isUploading.value = false;
  }

  Future<void> submitEntry() async {
    if (activeCompetition.value == null) return;
    if (selectedImage.value == null) {
      Get.snackbar("Error", "Please select an image");
      return;
    }
    if (captionController.text.isEmpty) {
      Get.snackbar("Error", "Please enter a caption");
      return;
    }

    try {
      isSubmitting.value = true;

      // Wait if image is still uploading
      if (selectedImage.value != null && uploadedImageUrl == null) {
        if (isUploading.value) {
          Get.snackbar("Info", "Waiting for image upload...");
          while (isUploading.value) {
            await Future.delayed(const Duration(milliseconds: 500));
          }
        }

        if (uploadedImageUrl == null) {
          Get.snackbar(
            "Error",
            "Image upload failed. Please try again or remove it.",
          );
          return;
        }
      }

      final response = await _contentService.submitCompetitionEntry(
        activeCompetition.value!.id,
        uploadedImageUrl!,
        captionController.text,
      );

      print("DEBUG: Submit Entry API Status: ${response.statusCode}");
      print("DEBUG: Submit Entry API Body: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        Get.back(); // Close entry screen
        Get.snackbar("Success", "Entry submitted successfully!");
        selectedImage.value = null;
        uploadedImageUrl = null;
        captionController.clear();
      } else if (response.statusCode == 404) {
        Get.snackbar("Notice", "context yet to start");
      }
    } catch (e) {
      print("API DEBUG: Competition submission exception: $e");
      // Get.snackbar("Error", "Something went wrong");
    } finally {
      isSubmitting.value = false;
    }
  }

  void startEntry() {
    if (activeCompetition.value == null) {
      Get.snackbar("Notice", "No active competition at the moment");
      return;
    }
    selectedImage.value = null;
    captionController.clear();
    Get.to(() => const ContestEntryScreen());
  }

  // Placeholder actions
  void viewLastWinners() {
    Get.to(() => const WinnersScreen());
  }

  void viewRules() {
    if (activeCompetition.value != null) {
      Get.defaultDialog(
        title: "Competition Rules",
        content: Text(activeCompetition.value!.rules),
        textConfirm: "OK",
        onConfirm: () => Get.back(),
      );
    }
  }

  Future<bool> voteForEntry(int entryId) async {
    try {
      final response = await _contentService.voteEntry(entryId);
      print("DEBUG: Vote Entry API Status: ${response.statusCode}");
      print("DEBUG: Vote Entry API Body: ${response.body}");

      var body = response.body;
      if (body is String) {
        try {
          body = json.decode(body);
        } catch (_) {}
      }

      // Accept 200 (Success) or 400 (Bad Request - typically for "Already voted")
      if ((response.statusCode == 200 || response.statusCode == 400) &&
          body != null) {
        // success case or toggle
        if (body['success'] == true || body['voted'] != null) {
          _updateEntryLocalState(entryId, body);
          if (body['message'] != null) {
            Get.snackbar("Success", body['message']);
          }
          return true;
        }
        // Handle "Already voted" specifically as a non-error for the UI
        else if (body['error'] != null &&
            body['error'].toString().toLowerCase().contains("already voted")) {
          // Case insensitive check just in case

          final index = entries.indexWhere((e) => e.id == entryId);
          if (index != -1) {
            final currentEntry = entries[index];
            if (!currentEntry.isVotedByMe) {
              entries[index] = CompetitionEntry(
                id: currentEntry.id,
                userId: currentEntry.userId,
                userName: currentEntry.userName,
                userImage: currentEntry.userImage,
                imageUrl: currentEntry.imageUrl,
                caption: currentEntry.caption,
                votes: currentEntry.votes,
                isVotedByMe: true,
              );
              entries.refresh();
            }
          }

          Get.snackbar("Info", "You have already voted for this entry");
          return true;
        } else {
          // Actual error
          // Get.snackbar(
          //   "Error",
          //   body['message'] ?? body['error'] ?? "Vote failed",
          // );
        }
      } else {
        // Status codes other than 200 or 400, or null body
        Get.snackbar("Error", "Vote failed status: ${response.statusCode}");
      }
    } catch (e) {
      print("Vote error: $e");
      // Get.snackbar("Error", "Vote failed: $e");
    }
    return false;
  }

  void _updateEntryLocalState(int entryId, Map<String, dynamic> body) {
    final index = entries.indexWhere((e) => e.id == entryId);
    if (index != -1) {
      final currentEntry = entries[index];
      entries[index] = CompetitionEntry(
        id: currentEntry.id,
        userId: currentEntry.userId,
        userName: currentEntry.userName,
        userImage: currentEntry.userImage,
        imageUrl: currentEntry.imageUrl,
        caption: currentEntry.caption,
        votes: body['votes'] ?? currentEntry.votes,
        isVotedByMe: body['voted'] ?? !currentEntry.isVotedByMe,
      );
      entries.refresh();
    }
  }

  @override
  void onClose() {
    captionController.dispose();
    super.onClose();
  }
}
