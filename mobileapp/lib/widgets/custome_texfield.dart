import 'package:flutter/material.dart';
import 'package:lawn_care/utils/appcolor.dart';

class CustomeTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool obscureText;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;

  const CustomeTextField({
    super.key,
    required this.controller,
    required this.hintText,
    required this.obscureText,
    this.suffixIcon,
    this.keyboardType,
    this.color,
  });

  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color:
            color ??
            AppColor()
                .secondaryText, // Using primary as a dark background for input
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColor().info.withOpacity(0.3), width: 0.8),
      ),
      child: TextField(
        keyboardType: keyboardType ?? TextInputType.text,
        controller: controller,
        obscureText: obscureText,
        style: TextStyle(fontFamily: 'Roboto', color: AppColor().info),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            fontFamily: 'Roboto',
            color: AppColor().info.withOpacity(0.6),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 10, // Adjust for vertical centering
          ),
          suffixIcon: suffixIcon,
        ),
      ),
    );
  }
}
