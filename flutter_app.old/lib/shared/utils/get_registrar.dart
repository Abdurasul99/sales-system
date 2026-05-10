import 'package:get/get.dart';

void lazyPutIfAbsent<T>(
  InstanceBuilderCallback<T> builder, {
  bool fenix = false,
}) {
  if (!Get.isRegistered<T>()) {
    Get.lazyPut<T>(builder, fenix: fenix);
  }
}
