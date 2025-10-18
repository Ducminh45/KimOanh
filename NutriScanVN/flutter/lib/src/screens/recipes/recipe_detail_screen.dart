import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class RecipeDetailScreen extends ConsumerStatefulWidget {
  const RecipeDetailScreen({super.key, required this.id});
  final String id;
  @override
  ConsumerState<RecipeDetailScreen> createState() => _RecipeDetailScreenState();
}

class _RecipeDetailScreenState extends ConsumerState<RecipeDetailScreen> {
  Map<String, dynamic>? recipe;
  int currentStep = 0;
  Timer? _timer;
  int remainingSec = 0;
  double servingScale = 1;

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/recipes/${widget.id}');
    setState(() => recipe = r);
  }

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  void _startTimer(int sec) {
    _timer?.cancel();
    setState(() => remainingSec = sec);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (remainingSec <= 1) { t.cancel(); setState(() => remainingSec = 0); }
      else setState(() => remainingSec -= 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    final r = recipe;
    if (r == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final steps = (r['steps'] as List).cast<Map<String, dynamic>>();
    final ings = (r['ingredients'] as List).cast<Map<String, dynamic>>();
    final baseServings = (r['servings'] as num?)?.toDouble() ?? 1;
    return Scaffold(
      appBar: AppBar(title: Text(r['title'] ?? 'Recipe')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if ((r['image_url'] as String?)?.isNotEmpty == true) Image.network(r['image_url']),
            const SizedBox(height: 8),
            Text('Calories: ${(r['calories'] as num?)?.toDouble() != null ? ((r['calories'] as num).toDouble() * servingScale).round() : 0} kcal'),
            Text('Protein: ${(((r['protein_g'] as num?)?.toDouble() ?? 0) * servingScale).round()} g, Carbs: ${(((r['carbs_g'] as num?)?.toDouble() ?? 0) * servingScale).round()} g, Fat: ${(((r['fat_g'] as num?)?.toDouble() ?? 0) * servingScale).round()} g'),
            const SizedBox(height: 8),
            Row(children:[
              const Text('Servings: '),
              Slider(value: servingScale, min: 0.5, max: 3, divisions: 5, label: (baseServings*servingScale).toStringAsFixed(1), onChanged: (v)=> setState(()=> servingScale=v)),
            ]),
            const Divider(),
            Text('Ingredients', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            for (final ing in ings) Text('- ${ing['name']}${(ing['amount'] as String?)!=null && (ing['amount'] as String).isNotEmpty ? ' (${ing['amount']})' : ''}'),
            const Divider(),
            Text('Steps', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            for (int i=0;i<steps.length;i++) _buildStep(steps[i], i),
          ],
        ),
      ),
    );
  }

  Widget _buildStep(Map<String, dynamic> st, int idx) {
    final selected = currentStep == idx;
    final hasTimer = (st['duration_sec'] as int?) != null && (st['duration_sec'] as int) > 0;
    return Card(
      child: ListTile(
        leading: Checkbox(value: idx < currentStep, onChanged: (_) => setState(()=> currentStep = idx+1)),
        title: Text('Step ${idx+1}'),
        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text(st['description'] ?? ''),
          if (hasTimer) Row(children:[
            const Icon(Icons.timer_outlined, size: 16),
            const SizedBox(width: 4),
            Text(selected && remainingSec>0 ? '${remainingSec}s' : '${st['duration_sec']}s'),
            const SizedBox(width: 8),
            if (selected && remainingSec==0) FilledButton.tonal(onPressed: ()=> _startTimer(st['duration_sec'] as int), child: const Text('Start')),
          ])
        ]),
        onTap: () => setState(()=> currentStep = idx),
      ),
    );
  }
}
