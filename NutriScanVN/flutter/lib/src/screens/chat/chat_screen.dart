import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});
  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final List<Map<String, String>> messages = [];
  final controller = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      messages.add({'role': 'user', 'content': text});
      controller.clear();
      _loading = true;
    });
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.postJson('/ai/chat', {
        'messages': messages,
        'locale': 'vi',
      });
      setState(() {
        messages.add({'role': 'assistant', 'content': res['reply'] as String});
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Chat failed: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nutri Assistant')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final m = messages[index];
                final isUser = m['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    padding: const EdgeInsets.all(12),
                    constraints: const BoxConstraints(maxWidth: 320),
                    decoration: BoxDecoration(
                      color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceVariant,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Text(m['content'] ?? '', style: TextStyle(color: isUser ? Colors.white : Colors.black)),
                  ),
                );
              },
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(child: TextField(controller: controller, decoration: const InputDecoration(hintText: 'Nhập câu hỏi...'))),
                IconButton(onPressed: _loading ? null : _send, icon: const Icon(Icons.send)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
