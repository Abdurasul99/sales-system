# Sales System — Frontend (Flutter, MVVM + GetX, TDD)

## Setup

```bash
cd frontend
flutter pub get
flutter run            # mobile/desktop
flutter run -d chrome  # web
flutter test           # run all unit tests
flutter analyze        # static analysis
```

Backend must be running on `http://localhost:4000` (see [../backend/](../backend/)).

## Project structure (`lib/`)

| Folder        | Role                                                               |
|---------------|--------------------------------------------------------------------|
| `models/`     | Plain data classes — `fromJson`, `toJson`, `copyWith`              |
| `repository/` | API client (Dio) and repositories — only place that talks to HTTP  |
| `controller/` | ViewModels (`GetxController` with `.obs` reactive state)           |
| `pages/`      | Full-screen Views (Scaffold + AppBar)                              |
| `tabs/`       | Sub-views inside a `TabBarView` (Products tab, Profile tab)        |
| `components/` | Reusable widgets (`AppTextField`, `ErrorText`, `LoadingButton`)    |
| `utils/`      | Validators, theme, routes, bindings, local storage                 |

```
lib/
├── main.dart
├── models/
│   ├── user_model.dart
│   └── product_model.dart
├── repository/
│   ├── api_client.dart       # Dio + JWT interceptor
│   ├── api_endpoints.dart
│   ├── auth_repository.dart
│   └── product_repository.dart
├── controller/
│   ├── auth_controller.dart
│   └── products_controller.dart
├── pages/
│   ├── login_page.dart
│   ├── register_page.dart
│   ├── home_page.dart        # holds bottom TabBar
│   └── product_form_page.dart
├── tabs/
│   ├── products_tab.dart
│   └── profile_tab.dart
├── components/
│   ├── app_text_field.dart
│   ├── error_text.dart
│   └── loading_button.dart
└── utils/
    ├── app_routes.dart
    ├── app_pages.dart
    ├── app_theme.dart
    ├── initial_binding.dart
    ├── local_storage.dart    # GetStorage wrapper
    └── validators.dart
```

## TDD + Mocking

All controllers and repositories are written with constructor injection so they
are testable without GetMaterialApp, real HTTP, or persistent storage.

| Layer       | Test                                                  | Strategy                                                              |
|-------------|-------------------------------------------------------|------------------------------------------------------------------------|
| Models      | `test/models/*_test.dart`                              | Pure unit tests — JSON parsing, equality, copyWith                    |
| Validators  | `test/utils/validators_test.dart`                      | Pure unit tests                                                       |
| Repository  | `test/repository/*_test.dart`                          | `MockDio extends Mock implements Dio` (mocktail) — stub + verify      |
| Controller  | `test/controller/*_test.dart`                          | Mock repository + fake LocalStorage + recorder for navigation/pop     |

```bash
flutter test                                              # all tests
flutter test test/controller                              # only controllers
flutter test test/repository/auth_repository_test.dart    # one file
```

### Why injectable navigators?

`AuthController` and `ProductsController` accept a `navigateTo` callback in
their constructor (defaults to `Get.offAllNamed`/`Get.toNamed`). In tests, we
record routes into a `List<String>` and assert against it — no need to spin
up a `GetMaterialApp` for unit tests.

## Adding a new module (e.g. customers)

1. `models/customer_model.dart` — `fromJson`, `toCreateJson`, `copyWith`, `==`.
2. `repository/customer_repository.dart` — receives `Dio`, exposes CRUD.
3. `controller/customer_controller.dart` — receives repository, exposes `.obs` state and async methods that return `bool` (success).
4. Wire both into `utils/initial_binding.dart`.
5. Build `pages/` or `tabs/` that bind via `GetView<CustomerController>`.
6. Add a route to `utils/app_routes.dart` + `utils/app_pages.dart`.
7. Mirror the same test structure under `test/`.
