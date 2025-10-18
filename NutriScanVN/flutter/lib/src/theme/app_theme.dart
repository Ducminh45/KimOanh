import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system) { _load(); }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final s = prefs.getString('themeMode');
    if (s == 'dark') state = ThemeMode.dark;
    else if (s == 'light') state = ThemeMode.light;
    else state = ThemeMode.system;
  }

  Future<void> setMode(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    final val = mode == ThemeMode.dark ? 'dark' : mode == ThemeMode.light ? 'light' : 'system';
    await prefs.setString('themeMode', val);
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) => ThemeNotifier());

ThemeData buildLightTheme() {
  final base = ThemeData.light(useMaterial3: true);
  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3E9B8A), brightness: Brightness.light),
  );
}

ThemeData buildDarkTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3E9B8A), brightness: Brightness.dark),
  );
}
