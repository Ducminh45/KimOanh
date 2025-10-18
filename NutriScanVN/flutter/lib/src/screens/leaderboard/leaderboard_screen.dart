import 'package:flutter/material.dart';

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Stub data for now
    final items = [
      {'rank': 1, 'name': 'Alice', 'score': 1200},
      {'rank': 2, 'name': 'Bob', 'score': 1100},
      {'rank': 3, 'name': 'Charlie', 'score': 900},
      {'rank': 4, 'name': 'You', 'score': 850},
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Leaderboard')),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (_, i) {
          final it = items[i];
          final icon = it['rank'] == 1 ? '🥇' : it['rank'] == 2 ? '🥈' : it['rank'] == 3 ? '🥉' : ' ';
          return ListTile(
            leading: Text('${it['rank']}. $icon', style: const TextStyle(fontSize: 18)),
            title: Text(it['name'].toString()),
            trailing: Text('${it['score']}'),
          );
        },
      ),
    );
  }
}
