import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

class AuthService {
  AuthService(this._api);
  final ApiClient _api;

  Future<void> register({required String email, required String password, required String fullName}) async {
    await _api.postJson('/auth/register', { 'email': email, 'password': password, 'fullName': fullName });
  }

  Future<void> login({required String email, required String password}) async {
    final res = await _api.postJson('/auth/login', { 'email': email, 'password': password });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', res['accessToken'] as String);
    await prefs.setString('refreshToken', res['refreshToken'] as String);
    if (res['userId'] is String) {
      await prefs.setString('userId', res['userId'] as String);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
  }
}
