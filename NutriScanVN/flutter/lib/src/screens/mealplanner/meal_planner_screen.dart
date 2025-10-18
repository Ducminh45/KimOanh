import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class MealPlannerScreen extends ConsumerStatefulWidget {
  const MealPlannerScreen({super.key});
  @override
  ConsumerState<MealPlannerScreen> createState() => _MealPlannerScreenState();
}

class _MealPlannerScreenState extends ConsumerState<MealPlannerScreen> {
  Map<String, dynamic>? plan;
  final targetCtrl = TextEditingController(text: '2000');

  Future<void> _generate() async {
    final api = ref.read(apiClientProvider);
    final r = await api.postJson('/ai/mealplan', { 'targetCalories': int.parse(targetCtrl.text), 'days': 7 });
    setState(() => plan = r);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meal Planner')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children:[
              Expanded(child: TextField(controller: targetCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Target kcal/day'))),
              const SizedBox(width: 8),
              FilledButton(onPressed: _generate, child: const Text('Generate')),
            ]),
            const SizedBox(height: 12),
            if (plan == null) const Text('No plan yet.') else Expanded(
              child: ListView.builder(
                itemCount: (plan!['plan'] as List).length,
                itemBuilder: (_, i) {
                  final day = (plan!['plan'] as List)[i] as Map<String, dynamic>;
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Day ${i+1} • ~${day['totalCalories']} kcal', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          for (final meal in ['breakfast','lunch','dinner']) ...[
                            Text(meal.toUpperCase()),
                            const SizedBox(height: 6),
                            for (final it in (day[meal] as List)) Text('- ${it['name']} (${it['calories']} kcal)'),
                            const SizedBox(height: 8),
                          ]
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
