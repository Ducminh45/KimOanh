import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class RecipesListScreen extends ConsumerStatefulWidget {
  const RecipesListScreen({super.key});
  @override
  ConsumerState<RecipesListScreen> createState() => _RecipesListScreenState();
}

class _RecipesListScreenState extends ConsumerState<RecipesListScreen> {
  List<Map<String, dynamic>> items = [];

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/recipes');
    setState(() => items = (r['items'] as List).cast<Map<String, dynamic>>());
  }

  @override
  void initState() { super.initState(); _load(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recipes')),
      body: ListView.separated(
        itemCount: items.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (_, i) {
          final it = items[i];
          return ListTile(
            leading: (it['image_url'] as String?)?.isNotEmpty == true ? Image.network(it['image_url'], width: 56, height: 56, fit: BoxFit.cover) : const SizedBox(width: 56, height: 56),
            title: Text(it['title'] ?? ''),
            subtitle: Text('${it['calories'] ?? 0} kcal • Servings: ${it['servings'] ?? 1}'),
            onTap: () => Navigator.pushNamed(context, '/recipes/${it['id']}'),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(onPressed: (){}, child: const Icon(Icons.add)),
    );
  }
}
