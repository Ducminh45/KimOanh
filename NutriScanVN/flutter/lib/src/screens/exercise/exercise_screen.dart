import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class ExerciseScreen extends ConsumerStatefulWidget {
  const ExerciseScreen({super.key});
  @override
  ConsumerState<ExerciseScreen> createState() => _ExerciseScreenState();
}

class _ExerciseScreenState extends ConsumerState<ExerciseScreen> {
  List<Map<String, dynamic>> items = [];
  int total = 0;
  String type = 'Running';
  String intensity = 'medium';
  final durationCtrl = TextEditingController(text: '30');

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final res = await api.getJson('/progress/exercise');
    setState(() { items = (res['items'] as List).cast<Map<String, dynamic>>(); total = (res['caloriesBurned'] as num).toInt(); });
  }

  Future<void> _add() async {
    final api = ref.read(apiClientProvider);
    await api.postJson('/progress/exercise', { 'type': type, 'durationMin': int.parse(durationCtrl.text), 'intensity': intensity });
    await _load();
  }

  Future<void> _delete(String id) async {
    final api = ref.read(apiClientProvider);
    await api._request('DELETE', '/progress/exercise/$id');
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Exercise')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Today burned: $total kcal', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Row(children:[
              Expanded(child: TextField(controller: durationCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Duration (min)'))),
              const SizedBox(width: 12),
              DropdownButton<String>(value: intensity, onChanged: (v){ if(v!=null) setState(()=> intensity=v); }, items: const [
                DropdownMenuItem(value: 'low', child: Text('Low')),
                DropdownMenuItem(value: 'medium', child: Text('Medium')),
                DropdownMenuItem(value: 'high', child: Text('High')),
              ]),
            ]),
            const SizedBox(height: 12),
            Row(children:[
              const Text('Type: '),
              DropdownButton<String>(value: type, onChanged: (v){ if(v!=null) setState(()=> type=v); }, items: const [
                DropdownMenuItem(value: 'Running', child: Text('Running')),
                DropdownMenuItem(value: 'Cycling', child: Text('Cycling')),
                DropdownMenuItem(value: 'Swimming', child: Text('Swimming')),
                DropdownMenuItem(value: 'Yoga', child: Text('Yoga')),
                DropdownMenuItem(value: 'Strength', child: Text('Strength')),
                DropdownMenuItem(value: 'Walking', child: Text('Walking')),
              ]),
              const Spacer(),
              FilledButton(onPressed: _add, child: const Text('Add')),
            ]),
            const Divider(),
            Expanded(
              child: ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (_, i) {
                  final it = items[i];
                  return ListTile(
                    title: Text('${it['type']} • ${it['duration_min']} min'),
                    subtitle: Text('Intensity: ${it['intensity']}  •  ${it['calories_burned']} kcal'),
                    trailing: IconButton(icon: const Icon(Icons.delete_outline), onPressed: () => _delete(it['id'] as String)),
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
