import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  ApiClient({http.Client? httpClient}) : _http = httpClient ?? http.Client();

  final http.Client _http;
  static const String _baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:4000/api');

  Future<String?> _getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('accessToken');
  }

  Future<String?> _getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('refreshToken');
  }

  Future<void> _setTokens(String access, String refresh) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', access);
    await prefs.setString('refreshToken', refresh);
  }

  Future<http.Response> _request(String method, String path, {Map<String, String>? headers, Object? body, Map<String, String>? query}) async {
    final uri = Uri.parse('$_baseUrl$path').replace(queryParameters: query);
    final token = await _getAccessToken();
    final reqHeaders = <String, String>{
      'Content-Type': 'application/json',
      if (headers != null) ...headers,
      if (token != null) 'Authorization': 'Bearer $token',
    };
    final request = http.Request(method, uri)..headers.addAll(reqHeaders);
    if (body != null) {
      request.body = body is String ? body : jsonEncode(body);
    }
    final streamed = await _http.send(request);
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode == 401) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        // retry once
        return _request(method, path, headers: headers, body: body, query: query);
      }
    }
    return response;
  }

  Future<bool> _tryRefresh() async {
    final refresh = await _getRefreshToken();
    if (refresh == null) return false;
    final uri = Uri.parse('$_baseUrl/auth/refresh');
    final res = await _http.post(uri, headers: {'Content-Type': 'application/json'}, body: jsonEncode({'refreshToken': refresh}));
    if (res.statusCode == 200) {
      final json = jsonDecode(res.body) as Map<String, dynamic>;
      await _setTokens(json['accessToken'] as String, json['refreshToken'] as String);
      return true;
    }
    return false;
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    final res = await _request('POST', path, body: body);
    if (res.statusCode >= 200 && res.statusCode < 300) return jsonDecode(res.body) as Map<String, dynamic>;
    final err = _parseError(res);
    throw err;
    }

  Future<Map<String, dynamic>> putJson(String path, Map<String, dynamic> body) async {
    final res = await _request('PUT', path, body: body);
    if (res.statusCode >= 200 && res.statusCode < 300) return jsonDecode(res.body) as Map<String, dynamic>;
    final err = _parseError(res);
    throw err;
  }

  Future<Map<String, dynamic>> getJson(String path, {Map<String, String>? query}) async {
    final res = await _request('GET', path, query: query);
    if (res.statusCode >= 200 && res.statusCode < 300) return jsonDecode(res.body) as Map<String, dynamic>;
    final err = _parseError(res);
    throw err;
  }

  Exception _parseError(http.Response res) {
    try {
      final data = jsonDecode(res.body);
      if (data is Map<String, dynamic>) {
        final code = data['code'] as String?;
        final message = data['message'] as String? ?? 'Error';
        return ApiException(status: res.statusCode, code: code, message: message);
      }
    } catch (_) {}
    return Exception('HTTP ${res.statusCode}: ${res.body}');
  }
}

class ApiException implements Exception {
  ApiException({required this.status, this.code, required this.message});
  final int status;
  final String? code;
  final String message;
  @override
  String toString() => 'ApiException($status, $code, $message)';
}
