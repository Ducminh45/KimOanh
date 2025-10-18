import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_theme.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const ListTile(title: Text('Appearance')),
          RadioListTile<ThemeMode>(
            title: const Text('System'),
            value: ThemeMode.system,
            groupValue: mode,
            onChanged: (v) => ref.read(themeProvider.notifier).setMode(v ?? ThemeMode.system),
          ),
          RadioListTile<ThemeMode>(
            title: const Text('Light'),
            value: ThemeMode.light,
            groupValue: mode,
            onChanged: (v) => ref.read(themeProvider.notifier).setMode(v ?? ThemeMode.system),
          ),
          RadioListTile<ThemeMode>(
            title: const Text('Dark'),
            value: ThemeMode.dark,
            groupValue: mode,
            onChanged: (v) => ref.read(themeProvider.notifier).setMode(v ?? ThemeMode.system),
          ),
          const Divider(),
          const ListTile(title: Text('Language')), // TODO: implement locale switcher
          const ListTile(title: Text('Units')), // TODO: metric/imperial
          const ListTile(title: Text('Notifications')), // TODO: preferences
        ],
      ),
    );
  }
}
