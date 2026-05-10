import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

import 'utils/app_pages.dart';
import 'utils/app_routes.dart';
import 'utils/app_theme.dart';
import 'utils/initial_binding.dart';
import 'utils/local_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await GetStorage.init();
  await initializeDateFormatting('ru_RU', null);
  Intl.defaultLocale = 'ru_RU';

  final hasToken = LocalStorage().token != null;

  runApp(SalesSystemApp(initialRoute: hasToken ? AppRoutes.home : AppRoutes.landing));
}

class SalesSystemApp extends StatelessWidget {
  const SalesSystemApp({super.key, required this.initialRoute});

  final String initialRoute;

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Sales System',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialBinding: InitialBinding(),
      initialRoute: initialRoute,
      getPages: AppPages.routes,
    );
  }
}
