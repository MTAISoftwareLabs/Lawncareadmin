import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import '../utils/appcolor.dart';

class LoginBottons extends StatefulWidget {
  const LoginBottons({
    super.key,
    required this.onPressed,
    required this.text,
    required this.color,
    this.widthe,
  });

  final VoidCallback onPressed;
  final String text;
  final Color color;
  final double? widthe;

  @override
  State<LoginBottons> createState() => _LoginBottonsState();
}

class _LoginBottonsState extends State<LoginBottons> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final textColor = _isHovered ? AppColor().primary : AppColor().info;

    return InkWell(
      onTap: widget.onPressed,
      onHover: (value) {
        setState(() => _isHovered = value);
      },
      child: Container(
        height: 50,
        width: widget.widthe ?? Get.width * 0.9,
        decoration: BoxDecoration(
          color: _isHovered ? AppColor().secondary : widget.color,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Shadow text (BOTTOM layer)
              Text(
                widget.text,
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textColor.withOpacity(0.8),
                ),
              ),

              // Main text (TOP layer)
              Text(
                widget.text,
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
