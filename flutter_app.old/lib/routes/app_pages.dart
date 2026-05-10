import 'package:get/get.dart';

import '../modules/auth/auth_binding.dart';
import '../modules/auth/auth_view.dart';
import '../modules/workspace/workspace_binding.dart';
import '../modules/workspace/workspace_view.dart';
import '../shared/navigation/app_sections.dart';
import 'app_routes.dart';

class AppPages {
  static final pages = <GetPage>[
    GetPage(
      name: AppRoutes.login,
      page: () => const AuthView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.workspace,
      page: () => const WorkspaceView(initialRoute: AppRoutes.dashboard),
      binding: WorkspaceBinding(),
      transition: Transition.noTransition,
    ),
    ...AppSection.values.map(
      (section) => GetPage(
        name: section.route,
        page: () => WorkspaceView(initialRoute: section.route),
        binding: WorkspaceBinding(),
        transition: Transition.noTransition,
      ),
    ),
  ];
}
