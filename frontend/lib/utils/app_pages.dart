import 'package:get/get.dart';

import 'package:sales_system/view/pages/home_page.dart';
import 'package:sales_system/view/pages/landing_page.dart';
import 'package:sales_system/view/pages/login_page.dart';
import 'package:sales_system/view/pages/product_form_page.dart';
import 'package:sales_system/view/pages/register_page.dart';
import 'app_routes.dart';

abstract class AppPages {
  AppPages._();

  static final routes = <GetPage>[
    GetPage(name: AppRoutes.landing, page: () => const LandingPage()),
    GetPage(name: AppRoutes.login, page: () => const LoginPage()),
    GetPage(name: AppRoutes.register, page: () => const RegisterPage()),
    GetPage(name: AppRoutes.home, page: () => const HomePage()),
    GetPage(name: AppRoutes.productForm, page: () => const ProductFormPage()),
  ];
}
