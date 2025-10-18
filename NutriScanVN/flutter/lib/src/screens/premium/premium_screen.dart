import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class PremiumScreen extends ConsumerStatefulWidget {
  const PremiumScreen({super.key});
  @override
  ConsumerState<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends ConsumerState<PremiumScreen> {
  Map<String, dynamic>? sub;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    final r = await api.getJson('/billing/me');
    setState(() => sub = r);
  }

  Future<void> _setTier(String tier) async {
    final api = ref.read(apiClientProvider);
    await api.putJson('/billing/me', { 'tier': tier });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Premium')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Current: ${sub?['tier'] ?? 'loading...'}'),
            const SizedBox(height: 16),
            Card(child: ListTile(title: const Text('Free'), subtitle: const Text('3 scans/day'), trailing: FilledButton(onPressed: () => _setTier('free'), child: const Text('Select')))),
            const SizedBox(height: 8),
            Card(child: ListTile(title: const Text('Premium Monthly'), subtitle: const Text('Unlimited scans, advanced features'), trailing: FilledButton(onPressed: () => _setTier('premium_monthly'), child: const Text('99k VND')))),
            const SizedBox(height: 8),
            Card(child: ListTile(title: const Text('Premium Yearly'), subtitle: const Text('Best value'), trailing: FilledButton(onPressed: () => _setTier('premium_yearly'), child: const Text('990k VND')))),
            const SizedBox(height: 16),
            const Text('Note: IAP integration pending (StoreKit/BillingClient stubs).'),
          ],
        ),
      ),
    );
  }
}
