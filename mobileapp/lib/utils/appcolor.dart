import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/services/storage_service.dart';

class AppColor {
  bool get isDark {
    try {
      return Get.find<StorageService>().isDarkMode();
    } catch (e) {
      return Get.isDarkMode;
    }
  }

  // Primary: Dark Green vs Light/White
  Color get primary =>
      isDark ? const Color(0xFF2F4F2F) : const Color(0xFFB4C1AE);

  // Secondary: Gold (Keep consistent or adjust for contrast)
  Color get secondary => const Color(0xFF54652D);

  // Tertiary
  Color get tertiary => isDark
      ? const Color(0xFF556B2F)
      : const Color(0xFF56642A); // Placeholder adjustment

  // Alternate
  Color get alternate =>
      isDark ? const Color(0xFF455B45) : const Color(0xFFE0E0E0);

  // Text
  Color get primaryText => isDark
      ? const Color(0xFF776705)
      : const Color(0xFF2F4F2F); // Gold vs Dark Green
  Color get secondaryText =>
      isDark ? const Color(0xFF193C2D) : const Color(0xFFFFFFFF);

  // Backgrounds
  Color get primaryBackground =>
      isDark ? const Color(0xFF455B45) : const Color(0xFFB4C1AE);
  Color get secondaryBackground =>
      isDark ? const Color(0xFF1D4339) : const Color(0xFFB5C2AF);

  Color get orangecolor => Colors.orangeAccent.withOpacity(0.5);

  // Accents
  Color get accent1 =>
      isDark ? const Color(0xFF273128) : const Color(0xFFFFFFFF);
  Color get accent2 => const Color(0xFF757575);
  Color get accent3 => const Color(0xFF5D5D5D);
  Color get accent4 => isDark
      ? const Color(0xFFB1A66F)
      : const Color(0xFF273327); // Gold-ish gradient
  Color get accent5 => isDark
      ? const Color(0xFFB1A66F)
      : const Color(0xFFFFFFFF); // Gold-ish gradient

  Color get success => const Color(0xFF109344);
  Color get primaryfix => const Color(0xFF2F4F2F);
  Color get sedaryBackground => const Color(0xFF1A3F39);
  Color get sedarymainBackground => const Color(0xFF435745);
  Color get warning => const Color(0xFFFFFC04);
  Color get error => const Color(0xFFFF3090);
  Color get info => isDark ? const Color(0xFFFFFFFF) : const Color(0xFF000000);
  Color get border => const Color(0xFF3D3D3D);
  Color get transparent => const Color(0x00000000);
  Color get iconColor => const Color(0xFF626262);
  Color get redColor => const Color(0xFFEBF8EC);
  Color get barierColor => const Color(0xA6000000);
  Color get lightBlack => const Color(0xFFD9D9D9);
  Color get blue => const Color(0xFF1F71E4);
  Color get everBlack => const Color(0xFF2F4F2F);
  Color get gray2 => const Color(0xFF353535);
  Color get borderDarker => const Color(0xFF3E3E3E);
  Color get snackBar => const Color(0xFF2C2C2C);
  Color get everBlack2 => const Color(0xFF373737);
  Color get fioletTrans => const Color(0x2CF1EEF3);
  Color get dropdownBack => const Color(0xFF2C2C2C);
  Color get dropdownHover => const Color(0xFF373737);
}
