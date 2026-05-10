import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../routes/app_pages.dart';
import '../routes/app_routes.dart';
import '../shared/services/api_service.dart';
import '../shared/theme/app_theme.dart';

class SalesSystemApp extends StatelessWidget {
  const SalesSystemApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Sales System',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      initialRoute: ApiService.hasToken ? AppRoutes.workspace : AppRoutes.login,
      defaultTransition: Transition.fadeIn,
      getPages: AppPages.pages,
    );
  }
}
