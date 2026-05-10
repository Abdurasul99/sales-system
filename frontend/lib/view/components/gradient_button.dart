import 'package:flutter/material.dart';

import 'package:sales_system/constants/constants.dart';

class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.buttonText,
    this.onTap,
    this.isLoading = false,
    this.isPrimary = true,
    this.icon,
    this.fontSize = 15,
    this.height = 44,
  });

  final String buttonText;
  final VoidCallback? onTap;
  final bool isLoading;
  final bool isPrimary;
  final Widget? icon;
  final double fontSize;
  final double height;

  @override
  Widget build(BuildContext context) {
    final disabled = isLoading || onTap == null;
    final gradient = isPrimary
        ? const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1E73DA), Color(0xFF005FB7)],
          )
        : const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF1F1F1), Color(0xFFD6D6D6)],
          );

    return MouseRegion(
      cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      child: GestureDetector(
        onTap: disabled ? null : onTap,
        child: Opacity(
          opacity: disabled && !isLoading ? 0.6 : 1,
          child: Container(
            height: height,
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.circular(4),
            ),
            alignment: Alignment.center,
            child: isLoading
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(Colors.white),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        IconTheme(
                          data: IconThemeData(
                            color: isPrimary ? Colors.white : kBlackFontColor,
                            size: fontSize + 2,
                          ),
                          child: icon!,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        buttonText,
                        style: TextStyle(
                          fontSize: fontSize,
                          color: isPrimary ? Colors.white : kBlackFontColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
