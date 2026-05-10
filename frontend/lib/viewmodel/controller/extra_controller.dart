import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/viewmodel/repository/extra_repository.dart';

/// Single controller for ABC / Notifications / Shifts / Currency,
/// each with its own state slice. Avoids creating 4 tiny controllers.
class ExtraController extends GetxController {
  ExtraController({required ExtraRepository repository}) : _repo = repository;
  final ExtraRepository _repo;

  // ABC
  final abc = AbcResult.empty.obs;
  final isAbcLoading = false.obs;
  final abcDays = 90.obs;

  // Notifications
  final notifications = <NotificationItem>[].obs;
  final isNotificationsLoading = false.obs;

  // Shifts
  final shifts = <ShiftModel>[].obs;
  final currentShift = Rxn<ShiftModel>();
  final isShiftsLoading = false.obs;
  final isShiftSaving = false.obs;

  // Currency
  final currencyRates = <CurrencyRate>[].obs;
  final isCurrencyLoading = false.obs;
  final isCurrencySaving = false.obs;

  // Global search
  final searchQuery = ''.obs;
  final searchResult = GlobalSearchResult.empty.obs;
  final isSearching = false.obs;

  final errorMessage = RxnString();

  Future<void> fetchAbc({int? days}) async {
    if (days != null) abcDays.value = days;
    isAbcLoading.value = true;
    errorMessage.value = null;
    try {
      abc.value = await _repo.abc(days: abcDays.value);
    } on DioException catch (e) {
      errorMessage.value = _err(e);
    } finally {
      isAbcLoading.value = false;
    }
  }

  Future<void> fetchNotifications() async {
    isNotificationsLoading.value = true;
    errorMessage.value = null;
    try {
      notifications.value = await _repo.notifications();
    } on DioException catch (e) {
      errorMessage.value = _err(e);
    } finally {
      isNotificationsLoading.value = false;
    }
  }

  Future<void> fetchShifts() async {
    isShiftsLoading.value = true;
    errorMessage.value = null;
    try {
      final results = await Future.wait([
        _repo.shifts(),
        _repo.currentShift(),
      ]);
      shifts.value = results[0] as List<ShiftModel>;
      currentShift.value = results[1] as ShiftModel?;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
    } finally {
      isShiftsLoading.value = false;
    }
  }

  Future<bool> openShift({num openingCash = 0}) async {
    isShiftSaving.value = true;
    errorMessage.value = null;
    try {
      final s = await _repo.openShift(openingCash: openingCash);
      currentShift.value = s;
      shifts.insert(0, s);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isShiftSaving.value = false;
    }
  }

  Future<bool> closeShift({num closingCash = 0, String notes = ''}) async {
    isShiftSaving.value = true;
    errorMessage.value = null;
    try {
      final s = await _repo.closeShift(closingCash: closingCash, notes: notes);
      currentShift.value = null;
      final i = shifts.indexWhere((x) => x.id == s.id);
      if (i != -1) shifts[i] = s;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isShiftSaving.value = false;
    }
  }

  Future<void> fetchCurrency() async {
    isCurrencyLoading.value = true;
    errorMessage.value = null;
    try {
      currencyRates.value = await _repo.currencyRates();
    } on DioException catch (e) {
      errorMessage.value = _err(e);
    } finally {
      isCurrencyLoading.value = false;
    }
  }

  Future<bool> updateCurrency(String code, num rate) async {
    isCurrencySaving.value = true;
    errorMessage.value = null;
    try {
      final updated = await _repo.updateCurrency(code, rate);
      final i = currencyRates.indexWhere((c) => c.code == code);
      if (i != -1) {
        currencyRates[i] = updated;
      } else {
        currencyRates.add(updated);
      }
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isCurrencySaving.value = false;
    }
  }

  Future<void> performSearch(String q) async {
    final query = q.trim();
    searchQuery.value = query;
    if (query.isEmpty) {
      searchResult.value = GlobalSearchResult.empty;
      return;
    }
    isSearching.value = true;
    try {
      searchResult.value = await _repo.globalSearch(query);
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      searchResult.value = GlobalSearchResult.empty;
    } finally {
      isSearching.value = false;
    }
  }

  void clearSearch() {
    searchQuery.value = '';
    searchResult.value = GlobalSearchResult.empty;
  }

  String _err(DioException e) {
    final d = e.response?.data;
    if (d is Map && d['message'] != null) return d['message'].toString();
    return e.message ?? 'Network error';
  }
}
