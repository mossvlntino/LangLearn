import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const LanglearnApp());
}

class LanglearnApp extends StatelessWidget {
  const LanglearnApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Langlearn',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF007AFF), // Apple Blue
          primary: const Color(0xFF007AFF),
          secondary: const Color(0xFF5856D6), // Apple Purple
          surface: const Color(0xFFF2F2F7), // Apple System Gray 6
          background: const Color(0xFFF2F2F7),
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.nunitoTextTheme(),
        scaffoldBackgroundColor: const Color(0xFFF2F2F7),
      ),
      home: const HomeScreen(),
    );
  }
}
