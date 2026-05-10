import 'package:flutter/material.dart';

abstract class AppShadows {
  static const card = [
    BoxShadow(
      color: Color(0x0F101828),
      blurRadius: 24,
      offset: Offset(0, 10),
    ),
  ];

  static const floating = [
    BoxShadow(
      color: Color(0x12101828),
      blurRadius: 40,
      offset: Offset(0, 20),
    ),
  ];
}
