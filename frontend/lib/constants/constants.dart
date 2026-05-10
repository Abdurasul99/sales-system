import 'package:flutter/material.dart';

// ============================================================
// Colors — purple theme (matches old saas Tailwind palette)
// ============================================================

// Primary (purple-600 / 700)
const Color kPrimaryColor = Color(0xFF9333EA);    // purple-600
const Color kPrimaryColorDark = Color(0xFF7E22CE); // purple-700
const Color kPrimaryColorLight = Color(0xFFFAF5FF); // purple-50

// Indigo accent
const Color kIndigoColor = Color(0xFF6366F1);
const Color kIndigoLight = Color(0xFFEEF2FF);

// Login bg gradient (purple-50 -> white -> indigo-50)
const Color kLoginGradientFrom = Color(0xFFFAF5FF); // purple-50
const Color kLoginGradientVia = Color(0xFFFFFFFF);
const Color kLoginGradientTo = Color(0xFFEEF2FF); // indigo-50

// Gray scale (Tailwind gray-50/100/200/400/500/700/900)
const Color kGray50 = Color(0xFFF9FAFB);
const Color kGray100 = Color(0xFFF3F4F6);
const Color kGray200 = Color(0xFFE5E7EB);
const Color kGray300 = Color(0xFFD1D5DB);
const Color kGray400 = Color(0xFF9CA3AF);
const Color kGray500 = Color(0xFF6B7280);
const Color kGray600 = Color(0xFF4B5563);
const Color kGray700 = Color(0xFF374151);
const Color kGray800 = Color(0xFF1F2937);
const Color kGray900 = Color(0xFF111827);

// Status colors
const Color kErrorColor = Color(0xFFEF4444);   // red-500
const Color kSuccessColor = Color(0xFF10B981); // emerald-500
const Color kWarningColor = Color(0xFFF59E0B); // amber-500

// Semantic aliases (used across the app)
const Color kBackgroundColor = kGray50;
const Color kSurfaceColor = Colors.white;
const Color kBorderColor = kGray100;
const Color kBorderColorStrong = kGray200;
const Color kTextPrimary = kGray900;
const Color kTextSecondary = kGray700;
const Color kTextMuted = kGray500;
const Color kTextHint = kGray400;

// Legacy aliases kept for backward compatibility
const Color kMainColor = kGray800;
const Color kBlueFontColor = kPrimaryColor;
const Color kNavyColor = Color(0xFF002C5F);
const Color kDarkBlueColor = Color(0xFF8392A6);
const Color kDarkGrayColor = kGray500;
const Color kGrayFontColor = kGray500;
const Color kBlackFontColor = kGray900;
const Color kGrayColor = kGray100;
const Color kHoverColor = kGray100;
const Color kLineColor = kGray100;
const Color kHintColor = kGray300;
const Color kDarkBlueHintColor = Color(0xFFA7B8D0);
const Color kDisableColor = kGray100;
const Color kCellTitleColor = Color(0xFFE6E9ED);
const Color kCellGrayColor = kGray50;

// ============================================================
// Layout
// ============================================================

const double kMobileWidth = 700;
const double kTabletWidth = 1024;
const double kDesktopWidth = 1290;

const double kSidebarWidth = 248;
const double kSidebarCollapsedWidth = 72;
const double kHeaderHeight = 56; // h-14

// ============================================================
// Backend
// ============================================================

const String kApiServer = 'ec2-15-164-220-51.ap-northeast-2.compute.amazonaws.com'; // 'localhost:4000'; //
const String kApiBaseUrl = 'http://$kApiServer/api';
const String kBackendIp = '15.164.220.51';

// ============================================================
// HTTP
// ============================================================

const Duration kConnectTimeout = Duration(seconds: 15);
const Duration kReceiveTimeout = Duration(seconds: 15);

// ============================================================
// API endpoints
// ============================================================

const String kPathRegister = '/auth/register';
const String kPathLogin = '/auth/login';
const String kPathMe = '/auth/me';

const String kPathProducts = '/products';
String pathProductById(String id) => '/products/$id';

const String kPathCategories = '/categories';
String pathCategoryById(String id) => '/categories/$id';

const String kPathSales = '/sales';
const String kPathSalesSummary = '/sales/summary';
String pathSaleById(String id) => '/sales/$id';
String pathSaleVoid(String id) => '/sales/$id/void';

const String kPathAiSuggestions = '/ai/suggestions';
const String kPathAiChat = '/ai/chat';

const String kPathCustomers = '/customers';
String pathCustomerById(String id) => '/customers/$id';

const String kPathSuppliers = '/suppliers';
String pathSupplierById(String id) => '/suppliers/$id';

const String kPathPurchases = '/purchases';
const String kPathPurchasesSummary = '/purchases/summary';

const String kPathExpenses = '/expenses';
const String kPathExpensesSummary = '/expenses/summary';
String pathExpenseById(String id) => '/expenses/$id';

const String kPathIncome = '/income';
const String kPathIncomeSummary = '/income/summary';
String pathIncomeById(String id) => '/income/$id';

const String kPathAnalyticsOverview = '/analytics/overview';
const String kPathAnalyticsAbc = '/analytics/abc';
const String kPathAnalyticsNotifications = '/analytics/notifications';

const String kPathShifts = '/shifts';
const String kPathShiftsCurrent = '/shifts/current';
const String kPathShiftsOpen = '/shifts/open';
const String kPathShiftsClose = '/shifts/close';

const String kPathCurrencyRates = '/currency';
String pathCurrencyByCode(String code) => '/currency/$code';

const String kPathChangePassword = '/auth/change-password';
const String kPathProfile = '/auth/profile';

const String kPathSearch = '/search';

// ============================================================
// Pagination / list limits
// ============================================================

const int kProductListLimit = 20;
const int kLogListLimit = 14;
const int kNotificationListLimit = 16;

// ============================================================
// Storage keys
// ============================================================

const String kStorageToken = 'auth_token';
const String kStorageUser = 'auth_user';

// ============================================================
// Roles
// ============================================================

const Map<String, String> kRoleLabels = {
  'founder': 'Учредитель',
  'admin': 'Администратор',
  'manager': 'Менеджер',
  'cashier': 'Кассир + Завсклад',
  'seller': 'Продавец',
  'user': 'Пользователь',
};

// ============================================================
// Currency
// ============================================================

const String kDefaultCurrency = 'UZS';
const List<String> kSupportedCurrencies = ['UZS', 'USD', 'EUR', 'RUB'];

// ============================================================
// Theme
// ============================================================

const ColorScheme kAppColorScheme = ColorScheme.light(
  primary: kPrimaryColor,
  onPrimary: Colors.white,
  surface: kSurfaceColor,
  onSurface: kTextPrimary,
  error: kErrorColor,
);

const DatePickerThemeData kAppDatePickerTheme = DatePickerThemeData(
  headerForegroundColor: kPrimaryColor,
);
