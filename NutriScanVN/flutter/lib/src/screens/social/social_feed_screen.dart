import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers.dart';
import '../../services/api_client.dart';
import 'package:image_picker/image_picker.dart';

class SocialFeedScreen extends ConsumerStatefulWidget {
  const SocialFeedScreen({super.key});
  @override
  ConsumerState<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends ConsumerState<SocialFeedScreen> {
  List<Map<String, dynamic>> items = [];
  final contentCtrl = TextEditingController();
  String? imageUrl;
  bool posting = false;

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/social/feed');
    setState(() => items = (r['items'] as List).cast<Map<String, dynamic>>());
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    final api = ref.read(apiClientProvider);
    final res = await api.postJson('/upload/base64', { 'imageBase64': base64Encode(bytes), 'extension': 'jpg' });
    setState(() => imageUrl = res['url'] as String);
  }

  Future<void> _create() async {
    final api = ref.read(apiClientProvider);
    setState(() => posting = true);
    await api.postJson('/social/posts', { 'content': contentCtrl.text, 'imageUrl': imageUrl });
    contentCtrl.clear();
    imageUrl = null;
    await _load();
    setState(() => posting = false);
  }

  Future<void> _like(String postId) async {
    final api = ref.read(apiClientProvider);
    await api.postJson('/social/posts/$postId/like', {});
    await _load();
  }

  Future<void> _unlike(String postId) async {
    final api = ref.read(apiClientProvider);
    await api._request('DELETE', '/social/posts/$postId/like');
    await _load();
  }

  Future<void> _comment(String postId) async {
    final text = await showDialog<String>(context: context, builder: (_) {
      final c = TextEditingController();
      return AlertDialog(
        title: const Text('Add comment'),
        content: TextField(controller: c),
        actions: [
          TextButton(onPressed: ()=> Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: ()=> Navigator.pop(context, c.text), child: const Text('Send')),
        ],
      );
    });
    if (text == null || text.trim().isEmpty) return;
    final api = ref.read(apiClientProvider);
    await api.postJson('/social/posts/$postId/comments', { 'content': text.trim() });
    await _load();
  }

  @override
  void initState() { super.initState(); _load(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              Expanded(child: TextField(controller: contentCtrl, decoration: const InputDecoration(hintText: 'Share something...'))),
              IconButton(onPressed: _pickImage, icon: const Icon(Icons.image_outlined)),
              const SizedBox(width: 8),
              FilledButton(onPressed: posting ? null : _create, child: Text(posting ? 'Posting...' : 'Post')),
            ]),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final p = items[i];
                return ListTile(
                  title: Text(p['full_name'] ?? 'User'),
                  subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
                    if ((p['image_url'] as String?)?.isNotEmpty == true) Image.network(p['image_url']),
                    if ((p['content'] as String?)?.isNotEmpty == true) Text(p['content'] ?? ''),
                  ]),
                  trailing: Row(mainAxisSize: MainAxisSize.min, children:[
                    IconButton(icon: const Icon(Icons.thumb_up_alt_outlined), onPressed: ()=> _like(p['id'] as String)),
                    IconButton(icon: const Icon(Icons.thumb_down_alt_outlined), onPressed: ()=> _unlike(p['id'] as String)),
                    IconButton(icon: const Icon(Icons.mode_comment_outlined), onPressed: ()=> _comment(p['id'] as String)),
                  ]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
