import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/weather_model.dart';

class WeatherService extends GetConnect {
  static const String _apiKey = '29fbc9e95a474aa59ad232246251702';
  static const String _baseUrl = 'https://api.weatherapi.com/v1';

  Future<WeatherModel?> getLocalWeather(String lat, String long) async {
    try {
      final response = await get(
        '$_baseUrl/forecast.json',
        query: {'key': _apiKey, 'q': '$lat,$long', 'days': '1', 'lang': 'en'},
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          print("WeatherService: request timed out");
          return Response(statusCode: 408, statusText: 'Request timeout');
        },
      );

      if (response.status.hasError) {
        print("WeatherService: error ${response.statusCode}");
        return null;
      }

      if (response.body != null) {
        return WeatherModel.fromJson(response.body);
      }

      return null;
    } catch (e) {
      print("WeatherService: exception $e");
      return null;
    }
  }
}
