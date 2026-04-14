import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class NotebookScreen extends StatefulWidget {
  final String langCode;

  const NotebookScreen({super.key, required this.langCode});

  @override
  State<NotebookScreen> createState() => _NotebookScreenState();
}

class _NotebookScreenState extends State<NotebookScreen> {
  final StorageService _storageService = StorageService();
  final TextEditingController _wordController = TextEditingController();
  final TextEditingController _meaningController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Map<String, String>> _words = [];
  
  // Alphabet for scroller
  final List<String> _alphabet = List.generate(26, (i) => String.fromCharCode(65 + i));

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  Future<void> _loadWords() async {
    final words = await _storageService.getWords(widget.langCode);
    setState(() {
      _words = words;
      // Sort alphabetically
      _words.sort((a, b) => (a['word'] ?? '').toLowerCase().compareTo((b['word'] ?? '').toLowerCase()));
    });
  }

  Future<void> _addWord() async {
    if (_wordController.text.isEmpty || _meaningController.text.isEmpty) return;

    await _storageService.saveWord(widget.langCode, {
      'word': _wordController.text,
      'meaning': _meaningController.text,
    });

    _wordController.clear();
    _meaningController.clear();
    _loadWords();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Word saved!')),
      );
    }
  }

  Future<void> _deleteWord(int index) async {
    await _storageService.deleteWord(widget.langCode, index);
    _loadWords();
  }

  void _showAddDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 24,
          right: 24,
          top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Add New Word',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _wordController,
              decoration: const InputDecoration(
                labelText: 'Word / Phrase',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _meaningController,
              decoration: const InputDecoration(
                labelText: 'Meaning / Notes',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  _addWord();
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1e3a8a),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Save Word'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _scrollToLetter(String letter) {
    int index = _words.indexWhere((w) => (w['word'] ?? '').toUpperCase().startsWith(letter));
    if (index != -1) {
      // Calculate offset roughly (assuming fixed item height or using scrollable_positioned_list package would be better, 
      // but for standard ListView, we can try to estimate or just jump if we knew item heights.
      // Since item heights vary, this is tricky with standard ListView.
      // A simple approach: find the item and scroll to it if possible.
      // For now, let's just use a simple estimation or find a way to scroll to index.
      // Actually, standard ListView doesn't support scrollToIndex easily without fixed extent.
      // Let's assume a rough height of 80 per item.
      _scrollController.animateTo(
        index * 80.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: const Color(0xFF1e3a8a),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _words.isEmpty
          ? const Center(
              child: Text(
                'No words yet.\nTap + to add one!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            )
          : Row(
              children: [
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _words.length,
                    itemBuilder: (context, index) {
                final word = _words[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 2,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    title: Text(
                      word['word'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    subtitle: Text(
                      word['meaning'] ?? '',
                      style: const TextStyle(fontSize: 14, color: Colors.black54),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () => _deleteWord(index),
                    ),
                  ),
                );
              },
            ),
                ),
                // Side Scroller
                Container(
                  width: 30,
                  color: Colors.grey.withOpacity(0.1),
                  child: ListView.builder(
                    itemCount: _alphabet.length,
                    itemBuilder: (context, index) {
                      final letter = _alphabet[index];
                      // Check if we have words starting with this letter
                      final hasWords = _words.any((w) => (w['word'] ?? '').toUpperCase().startsWith(letter));
                      return GestureDetector(
                        onTap: () => _scrollToLetter(letter),
                        child: Container(
                          height: 25,
                          alignment: Alignment.center,
                          child: Text(
                            letter,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: hasWords ? FontWeight.bold : FontWeight.normal,
                              color: hasWords ? const Color(0xFF1e3a8a) : Colors.grey,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
