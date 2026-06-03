class SoilTempModel {
  List<String>? time;
  List<double>? soilTemperature6cm;
  HourlyUnits? hourlyUnits;
  Current? current;

  SoilTempModel({
    this.time,
    this.soilTemperature6cm,
    this.hourlyUnits,
    this.current,
  });

  SoilTempModel.fromJson(Map<String, dynamic> json) {
    if (json['hourly'] != null && json['hourly']['time'] != null) {
      time = List<String>.from(json['hourly']['time']);
    }
    if (json['hourly'] != null &&
        json['hourly']['soil_temperature_6cm'] != null) {
      soilTemperature6cm = List<double>.from(
        json['hourly']['soil_temperature_6cm'].map((x) => x?.toDouble() ?? 0.0),
      );
    }
    hourlyUnits = json['hourly_units'] != null
        ? HourlyUnits.fromJson(json['hourly_units'])
        : null;
    current = json['current'] != null
        ? Current.fromJson(json['current'])
        : null;
  }

  // Get current soil temperature (first value in the array)
  double? get currentSoilTemp =>
      soilTemperature6cm != null && soilTemperature6cm!.isNotEmpty
      ? soilTemperature6cm!.first
      : null;

  // Get average soil temperature
  double? get avgSoilTemp {
    if (soilTemperature6cm == null || soilTemperature6cm!.isEmpty) return null;
    final sum = soilTemperature6cm!.reduce((a, b) => a + b);
    return sum / soilTemperature6cm!.length;
  }
}

class HourlyUnits {
  String? time;
  String? soilTemperature6cm;

  HourlyUnits({this.time, this.soilTemperature6cm});

  HourlyUnits.fromJson(Map<String, dynamic> json) {
    time = json['time'];
    soilTemperature6cm = json['soil_temperature_6cm'];
  }
}

class Current {
  String? time;
  int? interval;
  double? temperature2m;
  int? weatherCode;
  double? windSpeed10m;

  Current({
    this.time,
    this.interval,
    this.temperature2m,
    this.weatherCode,
    this.windSpeed10m,
  });

  Current.fromJson(Map<String, dynamic> json) {
    time = json['time'];
    interval = json['interval'];
    temperature2m = json['temperature_2m']?.toDouble();
    weatherCode = json['weather_code'];
    windSpeed10m = json['wind_speed_10m']?.toDouble();
  }
}
