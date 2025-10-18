import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class WaterScreen extends ConsumerStatefulWidget {
  const WaterScreen({super.key});
  @override
  ConsumerState<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends ConsumerState<WaterScreen> {
  List<Map<String, dynamic>> items = [];
  int total = 0;
  final customCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final res = await api.getJson('/progress/water');
    setState(() { items = (res['items'] as List).cast<Map<String, dynamic>>(); total = res['totalMl'] as int; });
  }

  Future<void> _add(int amount) async {
    final api = ref.read(apiClientProvider);
    await api.postJson('/progress/water', { 'amountMl': amount });
    await _load();
  }

  Future<void> _undo(String id) async {
    final api = ref.read(apiClientProvider);
    await api._request('DELETE', '/progress/water/$id');
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Water')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Today: $total ml', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Wrap(spacing: 12, children: [
              FilledButton(onPressed: () => _add(250), child: const Text('+250ml')),
              FilledButton(onPressed: () => _add(500), child: const Text('+500ml')),
              FilledButton(onPressed: () => _add(1000), child: const Text('+1L')),
            ]),
            const SizedBox(height: 12),
            Row(children:[
              Expanded(child: TextField(controller: customCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Custom ml'))),
              const SizedBox(width: 8),
              FilledButton(onPressed: () { final v = int.tryParse(customCtrl.text) ?? 0; if (v>0) _add(v); }, child: const Text('Add'))
            ]),
            const Divider(),
            Expanded(
              child: ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (_, i) {
                  final it = items[i];
                  return ListTile(
                    title: Text('+${it['amount_ml']} ml'),
                    subtitle: Text(it['logged_at'] as String? ?? ''),
                    trailing: IconButton(icon: const Icon(Icons.undo), onPressed: () => _undo(it['id'] as String)),
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
