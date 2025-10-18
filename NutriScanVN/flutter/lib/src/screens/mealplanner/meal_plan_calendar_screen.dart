import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class MealPlanCalendarScreen extends ConsumerStatefulWidget {
  const MealPlanCalendarScreen({super.key});
  @override
  ConsumerState<MealPlanCalendarScreen> createState() => _MealPlanCalendarScreenState();
}

class _MealPlanCalendarScreenState extends ConsumerState<MealPlanCalendarScreen> {
  Map<String, dynamic>? plan;

  Future<void> _load() async {
    // Placeholder: re-use /ai/mealplan for demo; in real, load saved plan
    final api = ref.read(apiClientProvider);
    final r = await api.postJson('/ai/mealplan', { 'targetCalories': 2000, 'days': 7 });
    setState(() => plan = r);
  }

  Future<void> _addToShoppingList() async {
    // Demo: flatten all meals' names to shopping items
    final p = plan;
    if (p == null) return;
    final api = ref.read(apiClientProvider);
    // Create a new list
    final list = await api.postJson('/shopping/lists', { 'title': 'Meal Plan Groceries' });
    final listId = list['id'] as String;
    final items = <Map<String, String>>[];
    for (final day in (p['plan'] as List)) {
      for (final meal in ['breakfast','lunch','dinner']) {
        for (final it in (day[meal] as List)) {
          items.add({ 'name': it['name'] as String, 'quantity': '', 'category': '' });
        }
      }
    }
    await api.postJson('/shopping/lists/$listId/items/bulk', { 'items': items });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added groceries to shopping list')));
  }

  @override
  void initState() { super.initState(); _load(); }

  @override
  Widget build(BuildContext context) {
    final p = plan;
    return Scaffold(
      appBar: AppBar(title: const Text('Meal Plan Calendar')),
      body: p == null ? const Center(child: CircularProgressIndicator()) : ListView.builder(
        itemCount: (p['plan'] as List).length,
        itemBuilder: (_, i) {
          final day = (p['plan'] as List)[i] as Map<String, dynamic>;
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Day ${i+1}  •  ~${day['totalCalories']} kcal', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                for (final meal in ['breakfast','lunch','dinner']) ...[
                  Text(meal.toUpperCase(), style: Theme.of(context).textTheme.labelLarge),
                  const SizedBox(height: 4),
                  for (final it in (day[meal] as List)) Text('- ${it['name']}'),
                  const SizedBox(height: 8),
                ]
              ]),
            ),
          );
        },
      ),
      bottomNavigationBar: SafeArea(child: Padding(padding: const EdgeInsets.all(12), child: FilledButton(onPressed: _addToShoppingList, child: const Text('Add to shopping list')))),
    );
  }
}
