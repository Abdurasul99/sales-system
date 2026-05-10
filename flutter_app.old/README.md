# Flutter App

Flutter MVVM/GetX client for the rebuilt Sales System MVP.

## Stack

- Flutter
- GetX
- Dio
- GetStorage

## Quick Start

```bash
flutter pub get
flutter analyze
flutter test
flutter run -d chrome --dart-define=API_BASE_URL=http://127.0.0.1:4000/api
```

For demo packaging through the backend:

```bash
flutter build web --no-wasm-dry-run --dart-define=API_BASE_URL=/api
```

The backend then serves the built web bundle from `flutter_app/build/web`.

## Current Screens

- Login
- Executive dashboard
- Products
- Inventory alerts

## Architecture

- `data/models` - DTO/view models
- `data/providers` - raw HTTP access
- `data/repositories` - app-facing data layer
- `modules/*` - GetX bindings, controllers, and views
- `shared/*` - theme, services, and reusable widgets
