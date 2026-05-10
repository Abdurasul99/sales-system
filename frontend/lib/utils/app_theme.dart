import 'package:flutter/material.dart';

import 'package:sales_system/constants/constants.dart';

class AppTheme {
  AppTheme._();

  static final ThemeData light = ThemeData(
    useMaterial3: true,
    colorScheme: kAppColorScheme,
    scaffoldBackgroundColor: kBackgroundColor,
    datePickerTheme: kAppDatePickerTheme,
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      isDense: true,
      floatingLabelBehavior: FloatingLabelBehavior.always,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      labelStyle: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: kTextSecondary,
      ),
      floatingLabelStyle: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: kTextSecondary,
      ),
      hintStyle: const TextStyle(fontSize: 13, color: kTextHint),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kBorderColorStrong),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kBorderColorStrong),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kPrimaryColor, width: 1.6),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kErrorColor),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: kErrorColor, width: 1.6),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    dividerTheme: const DividerThemeData(color: kLineColor, thickness: 1),
  );
}
