import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class FixResultsScreen extends ConsumerStatefulWidget {
  const FixResultsScreen({super.key, required this.items, required this.meal});
  final List<Map<String, dynamic>> items;
  final String meal;
  @override
  ConsumerState<FixResultsScreen> createState() => _FixResultsScreenState();
}

class _FixResultsScreenState extends ConsumerState<FixResultsScreen> {
  late List<Map<String, dynamic>> edits;
  String meal = 'lunch';

  @override
  void initState() {
    super.initState();
    edits = widget.items.map((e) => {...e}).toList();
    meal = widget.meal;
  }

  Future<void> _save() async {
    final api = ref.read(apiClientProvider);
    for (final it in edits) {
      final match = it['match'] as Map<String, dynamic>?;
      if (match == null) continue;
      await api.postJson('/diary', {
        'foodId': match['foodId'],
        'mealType': meal,
        'quantity': 1,
        'servingSizeG': it['detectedServingGrams'] ?? match['servingSizeG'] ?? 100,
        'imageUrl': null
      });
    }
    if (!mounted) return;
    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fix Results')),
      body: ListView.builder(
        itemCount: edits.length,
        itemBuilder: (_, i) {
          final it = edits[i];
          final match = it['match'] as Map<String, dynamic>?;
          final grams = TextEditingController(text: '${it['detectedServingGrams'] ?? match?['servingSizeG'] ?? 100}');
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(match?['name'] ?? it['name']),
                  const SizedBox(height: 8),
                  Row(children:[
                    const Text('Serving (g): '),
                    SizedBox(width: 80, child: TextField(controller: grams, keyboardType: TextInputType.number, onChanged: (v){ it['detectedServingGrams'] = int.tryParse(v) ?? it['detectedServingGrams']; })),
                    const Spacer(),
                    DropdownButton<String>(value: meal, onChanged: (v){ if(v!=null) setState(()=> meal=v); }, items: const [
                      DropdownMenuItem(value: 'breakfast', child: Text('Breakfast')),
                      DropdownMenuItem(value: 'lunch', child: Text('Lunch')),
                      DropdownMenuItem(value: 'dinner', child: Text('Dinner')),
                      DropdownMenuItem(value: 'snack', child: Text('Snack')),
                    ])
                  ])
                ],
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(12), child: FilledButton(onPressed: _save, child: const Text('Save to log')))),
    );
  }
}
