import '../models/customer_model.dart';
import '../models/supplier_model.dart';
import '../providers/partners_api_provider.dart';

class PartnersRepository {
  PartnersRepository(this._provider);

  final PartnersApiProvider _provider;

  Future<List<CustomerModel>> fetchCustomers() async {
    final payload = await _provider.fetchCustomers();
    return payload
        .map((item) => CustomerModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<SupplierModel>> fetchSuppliers() async {
    final payload = await _provider.fetchSuppliers();
    return payload
        .map((item) => SupplierModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
