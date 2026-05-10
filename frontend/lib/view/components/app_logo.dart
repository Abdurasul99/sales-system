import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:sales_system/constants/constants.dart';

/// Renders the app's brand logo (assets/images/logo.svg).
///
/// `withWordmark` adds the "Sales System" text next to the mark.
/// `compact` makes the wordmark smaller (suitable for navbars).
class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.size = 36,
    this.withWordmark = false,
    this.compact = false,
    this.wordmarkColor = kTextPrimary,
    this.subtitle,
  });

  final double size;
  final bool withWordmark;
  final bool compact;
  final Color wordmarkColor;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final mark = SvgPicture.asset(
      'assets/images/logo.svg',
      width: size,
      height: size,
      // Logo already includes ERP · CRM text below the mark — clip to the
      // upper portion so we only show the orbit when used in tight UI.
      fit: BoxFit.contain,
    );

    if (!withWordmark) return mark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Sales System',
              style: TextStyle(
                fontSize: compact ? 14 : 18,
                fontWeight: FontWeight.w800,
                color: wordmarkColor,
                height: 1.1,
                letterSpacing: -0.2,
              ),
            ),
            if (subtitle != null)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  subtitle!,
                  style: TextStyle(
                    fontSize: compact ? 11 : 12,
                    color: kTextHint,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
