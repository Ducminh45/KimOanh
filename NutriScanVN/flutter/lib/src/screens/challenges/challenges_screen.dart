import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class ChallengesScreen extends ConsumerStatefulWidget {
  const ChallengesScreen({super.key});
  @override
  ConsumerState<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends ConsumerState<ChallengesScreen> {
  List<Map<String, dynamic>> items = [];

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/challenges');
    setState(() => items = (r['items'] as List).cast<Map<String, dynamic>>());
  }

  Future<void> _join(String id) async {
    final api = ref.read(apiClientProvider);
    await api.postJson('/challenges/join', { 'challengeId': id });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Joined challenge')));
  }

  @override
  void initState() { super.initState(); _load(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Challenges')),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (_, i) {
          final c = items[i];
          return Card(
            child: ListTile(
              title: Text(c['title'] ?? ''),
              subtitle: Text('${c['period']} • ${c['goal_type'] ?? ''} ${c['goal_value'] ?? ''}'),
              trailing: FilledButton(onPressed: ()=> _join(c['id'] as String), child: const Text('Join')),
            ),
          );
        },
      ),
    );
  }
}
