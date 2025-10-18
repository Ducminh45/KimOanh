import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _email = TextEditingController();
  final _fullName = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _email.dispose();
    _fullName.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    setState(() => _loading = true);
    try {
      await ref.read(authServiceProvider).register(email: _email.text.trim(), password: _password.text, fullName: _fullName.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Registration successful. Please login.')));
      context.go('/login');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Register failed: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(controller: _fullName, decoration: const InputDecoration(labelText: 'Full name')),
              const SizedBox(height: 12),
              TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
              const SizedBox(height: 12),
              TextField(controller: _password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
              const SizedBox(height: 24),
              FilledButton(onPressed: _loading ? null : _register, child: Text(_loading ? 'Loading...' : 'Create account')),
            ],
          ),
        ),
      ),
    );
  }
}
