import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';
import 'package:fl_chart/fl_chart.dart';

class WeightScreen extends ConsumerStatefulWidget {
  const WeightScreen({super.key});
  @override
  ConsumerState<WeightScreen> createState() => _WeightScreenState();
}

class _WeightScreenState extends ConsumerState<WeightScreen> {
  List<Map<String, dynamic>> items = [];
  final ctrl = TextEditingController();

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/progress/weight');
    setState(() => items = (r['items'] as List).cast<Map<String, dynamic>>());
  }

  Future<void> _add() async {
    final v = double.tryParse(ctrl.text);
    if (v == null) return;
    final api = ref.read(apiClientProvider);
    await api.postJson('/progress/weight', { 'weightKg': v });
    ctrl.clear();
    await _load();
  }

  Future<void> _delete(String id) async {
    final api = ref.read(apiClientProvider);
    await api._request('DELETE', '/progress/weight/$id');
    await _load();
  }

  @override
  void initState() { super.initState(); _load(); }

  @override
  Widget build(BuildContext context) {
    final reversed = items.reversed.toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Weight')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children:[
              Expanded(child: TextField(controller: ctrl, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Weight (kg)'))),
              const SizedBox(width: 12),
              FilledButton(onPressed: _add, child: const Text('Add')),
            ]),
            const SizedBox(height: 12),
            SizedBox(
              height: 220,
              child: LineChart(LineChartData(
                titlesData: FlTitlesData(show: false),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    isCurved: true,
                    color: Theme.of(context).colorScheme.primary,
                    barWidth: 3,
                    dotData: const FlDotData(show: false),
                    spots: [
                      for (int i=0;i<reversed.length;i++) FlSpot(i.toDouble(), (reversed[i]['weight_kg'] as num).toDouble())
                    ],
                  )
                ]
              )),
            ),
            const Divider(),
            Expanded(
              child: ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (_, i) {
                  final it = items[i];
                  return ListTile(
                    title: Text('${it['weight_kg']} kg'),
                    subtitle: Text(it['logged_at'] as String? ?? ''),
                    trailing: IconButton(icon: const Icon(Icons.delete_outline), onPressed: ()=> _delete(it['id'] as String)),
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
