import 'package:sales_system/constants/constants.dart';

class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = kApiBaseUrl;

  static const String register = kPathRegister;
  static const String login = kPathLogin;
  static const String me = kPathMe;

  static const String products = kPathProducts;
  static String productById(String id) => pathProductById(id);

  static const String categories = kPathCategories;
  static String categoryById(String id) => pathCategoryById(id);

  static const String sales = kPathSales;
  static const String salesSummary = kPathSalesSummary;
  static String saleById(String id) => pathSaleById(id);
  static String saleVoid(String id) => pathSaleVoid(id);
}
