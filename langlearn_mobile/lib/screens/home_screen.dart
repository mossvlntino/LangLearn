import 'package:flutter/material.dart';
import 'language_hub_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      body: Stack(
        children: [
          // Background Decorations
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: const Color(0xFF007AFF).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                color: const Color(0xFF5856D6).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          // Main Content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 60),
                  // Centered Title
                  const Text(
                    'Langlearn',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.w800,
                      color: Colors.black,
                      letterSpacing: -1.0,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Who will you chat with today?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 50),

                  // Grid Layout for Cards
                  Expanded(
                    child: GridView.count(
                      crossAxisCount: 2,
                      mainAxisSpacing: 20,
                      crossAxisSpacing: 20,
                      childAspectRatio: 0.85,
                      children: [
                        _buildLanguageCard(
                          context,
                          'German',
                          '🇩🇪',
                          const Color(0xFFFFCC00),
                          () => _navigateToLanguage(context, 'de'),
                        ),
                        _buildLanguageCard(
                          context,
                          'Japanese',
                          '🇯🇵',
                          const Color(0xFFFF3B30),
                          () => _navigateToLanguage(context, 'jp'),
                        ),
                        _buildLanguageCard(
                          context,
                          'Chinese',
                          '🇨🇳',
                          const Color(0xFFFF9500),
                          () => _navigateToLanguage(context, 'cn'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _navigateToLanguage(BuildContext context, String langCode) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LanguageHubScreen(langCode: langCode),
      ),
    );
  }

  Widget _buildLanguageCard(
    BuildContext context,
    String label,
    String emoji,
    Color accentColor,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Text(
                emoji,
                style: const TextStyle(fontSize: 40),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              label,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Start Chat',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: accentColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
