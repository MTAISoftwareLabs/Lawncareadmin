import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lawn_care/utils/appcolor.dart';

class CostomeBotton extends StatefulWidget {
  const CostomeBotton({
    super.key,
    required this.onPressed,
    required this.text,
    required this.color,
  });

  final VoidCallback onPressed;
  final String text;
  final Color color;

  @override
  State<CostomeBotton> createState() => _CostomeBottonState();
}

class _CostomeBottonState extends State<CostomeBotton> {
  final RxBool _isHovered = false.obs;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onPressed,
      onHover: (value) {
        _isHovered.value = value;
      },
      child: Obx(
        () => Container(
          height: 40,
          width: 120,
          decoration: BoxDecoration(
            color: _isHovered.value ? AppColor().secondary : widget.color,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColor().secondary, width: 1),
          ),
          child: Center(
            child: Text(
              widget.text,
              style: TextStyle(
                color: _isHovered.value ? AppColor().primary : AppColor().info,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
