import 'package:flutter/material.dart';
import 'chat_screen.dart';
import 'notebook_screen.dart';
import 'translator_screen.dart';

class LanguageHubScreen extends StatefulWidget {
  final String langCode; // 'de', 'jp', 'cn'

  const LanguageHubScreen({super.key, required this.langCode});

  @override
  State<LanguageHubScreen> createState() => _LanguageHubScreenState();
}

class _LanguageHubScreenState extends State<LanguageHubScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      ChatScreen(langCode: widget.langCode),
      NotebookScreen(langCode: widget.langCode),
      TranslatorScreen(langCode: widget.langCode), // We'll rename "Words" to "Translator" or keep as "Words"?
      // Wait, the original app had "Chat", "Notebook" (Add Word), and "Words" (List).
      // The "Translator" was a panel in the middle column.
      // Let's stick to the original mobile nav: Chat, Notebook, Words.
      // But where does the Translator go? In the original mobile view, it was in the middle column with Notebook.
      // Let's put Translator in the Notebook tab or a separate one?
      // The user wants "Chat | Notebook | Words".
      // Let's combine Notebook (Add) and Translator in the middle tab, or make a 4th tab?
      // The original mobile nav had 3 tabs: Chat, Notebook, Words.
      // The "Notebook" tab showed the "Add Word" panel AND the "Translator" panel.
      // So I should probably do that here too.
    ];
  }

  String get _langName {
    switch (widget.langCode) {
      case 'de': return 'German';
      case 'jp': return 'Japanese';
      case 'cn': return 'Chinese';
      default: return 'Language';
    }
  }

  Color get _themeColor {
    switch (widget.langCode) {
      case 'de': return const Color(0xFFFFCE00);
      case 'jp': return const Color(0xFFBC002D);
      case 'cn': return const Color(0xFFDE2910);
      default: return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_langName),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: 'Chat',
          ),
          NavigationDestination(
            icon: Icon(Icons.book_outlined),
            selectedIcon: Icon(Icons.book),
            label: 'Notebook',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: 'Words',
          ),
        ],
      ),
    );
  }
}
