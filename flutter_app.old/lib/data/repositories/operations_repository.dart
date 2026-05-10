import '../models/order_document_model.dart';
import '../providers/operations_api_provider.dart';

class OperationsRepository {
  OperationsRepository(this._provider);

  final OperationsApiProvider _provider;

  Future<List<OrderDocumentModel>> fetchSalesOrders() async {
    final payload = await _provider.fetchSalesOrders();
    return payload
        .map((item) => OrderDocumentModel.fromSalesJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<OrderDocumentModel>> fetchPurchaseOrders() async {
    final payload = await _provider.fetchPurchaseOrders();
    return payload
        .map(
          (item) => OrderDocumentModel.fromPurchaseJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<List<OrderDocumentModel>> fetchReturnOrders() async {
    final payload = await _provider.fetchReturnOrders();
    return payload
        .map((item) => OrderDocumentModel.fromReturnJson(item as Map<String, dynamic>))
        .toList();
  }
}
