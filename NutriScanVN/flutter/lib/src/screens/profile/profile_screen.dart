import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../providers.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final fullName = TextEditingController();
  String gender = 'male';
  String birthDate = '1995-01-01';
  final heightCm = TextEditingController();
  final weightKg = TextEditingController();
  String goal = 'maintain';
  String activity = 'light';
  final dietary = TextEditingController();
  final allergies = TextEditingController();
  String language = 'vi';
  String unitSystem = 'metric';
  bool notifReminders = true;
  bool notifWater = true;
  bool notifExercise = true;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    try {
      final me = await api.getJson('/user/me');
      fullName.text = (me['full_name'] as String?) ?? '';
      final m = await api.getJson('/user/metrics');
      if (m != null) {
        gender = (m['gender'] as String?) ?? 'male';
        birthDate = (m['birth_date'] as String?)?.substring(0,10) ?? '1995-01-01';
        heightCm.text = (m['height_cm']?.toString() ?? '170');
        weightKg.text = (m['weight_kg']?.toString() ?? '65');
        goal = (m['goal'] as String?) ?? 'maintain';
        activity = (m['activity_level'] as String?) ?? 'light';
        dietary.text = ((m['dietary_preferences'] as List?)?.join(', ') ?? '');
        allergies.text = ((m['allergies'] as List?)?.join(', ') ?? '');
        language = (m['language'] as String?) ?? 'vi';
        unitSystem = (m['unit_system'] as String?) ?? 'metric';
        final n = (m['notifications'] as Map?) ?? {};
        notifReminders = (n['reminders'] as bool?) ?? true;
        notifWater = (n['water'] as bool?) ?? true;
        notifExercise = (n['exercise'] as bool?) ?? true;
      }
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> _save() async {
    final api = ref.read(apiClientProvider);
    await api.putJson('/user/me', { 'fullName': fullName.text.trim() });
    await api.putJson('/user/metrics', {
      'gender': gender,
      'birthDate': birthDate,
      'heightCm': double.tryParse(heightCm.text) ?? 170,
      'weightKg': double.tryParse(weightKg.text) ?? 65,
      'goal': goal,
      'activityLevel': activity,
      'dietaryPreferences': dietary.text.isEmpty ? [] : dietary.text.split(',').map((e) => e.trim()).toList(),
      'allergies': allergies.text.isEmpty ? [] : allergies.text.split(',').map((e) => e.trim()).toList(),
      'language': language,
      'unitSystem': unitSystem,
      'notifications': {
        'reminders': notifReminders,
        'water': notifWater,
        'exercise': notifExercise
      }
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')), 
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(controller: fullName, decoration: const InputDecoration(labelText: 'Full name')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(value: gender, decoration: const InputDecoration(labelText: 'Gender'), items: const [
                    DropdownMenuItem(value: 'male', child: Text('Male')),
                    DropdownMenuItem(value: 'female', child: Text('Female')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ], onChanged: (v) => setState(()=> gender = v ?? 'male')),
                  const SizedBox(height: 12),
                  TextFormField(initialValue: birthDate, decoration: const InputDecoration(labelText: 'Birth date (YYYY-MM-DD)'), onChanged: (v)=> birthDate = v),
                  const SizedBox(height: 12),
                  TextField(controller: heightCm, decoration: const InputDecoration(labelText: 'Height (cm)'), keyboardType: TextInputType.number),
                  const SizedBox(height: 12),
                  TextField(controller: weightKg, decoration: const InputDecoration(labelText: 'Weight (kg)'), keyboardType: TextInputType.number),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(value: goal, decoration: const InputDecoration(labelText: 'Goal'), items: const [
                    DropdownMenuItem(value: 'lose', child: Text('Lose')),
                    DropdownMenuItem(value: 'maintain', child: Text('Maintain')),
                    DropdownMenuItem(value: 'gain', child: Text('Gain')),
                  ], onChanged: (v) => setState(()=> goal = v ?? 'maintain')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(value: activity, decoration: const InputDecoration(labelText: 'Activity level'), items: const [
                    DropdownMenuItem(value: 'sedentary', child: Text('Sedentary')),
                    DropdownMenuItem(value: 'light', child: Text('Light')),
                    DropdownMenuItem(value: 'moderate', child: Text('Moderate')),
                    DropdownMenuItem(value: 'active', child: Text('Active')),
                    DropdownMenuItem(value: 'very_active', child: Text('Very active')),
                  ], onChanged: (v) => setState(()=> activity = v ?? 'light')),
                  const SizedBox(height: 12),
                  TextField(controller: dietary, decoration: const InputDecoration(labelText: 'Dietary preferences (comma-separated)')),
                  const SizedBox(height: 12),
                  TextField(controller: allergies, decoration: const InputDecoration(labelText: 'Allergies (comma-separated)')),
                  const Divider(height: 32),
                  DropdownButtonFormField<String>(value: language, decoration: const InputDecoration(labelText: 'Language'), items: const [
                    DropdownMenuItem(value: 'vi', child: Text('Vietnamese')),
                    DropdownMenuItem(value: 'en', child: Text('English')),
                  ], onChanged: (v) => setState(()=> language = v ?? 'vi')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(value: unitSystem, decoration: const InputDecoration(labelText: 'Unit system'), items: const [
                    DropdownMenuItem(value: 'metric', child: Text('Metric')),
                    DropdownMenuItem(value: 'imperial', child: Text('Imperial')),
                  ], onChanged: (v) => setState(()=> unitSystem = v ?? 'metric')),
                  const SizedBox(height: 12),
                  SwitchListTile(value: notifReminders, onChanged: (v)=> setState(()=> notifReminders=v), title: const Text('Reminders')),
                  SwitchListTile(value: notifWater, onChanged: (v)=> setState(()=> notifWater=v), title: const Text('Water notifications')),
                  SwitchListTile(value: notifExercise, onChanged: (v)=> setState(()=> notifExercise=v), title: const Text('Exercise notifications')),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _save, child: const Text('Save')),
                ],
              ),
            ),
    );
  }
}
