import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/models/home_model.dart';
import 'package:lawn_care/services/content_service.dart';
import 'package:lawn_care/screens/library_screen/library_item_model.dart';
import 'package:lawn_care/models/deal_model.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';

import 'package:lawn_care/models/weather_model.dart';
import 'package:lawn_care/services/weather_service.dart';
import 'package:lawn_care/models/soil_temp_model.dart';
import 'package:lawn_care/services/soil_temp_service.dart';

import 'package:lawn_care/data/self_diagnosis_data.dart';

class HomeCtrl extends GetxController {
  final ContentService _contentService = Get.find<ContentService>();
  final WeatherService _weatherService = Get.put(WeatherService());
  final SoilTempService _soilTempService = Get.put(SoilTempService());

  RxInt carouselIndex = 0.obs;
  RxBool isLoading = false.obs;
  Rx<HomeDataModel?> homeData = Rx<HomeDataModel?>(null);
  Rx<WeatherModel?> weatherData = Rx<WeatherModel?>(null);
  RxBool isWeatherLoading = false.obs;
  RxString weatherError = ''.obs;

  Rx<SoilTempModel?> soilTempData = Rx<SoilTempModel?>(null);
  RxBool isSoilTempLoading = false.obs;
  RxString soilTempError = ''.obs;

  RxList<DealModel> newDeals = <DealModel>[].obs;
  RxList<LibraryItem> deals = <LibraryItem>[].obs;
  RxBool isDealsLoading = false.obs;

  late PageController pageController;
  Timer? autoSlideTimer;
  final int autoSlideDuration = 3;

  @override
  void onInit() {
    super.onInit();
    pageController = PageController();
    fetchHomeData();
    fetchLocationAndWeatherData();
    fetchDeals();
    startAutoSlide();
  }

  Future<void> fetchDeals() async {
    try {
      isDealsLoading.value = true;
      final response = await _contentService.getDeals();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.body['data'] ?? [];
        newDeals.value = data.map((json) => DealModel.fromJson(json)).toList();
        deals.value = data
            .map((json) => LibraryItem.fromDealJson(json))
            .toList();
      }
    } catch (e) {
      debugPrint("HomeCtrl.fetchDeals error: $e");
    } finally {
      isDealsLoading.value = false;
    }
  }

  @override
  void onClose() {
    autoSlideTimer?.cancel();
    pageController.dispose();
    super.onClose();
  }

  void startAutoSlide() {
    autoSlideTimer = Timer.periodic(Duration(seconds: autoSlideDuration), (
      timer,
    ) {
      if (pageController.hasClients) {
        int nextPage = (carouselIndex.value + 1) % 3;
        pageController.animateToPage(
          nextPage,
          duration: const Duration(seconds: 1),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> fetchLocationAndWeatherData() async {
    isWeatherLoading.value = true;
    isSoilTempLoading.value = true;
    weatherError.value = '';
    soilTempError.value = '';

    Position? position;

    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        weatherError.value = 'Location services are disabled.';
        soilTempError.value = 'Location services are disabled.';
        isWeatherLoading.value = false;
        isSoilTempLoading.value = false;
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          weatherError.value = 'Location permissions are denied';
          soilTempError.value = 'Location permissions are denied';
          isWeatherLoading.value = false;
          isSoilTempLoading.value = false;
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        weatherError.value =
            'Location permissions are permanently denied, we cannot request permissions.';
        soilTempError.value = 'Location permissions are permanently denied.';
        isWeatherLoading.value = false;
        isSoilTempLoading.value = false;
        return;
      }

      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 10),
        ),
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          throw TimeoutException('Location request timed out');
        },
      );

      await Future.wait([
        _fetchWeatherWithPosition(position),
        _fetchSoilTempWithPosition(position),
      ]);
    } on TimeoutException catch (e) {
      debugPrint('HomeCtrl: location timeout: $e');
      weatherError.value = 'Location request timed out';
      soilTempError.value = 'Location request timed out';
      isWeatherLoading.value = false;
      isSoilTempLoading.value = false;
    } catch (e) {
      debugPrint('HomeCtrl: location error: $e');
      weatherError.value = 'Error getting location: ${e.toString()}';
      soilTempError.value = 'Error getting location: ${e.toString()}';
      isWeatherLoading.value = false;
      isSoilTempLoading.value = false;
    }
  }

  Future<void> _fetchWeatherWithPosition(Position position) async {
    try {
      final weather = await _weatherService.getLocalWeather(
        position.latitude.toString(),
        position.longitude.toString(),
      );

      if (weather != null) {
        weatherData.value = weather;
        weatherError.value = '';
      } else {
        weatherError.value = 'Failed to load weather data';
      }
    } catch (e) {
      debugPrint('HomeCtrl: weather error: $e');
      weatherError.value = 'Error fetching weather: ${e.toString()}';
    } finally {
      isWeatherLoading.value = false;
    }
  }

  Future<void> _fetchSoilTempWithPosition(Position position) async {
    try {
      final soilTemp = await _soilTempService.getSevenDaysSoilTemp(
        position.latitude.toString(),
        position.longitude.toString(),
      );

      if (soilTemp != null) {
        soilTempData.value = soilTemp;
        soilTempError.value = '';
      } else {
        soilTempError.value = 'Failed to load soil temperature data';
      }
    } catch (e) {
      debugPrint('HomeCtrl: soil temp error: $e');
      soilTempError.value = 'Error fetching soil temperature: ${e.toString()}';
    } finally {
      isSoilTempLoading.value = false;
    }
  }

  Future<void> fetchWeather() async {
    await fetchLocationAndWeatherData();
  }

  Future<void> fetchSoilTemp() async {
    await fetchLocationAndWeatherData();
  }

  Future<void> fetchHomeData() async {
    try {
      isLoading.value = true;
      final response = await _contentService.getHomeData();
      if (response.statusCode == 200) {
        var model = HomeDataModel.fromJson(response.body);

        if (model.data.selfDiagnosis.isEmpty) {
          model.data.selfDiagnosis.addAll(SelfDiagnosisData.items);
        } else {
          model.data.selfDiagnosis.clear();
          model.data.selfDiagnosis.addAll(SelfDiagnosisData.items);
        }

        homeData.value = model;
      }
    } catch (e) {
      debugPrint("HomeCtrl.fetchHomeData error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  final List<String> bannerImages = [
    'assets/images/DALLE_2025-01-09_13.21.06_-_A_modern_backyard_scene_featuring_a_sleek,_futuristic_house_with_a_neatly_striped_lawn_in_the_foreground._On_the_left_side_of_the_house,_the_back_wall.jpg',
    'assets/images/DALLE_2025-01-13_20.00.16_-_A_visually_engaging_and_modern_image_designed_to_represent_an_AI-powered_question-and-answer_feature_for_a_lawn_care_app._The_foreground_features_a_sl.jpg',
    'assets/images/DALLE_2025-01-14_08.34.38_-_A_visually_appealing_and_vibrant_digital_illustration_of_weather_conditions,_featuring_a_bright_blue_sky_with_fluffy_white_clouds_and_a_shining_sun_in.jpg',
  ];

  void updateCarouselIndex(int index) {
    carouselIndex.value = index;
  }
}
