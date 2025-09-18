import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'feature/dashboard/dashboard_page.dart';

void main() {
  runApp(const ProviderScope(child: SerialDashboardApp()));
}

class SerialDashboardApp extends StatelessWidget {
  const SerialDashboardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Serial Live Metrics',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: AppRouter.router,
    );
  }
}

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/serial-dashboard',
    routerNeglect: true,
    routes: [
      GoRoute(
        path: '/serial-dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(
        path: '/',
        redirect: (context, state) => '/serial-dashboard',
      ),
    ],
  );
}

class AppTheme {
  static const Color _primaryBlue = Color(0xFF2196F3);
  static const Color _primaryRed = Color(0xFFF44336);
  static const Color _primaryGreen = Color(0xFF4CAF50);
  static const Color _primaryOrange = Color(0xFFFF9800);
  static const Color _primaryPurple = Color(0xFF9C27B0);

  static final ThemeData light = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _primaryBlue,
      brightness: Brightness.light,
    ),
        cardTheme: const CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );

  static final ThemeData dark = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _primaryBlue,
      brightness: Brightness.dark,
    ),
      cardTheme: const CardThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );

  static const Map<String, Color> channelColors = {
    'Battery Voltage': _primaryBlue,
    'Battery Current': _primaryRed,
    'Fuel Cell Voltage': _primaryGreen,
    'Battery Voltage (2nd)': _primaryOrange,
    'Purge Interval': _primaryPurple,
  };

  static Color getChannelColor(String channelName) {
    return channelColors[channelName] ?? _primaryBlue;
  }
}
