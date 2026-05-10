import 'package:get/get.dart';

import '../../data/models/master_data_snapshot.dart';
import '../../data/repositories/master_data_repository.dart';

class MasterDataController extends GetxController {
  MasterDataController(this._repository);

  final MasterDataRepository _repository;

  final snapshot = Rxn<MasterDataSnapshot>();
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    try {
      snapshot.value = await _repository.fetchSnapshot();
    } finally {
      isLoading.value = false;
    }
  }
}
