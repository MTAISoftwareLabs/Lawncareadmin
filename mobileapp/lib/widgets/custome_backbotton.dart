import 'package:flutter/material.dart';
import 'package:lawn_care/utils/appcolor.dart';

class CostomeBackBotton extends StatelessWidget {
  CostomeBackBotton({super.key, required this.onPressed});
  final Function() onPressed;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        // height: 40,
        // width: 40,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(Icons.arrow_back, color: AppColor().primaryText),
      ),
    );
  }
}
