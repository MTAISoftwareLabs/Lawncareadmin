import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/soil_temp_model.dart';

class SoilTempService extends GetConnect {
  Future<SoilTempModel?> getSevenDaysSoilTemp(String lat, String long) async {
    try {
      final now = DateTime.now();
      final startDate = now.toIso8601String().split('T')[0];
      final endDate =
          now.add(const Duration(days: 7)).toIso8601String().split('T')[0];

      final response = await get(
        'https://api.open-meteo.com/v1/forecast',
        query: {
          'latitude': lat,
          'longitude': long,
          'hourly': 'soil_temperature_6cm',
          'current': 'temperature_2m,weather_code,wind_speed_10m',
          'wind_speed_unit': 'ms',
          'temperature_unit': 'fahrenheit',
          'start_date': startDate,
          'end_date': endDate,
          'timezone': 'UTC',
          'format': 'json',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          print("SoilTempService: request timed out");
          return Response(statusCode: 408, statusText: 'Request timeout');
        },
      );

      if (response.status.hasError) {
        print("SoilTempService: error ${response.statusCode}");
        return null;
      }

      if (response.body != null) {
        return SoilTempModel.fromJson(response.body);
      }

      return null;
    } catch (e) {
      print("SoilTempService: exception $e");
      return null;
    }
  }
}
