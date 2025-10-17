import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'src/screens/auth/login_screen.dart';
import 'src/screens/auth/register_screen.dart';
import 'src/screens/auth/onboarding_screen.dart';
import 'src/screens/home/home_screen.dart';
import 'src/screens/scanner/scanner_screen.dart';
import 'src/screens/chat/chat_screen.dart';

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
  ],
);

class NutriScanVNApp extends StatelessWidget {
  const NutriScanVNApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NutriScanVN',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3E9B8A)),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
