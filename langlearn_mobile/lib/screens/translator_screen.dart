import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';

class TranslatorScreen extends StatefulWidget {
  final String langCode;

  const TranslatorScreen({super.key, required this.langCode});

  @override
  State<TranslatorScreen> createState() => _TranslatorScreenState();
}

class _TranslatorScreenState extends State<TranslatorScreen> {
  final TextEditingController _inputController = TextEditingController();
  final TextEditingController _outputController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  String _selectedContext = 'General';
  final List<String> _contexts = ['General', 'Formal', 'Friends', 'Parents', 'Business', 'Simple'];
  bool _isReverse = false;

  Future<void> _translate() async {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    final result = await _apiService.translate(
      text, 
      widget.langCode, 
      context: _selectedContext,
      isReverse: _isReverse,
    );

    if (mounted) {
      setState(() {
        _outputController.text = result;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Quick Translate',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const SizedBox(height: 8),
            Row(
              children: [
                Text(
                  _isReverse 
                    ? '${_getLangName(widget.langCode)} -> English'
                    : 'English -> ${_getLangName(widget.langCode)}',
                  style: const TextStyle(color: Colors.grey, fontSize: 16),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.swap_horiz, color: Color(0xFF1e3a8a)),
                  onPressed: () {
                    setState(() {
                      _isReverse = !_isReverse;
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Context Selection
            const Text(
              'Context',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _contexts.map((context) {
                return ChoiceChip(
                  label: Text(context),
                  selected: _selectedContext == context,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedContext = context;
                      });
                    }
                  },
                  selectedColor: const Color(0xFF1e3a8a).withOpacity(0.2),
                  labelStyle: TextStyle(
                    color: _selectedContext == context ? const Color(0xFF1e3a8a) : Colors.black,
                    fontWeight: _selectedContext == context ? FontWeight.bold : FontWeight.normal,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            
            // Input
            TextField(
              controller: _inputController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Type something to translate...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                filled: true,
                fillColor: Colors.white,
                suffixIcon: IconButton(
                  icon: const Icon(Icons.paste, color: Colors.grey),
                  onPressed: () async {
                    final data = await Clipboard.getData(Clipboard.kTextPlain);
                    if (data?.text != null) {
                      setState(() {
                        _inputController.text = data!.text!;
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Button
            ElevatedButton(
              onPressed: _isLoading ? null : _translate,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1e3a8a),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Translate', style: TextStyle(fontSize: 16)),
            ),
            const SizedBox(height: 24),
            
            // Output
            TextField(
              controller: _outputController,
              readOnly: true,
              minLines: 4,
              maxLines: null, // Flexible height
              decoration: InputDecoration(
                hintText: 'Translation will appear here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                filled: true,
                fillColor: const Color(0xFFf1f5f9),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.copy, color: Colors.grey),
                  onPressed: () {
                    if (_outputController.text.isNotEmpty) {
                      Clipboard.setData(ClipboardData(text: _outputController.text));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Copied to clipboard!')),
                      );
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getLangName(String code) {
    switch (code) {
      case 'de': return 'German';
      case 'jp': return 'Japanese';
      case 'cn': return 'Chinese';
      default: return 'Target Language';
    }
  }
}
