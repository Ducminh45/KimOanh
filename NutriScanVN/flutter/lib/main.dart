import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'src/screens/auth/login_screen.dart';
import 'src/screens/auth/register_screen.dart';
import 'src/screens/auth/onboarding_screen.dart';
import 'src/screens/home/home_screen.dart';
import 'src/screens/scanner/scanner_screen.dart';
import 'src/screens/chat/chat_screen.dart';
import 'src/theme/app_theme.dart';
import 'src/screens/settings/settings_screen.dart';
import 'src/screens/water/water_screen.dart';
import 'src/screens/exercise/exercise_screen.dart';
import 'src/screens/premium/premium_screen.dart';
import 'src/screens/mealplanner/meal_planner_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: NutriScanVNApp()));
}

final _router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/scanner', builder: (_, __) => const ScannerScreen()),
    GoRoute(path: '/chat', builder: (_, __) => const ChatScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    GoRoute(path: '/water', builder: (_, __) => const WaterScreen()),
    GoRoute(path: '/exercise', builder: (_, __) => const ExerciseScreen()),
    GoRoute(path: '/premium', builder: (_, __) => const PremiumScreen()),
    GoRoute(path: '/mealplanner', builder: (_, __) => const MealPlannerScreen()),
  ],
);

class NutriScanVNApp extends ConsumerWidget {
  const NutriScanVNApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeProvider);
    return MaterialApp.router(
      title: 'NutriScanVN',
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: mode,
      routerConfig: _router,
    );
  }
}
