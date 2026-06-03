import 'package:flutter/material.dart';
import 'package:lawn_care/models/weather_model.dart';
import 'dart:ui';

class WeatherBanner extends StatelessWidget {
  final WeatherModel? weather;
  final bool isLoading;
  final String? error;

  const WeatherBanner({
    super.key,
    this.weather,
    this.isLoading = false,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return _buildContainer(
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    if (error != null) {
      return _buildContainer(
        child: Center(
          child: Text(
            error!,
            style: const TextStyle(color: Colors.white),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    if (weather == null) {
      return _buildContainer(
        child: const Center(
          child: Text(
            "Weather data unavailable",
            style: TextStyle(color: Colors.white),
          ),
        ),
      );
    }

    final current = weather!.current;
    final forecast = weather!.forecast?.forecastday?.firstOrNull?.day;

    return _buildContainer(
      child: Stack(
        children: [
          // Background/Ambience (You might want a real image background here)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.blue.withOpacity(0.3),
                    Colors.green.withOpacity(0.3),
                  ],
                ),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(
                  child: Text(
                    "Current Weather",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          offset: Offset(0, 2),
                          blurRadius: 4,
                          color: Colors.black45,
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Left Column: Hi/Low
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildInfoText(
                            "Todays Hi",
                            "${forecast?.maxtempF?.toStringAsFixed(0) ?? '--'} °F",
                          ),
                          const SizedBox(height: 10),
                          _buildInfoText(
                            "Todays Low",
                            "${forecast?.mintempF?.toStringAsFixed(0) ?? '--'} °F",
                          ),
                        ],
                      ),

                      // Right Column: Current Temp & Condition
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            "Current Temp",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            "${current?.tempF ?? '--'} °F",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (current?.condition?.text != null)
                            SizedBox(
                              width: 100, // Constrain width for text wrapping
                              child: Text(
                                current!.condition!.text!,
                                textAlign: TextAlign.right,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContainer({required Widget child}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20), // Matches image rounded corners
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1), // Glassmorphism base
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
            image: const DecorationImage(
              image: AssetImage(
                'assets/images/DALLE_2025-01-14_08.34.38_-_A_visually_appealing_and_vibrant_digital_illustration_of_weather_conditions,_featuring_a_bright_blue_sky_with_fluffy_white_clouds_and_a_shining_sun_in.jpg',
              ), // Placeholder for background if needed
              fit: BoxFit.cover,
              opacity: 0.6,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildInfoText(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
