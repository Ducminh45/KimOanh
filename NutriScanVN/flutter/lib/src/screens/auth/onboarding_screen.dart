import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int step = 1;
  final fullName = TextEditingController();
  String gender = 'male';
  String birthDate = '1995-01-01';
  final heightCm = TextEditingController(text: '170');
  final weightKg = TextEditingController(text: '65');
  String goal = 'maintain';
  String activityLevel = 'light';
  final dietaryPreferences = TextEditingController();
  final allergies = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    fullName.dispose();
    heightCm.dispose();
    weightKg.dispose();
    dietaryPreferences.dispose();
    allergies.dispose();
    super.dispose();
  }

  Future<void> _next() async {
    if (step < 4) {
      setState(() => step += 1);
      return;
    }
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.putJson('/user/me', { 'fullName': fullName.text.trim() });
      await api.putJson('/user/metrics', {
        'gender': gender,
        'birthDate': birthDate,
        'heightCm': double.tryParse(heightCm.text) ?? 170,
        'weightKg': double.tryParse(weightKg.text) ?? 65,
        'goal': goal,
        'activityLevel': activityLevel,
        'dietaryPreferences': dietaryPreferences.text.isEmpty ? [] : dietaryPreferences.text.split(',').map((e) => e.trim()).toList(),
        'allergies': allergies.text.isEmpty ? [] : allergies.text.split(',').map((e) => e.trim()).toList(),
      });
      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Onboarding failed: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Onboarding ($step/4)')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (step == 1) ...[
              TextField(controller: fullName, decoration: const InputDecoration(labelText: 'Full name')),
              const SizedBox(height: 12),
              TextField(onChanged: (v) => gender = v, decoration: const InputDecoration(labelText: 'Gender (male/female/other)')),
              const SizedBox(height: 12),
              TextField(onChanged: (v) => birthDate = v, decoration: const InputDecoration(labelText: 'Birth date (YYYY-MM-DD)')),
            ] else if (step == 2) ...[
              TextField(controller: heightCm, decoration: const InputDecoration(labelText: 'Height (cm)'), keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              TextField(controller: weightKg, decoration: const InputDecoration(labelText: 'Weight (kg)'), keyboardType: TextInputType.number),
            ] else if (step == 3) ...[
              TextField(onChanged: (v) => goal = v, decoration: const InputDecoration(labelText: 'Goal (lose/maintain/gain)')),
              const SizedBox(height: 12),
              TextField(onChanged: (v) => activityLevel = v, decoration: const InputDecoration(labelText: 'Activity (sedentary/light/moderate/active/very_active)')),
            ] else ...[
              TextField(controller: dietaryPreferences, decoration: const InputDecoration(labelText: 'Dietary preferences (comma-separated)')),
              const SizedBox(height: 12),
              TextField(controller: allergies, decoration: const InputDecoration(labelText: 'Allergies (comma-separated)')),
            ],
            const Spacer(),
            FilledButton(onPressed: _loading ? null : _next, child: Text(step < 4 ? 'Next' : 'Finish')),
          ],
        ),
      ),
    );
  }
}
