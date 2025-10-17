import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  Map<String, dynamic>? summary;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.getJson('/progress/summary');
      setState(() => summary = res);
    } catch (e) {
      // ignore for now
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard'), actions: [
        IconButton(onPressed: () => context.go('/chat'), icon: const Icon(Icons.chat_bubble_outline)),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/scanner'),
        icon: const Icon(Icons.camera_alt_outlined),
        label: const Text('Scan'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: summary == null
            ? const Text('Loading summary...')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Calories: ${summary!['calories']} kcal'),
                  Text('Water: ${summary!['waterMl']} ml'),
                  Text('Exercise: ${summary!['caloriesBurned']} kcal'),
                  Text('Macros - P: ${summary!['macros']['proteinG']}g, C: ${summary!['macros']['carbsG']}g, F: ${summary!['macros']['fatG']}g'),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: () => context.go('/login'), child: const Text('Logout')),
                ],
              ),
      ),
    );
  }
}
