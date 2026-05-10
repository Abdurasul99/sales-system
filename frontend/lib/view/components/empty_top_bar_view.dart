import 'package:flutter/material.dart';

import 'package:sales_system/constants/constants.dart';

class EmptyTopBarView extends StatelessWidget {
  const EmptyTopBarView({super.key, this.actions});

  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      alignment: Alignment.centerLeft,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00000D).withValues(alpha: 0.05),
            offset: const Offset(0, 1),
            blurRadius: 3.0,
          ),
        ],
      ),
      child: Row(
        children: [
          const SizedBox(width: 24),
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: kPrimaryColor,
              borderRadius: BorderRadius.circular(6),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.point_of_sale, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          const Text(
            'Sales System',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: kBlackFontColor,
            ),
          ),
          const Spacer(),
          if (actions != null) ...actions!,
          const SizedBox(width: 24),
        ],
      ),
    );
  }
}
