import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers.dart';
import '../../services/api_client.dart';
import 'package:fl_chart/fl_chart.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  Map<String, dynamic>? summary;
  List<Map<String, dynamic>> history = [];
  String range = '7';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.getJson('/progress/summary');
      final hist = await api.getJson('/progress/history', query: { 'days': range });
      setState(() { summary = res; history = (hist['items'] as List).cast<Map<String, dynamic>>(); });
    } catch (e) {
      // ignore for now
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard'), actions: [
        IconButton(onPressed: () => context.go('/chat'), icon: const Icon(Icons.chat_bubble_outline)),
        IconButton(onPressed: () => context.go('/settings'), icon: const Icon(Icons.settings)),
      ]),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(onPressed: () => context.go('/water'), child: const Icon(Icons.local_drink)),
          const SizedBox(height: 8),
          FloatingActionButton.small(onPressed: () => context.go('/exercise'), child: const Icon(Icons.fitness_center)),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            onPressed: () => context.go('/scanner'),
            icon: const Icon(Icons.camera_alt_outlined),
            label: const Text('Scan'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: summary == null
            ? const Text('Loading summary...')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Calories: ${summary!['calories']} / ${summary!['goalCalories'] ?? '-'} kcal'),
                  Text('Water: ${summary!['waterMl']} ml'),
                  Text('Exercise: ${summary!['caloriesBurned']} kcal'),
                  Text('Macros - P: ${summary!['macros']['proteinG']}g, C: ${summary!['macros']['carbsG']}g, F: ${summary!['macros']['fatG']}g'),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 120,
                    child: BarChart(
                      BarChartData(
                        titlesData: FlTitlesData(show: false),
                        gridData: const FlGridData(show: false),
                        borderData: FlBorderData(show: false),
                        barGroups: [
                          BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: (summary!['macros']['proteinG'] as num).toDouble(), color: Colors.red)]),
                          BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: (summary!['macros']['carbsG'] as num).toDouble(), color: Colors.blue)]),
                          BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: (summary!['macros']['fatG'] as num).toDouble(), color: Colors.amber)]),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(children:[
                    const Text('Range: '),
                    DropdownButton<String>(value: range, onChanged: (v){ if(v!=null){ setState(()=>range=v); _load(); }}, items: const [
                      DropdownMenuItem(value: '7', child: Text('7 days')),
                      DropdownMenuItem(value: '30', child: Text('30 days')),
                      DropdownMenuItem(value: '90', child: Text('90 days')),
                    ])
                  ]),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 220,
                    child: LineChart(
                      LineChartData(
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
                              for (int i=0;i<history.length;i++) FlSpot(i.toDouble(), (history[i]['calories'] as num).toDouble())
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  FilledButton(onPressed: () => context.go('/login'), child: const Text('Logout')),
                ],
              ),
      ),
    );
  }
}
