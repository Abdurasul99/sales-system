import '../models/master_data_snapshot.dart';
import '../providers/master_data_api_provider.dart';

class MasterDataRepository {
  MasterDataRepository(this._provider);

  final MasterDataApiProvider _provider;

  Future<MasterDataSnapshot> fetchSnapshot() async {
    final payload = await _provider.fetchBootstrap();
    return MasterDataSnapshot.fromJson(payload);
  }
}
