import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/gradient_button.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';

class TabProfile extends GetView<AuthController> {
  const TabProfile({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Obx(() {
            final user = controller.user.value;
            if (user == null) {
              return const Text('Not signed in',
                  style: TextStyle(color: kGrayFontColor));
            }
            final initial =
                user.name.isNotEmpty ? user.name[0].toUpperCase() : '?';
            final label = user.roleLabel.isNotEmpty ? user.roleLabel : user.role;
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF2563EB), Color(0xFF005FB7)],
                    ),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    initial,
                    style: const TextStyle(
                      fontSize: 36,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  user.name,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                    color: kBlackFontColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '@${user.username}',
                  style: const TextStyle(fontSize: 13, color: kGrayFontColor),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: kPrimaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    label,
                    style: const TextStyle(
                      fontSize: 12,
                      color: kBlueFontColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (user.email.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    user.email,
                    style: const TextStyle(fontSize: 13, color: kDarkGrayColor),
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: 220,
                  child: GradientButton(
                    buttonText: 'Sign out',
                    isPrimary: false,
                    icon: const Icon(Icons.logout),
                    onTap: controller.logout,
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
