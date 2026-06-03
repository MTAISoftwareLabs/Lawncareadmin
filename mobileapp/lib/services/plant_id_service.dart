import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:lawn_care/utils/app_constants.dart';

class PlantIdService {
  Future<Map<String, dynamic>?> identifyPlantIssue(File image) async {
    final url = Uri.parse(
      'https://api.plant.id/v3/identification?details='
      'common_names,taxonomy,url,description,wiki_image,rank,'
      'gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods',
    );

    try {
      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': AppConstants.plantIdApiKey,
        },
        body: jsonEncode({
          'images': [base64Image],
          'latitude': 49.207,
          'longitude': 16.608,
          'similar_images': true,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        print("PlantIdService: error ${response.statusCode}");
        return {'error': 'Status ${response.statusCode}', 'body': response.body};
      }
    } catch (e) {
      print("PlantIdService: exception $e");
      return {'error': e.toString()};
    }
  }
}
