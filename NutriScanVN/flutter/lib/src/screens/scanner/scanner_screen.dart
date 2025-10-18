import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:camera/camera.dart';
import 'package:lottie/lottie.dart';
import 'package:rive/rive.dart';
import '../../providers.dart';
import '../../services/api_client.dart';

class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});
  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen> {
  bool _loading = false;
  List<Map<String, dynamic>> items = [];
  final _meal = ValueNotifier<String>('lunch');
  CameraController? _camera;
  Future<void>? _camInit;

  Future<void> _pickAndScan() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (file == null) return;
    final bytes = await File(file.path).readAsBytes();
    final b64 = base64Encode(bytes);
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.postJson('/ai/scan', {
        'imageBase64': b64,
        'locale': 'vi',
        'mealType': _meal.value,
        'autoLog': false,
      });
      setState(() => items = (res['items'] as List).cast<Map<String, dynamic>>());
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      if (msg.contains('SCAN_LIMIT_REACHED')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã hết 3 lần quét miễn phí hôm nay. Nâng cấp Premium.')));
        // Navigate to Premium screen
        // ignore: use_build_context_synchronously
        Navigator.of(context).pushNamed('/premium');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openCameraAndScan() async {
    final cams = await availableCameras();
    final cam = cams.first;
    _camera = CameraController(cam, ResolutionPreset.medium, enableAudio: false);
    _camInit = _camera!.initialize();
    await _camInit;
    final file = await _camera!.takePicture();
    final bytes = await File(file.path).readAsBytes();
    final b64 = base64Encode(bytes);
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.postJson('/ai/scan', {
        'imageBase64': b64,
        'locale': 'vi',
        'mealType': _meal.value,
        'autoLog': false,
      });
      setState(() => items = (res['items'] as List).cast<Map<String, dynamic>>());
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      if (msg.contains('SCAN_LIMIT_REACHED')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã hết 3 lần quét miễn phí hôm nay. Nâng cấp Premium.')));
        // ignore: use_build_context_synchronously
        Navigator.of(context).pushNamed('/premium');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scan failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
      await _camera?.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Food Scanner')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Text('Meal: '),
              DropdownButton<String>(value: _meal.value, onChanged: (v) { if (v!=null){ setState(()=> _meal.value=v);} }, items: const [
                DropdownMenuItem(value: 'breakfast', child: Text('Breakfast')),
                DropdownMenuItem(value: 'lunch', child: Text('Lunch')),
                DropdownMenuItem(value: 'dinner', child: Text('Dinner')),
                DropdownMenuItem(value: 'snack', child: Text('Snack')),
              ]),
              const Spacer(),
              FilledButton.icon(onPressed: _loading ? null : _pickAndScan, icon: const Icon(Icons.image_outlined), label: const Text('Gallery')),
              const SizedBox(width: 8),
              FilledButton.icon(onPressed: _loading ? null : _openCameraAndScan, icon: const Icon(Icons.camera_alt_outlined), label: const Text('Camera')),
            ]),
            const SizedBox(height: 12),
            if (_loading)
              Center(
                child: Lottie.asset('assets/lottie/scanning.json', width: 160, repeat: true),
              )
            else
              SizedBox(
                height: 80,
                child: const RiveAnimation.asset('assets/rive/header.riv', animations: ['idle']),
              ),
            const SizedBox(height: 12),
            Expanded(
              child: items.isEmpty
                ? const Text('No detections yet.')
                : ListView.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(),
                    itemBuilder: (context, index) {
                      final it = items[index];
                      final match = it['match'] as Map<String, dynamic>?;
                      final nutrition = it['nutrition'] as Map<String, dynamic>?;
                      return ListTile(
                        title: Text(it['name']),
                        subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Confidence: ${(it['confidence'] as num?)?.toStringAsFixed(2) ?? '-'}'),
                          if (match != null) Text('Match: ${match['name']} (${match['servingSizeG']}g)'),
                          if (nutrition != null) Text('≈ ${nutrition['calories']} kcal, P ${nutrition['proteinG']}g, C ${nutrition['carbsG']}g, F ${nutrition['fatG']}g, Fi ${nutrition['fiberG']}g'),
                        ]),
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
