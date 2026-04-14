import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pasteboard/pasteboard.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'package:permission_handler/permission_handler.dart';

class ChatScreen extends StatefulWidget {
  final String langCode;

  const ChatScreen({super.key, required this.langCode});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  final ImagePicker _picker = ImagePicker();
  
  List<Map<String, String>> _messages = [];
  List<Map<String, dynamic>> _sessions = [];
  String? _currentSessionId;
  bool _isLoading = false;
  XFile? _selectedImage;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    final sessions = await _storageService.getSessions(widget.langCode);
    setState(() {
      _sessions = sessions;
    });

    if (_sessions.isNotEmpty) {
      _loadSession(_sessions.first);
    } else {
      _createNewSession();
    }
  }

  void _loadSession(Map<String, dynamic> session) {
    setState(() {
      _currentSessionId = session['id'];
      _messages = (session['messages'] as List).map((e) => Map<String, String>.from(e)).toList();
      _selectedImage = null; // Clear any selected image when switching sessions
    });
  }

  void _createNewSession() {
    final newSessionId = DateTime.now().millisecondsSinceEpoch.toString();
    setState(() {
      _currentSessionId = newSessionId;
      _messages = [{
        'role': 'model',
        'content': _getGreeting(widget.langCode),
      }];
      _selectedImage = null;
    });
    _saveCurrentSession();
  }

  Future<void> _saveCurrentSession() async {
    if (_currentSessionId == null) return;

    final session = {
      'id': _currentSessionId,
      'title': _messages.length > 1 ? _messages[1]['content'] : 'New Chat',
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'messages': _messages,
    };

    await _storageService.saveSession(widget.langCode, session);
    _loadSessions(); // Refresh list
  }

  Future<void> _renameSession(String sessionId, String currentTitle) async {
    final controller = TextEditingController(text: currentTitle);
    final newTitle = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename Chat'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter new title'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (newTitle != null && newTitle.isNotEmpty) {
      final sessionIndex = _sessions.indexWhere((s) => s['id'] == sessionId);
      if (sessionIndex != -1) {
        final updatedSession = Map<String, dynamic>.from(_sessions[sessionIndex]);
        updatedSession['title'] = newTitle;
        
        await _storageService.saveSession(widget.langCode, updatedSession);
        setState(() {
          _sessions[sessionIndex] = updatedSession;
        });
      }
    }
  }

  Future<void> _deleteSession(String sessionId) async {
    await _storageService.deleteSession(widget.langCode, sessionId);
    if (_currentSessionId == sessionId) {
      _loadSessions(); // Will load first or create new
    } else {
      // Just refresh list
      final sessions = await _storageService.getSessions(widget.langCode);
      setState(() {
        _sessions = sessions;
      });
    }
  }

  String _getGreeting(String lang) {
    switch (lang) {
      case 'de': return 'Hallo! 👋 Was möchtest du heute üben?';
      case 'jp': return 'こんにちは！👋 今日は何を練習しますか？';
      case 'cn': return '你好！👋 今天你想练习什么？';
      default: return 'Hello!';
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      PermissionStatus status;
      if (source == ImageSource.camera) {
        status = await Permission.camera.request();
      } else {
        // For gallery, handling differs by Android version, but 'photos' covers most modern cases
        // and 'storage' for older ones. permission_handler handles some of this logic.
        // On Android 13+, use photos. Below, storage.
        if (Platform.isAndroid) {
           // Simple check for now, can be more granular if needed
           // Try photos first (Android 13+)
           status = await Permission.photos.request();
           if (status.isPermanentlyDenied || status.isDenied) {
             // Fallback for older Android or if photos permission logic fails/differs
             status = await Permission.storage.request();
           }
        } else {
           status = await Permission.photos.request();
        }
      }

      if (status.isGranted || status.isLimited) {
        final XFile? image = await _picker.pickImage(source: source, maxWidth: 1024, maxHeight: 1024, imageQuality: 85);
        if (image != null) {
          setState(() {
            _selectedImage = image;
          });
        }
      } else if (status.isPermanentlyDenied) {
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Permission Required'),
              content: Text(source == ImageSource.camera 
                  ? 'Camera permission is needed to take photos.' 
                  : 'Gallery permission is needed to select photos.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    openAppSettings();
                  },
                  child: const Text('Open Settings'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error picking image: $e')));
      }
    }
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty && _selectedImage == null) return;

    String? base64Image;
    if (_selectedImage != null) {
      final bytes = await _selectedImage!.readAsBytes();
      base64Image = base64Encode(bytes);
    }

    setState(() {
      final userMsg = {'role': 'user', 'content': text};
      if (_selectedImage != null) {
        userMsg['hasImage'] = 'true'; // Marker for UI to show icon or something (optional)
        // For now, we just show the text. We could show the image in chat history if we stored it locally.
        if (text.isEmpty) userMsg['content'] = '[Sent an image]';
      }
      _messages.add(userMsg);
      _isLoading = true;
      _selectedImage = null; // Clear after sending
    });
    _controller.clear();
    _scrollToBottom();
    _saveCurrentSession();

    try {
      final response = await _apiService.sendMessage(widget.langCode, text, base64Image: base64Image);

      if (mounted) {
        setState(() {
          _messages.add({'role': 'model', 'content': response});
          _isLoading = false;
        });
        _scrollToBottom();
        _saveCurrentSession();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({'role': 'model', 'content': 'Error: ${e.toString()}'});
          _isLoading = false;
        });
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chat ${widget.langCode.toUpperCase()}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _createNewSession,
            tooltip: 'New Chat',
          ),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF1e3a8a)),
              child: SizedBox(
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text(
                      'Chat History',
                      style: TextStyle(color: Colors.white, fontSize: 24),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${_sessions.length} saved chats',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _sessions.length,
                itemBuilder: (context, index) {
                  final session = _sessions[index];
                  final isSelected = session['id'] == _currentSessionId;
                  return ListTile(
                    selected: isSelected,
                    selectedTileColor: Colors.blue.withOpacity(0.1),
                    leading: const Icon(Icons.chat_bubble_outline),
                    title: Text(
                      session['title'] ?? 'New Chat',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      DateTime.fromMillisecondsSinceEpoch(session['timestamp'] ?? 0).toString().split('.')[0],
                      style: const TextStyle(fontSize: 12),
                    ),
                    onTap: () {
                      _loadSession(session);
                      Navigator.pop(context); // Close drawer
                    },
                    trailing: PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, size: 20),
                      onSelected: (value) {
                        if (value == 'rename') {
                          _renameSession(session['id'], session['title'] ?? 'New Chat');
                        } else if (value == 'delete') {
                          _deleteSession(session['id']);
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'rename',
                          child: Row(
                            children: [
                              Icon(Icons.edit, size: 20, color: Colors.black54),
                              SizedBox(width: 8),
                              Text('Rename'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete_outline, size: 20, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Delete', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              final isUser = msg['role'] == 'user';
              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                  decoration: BoxDecoration(
                    color: isUser ? const Color(0xFF1e3a8a) : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                      bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: isUser
                      ? Text(
                          msg['content']!,
                          style: const TextStyle(color: Colors.white),
                        )
                      : _buildAiMessage(msg['content']!),
                ),
              );
            },
          ),
        ),
        if (_isLoading)
          const Padding(
            padding: EdgeInsets.all(8.0),
            child: CircularProgressIndicator(),
          ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFe2e8f0))),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_selectedImage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  height: 100,
                  width: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: FileImage(File(_selectedImage!.path)),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: 0,
                        top: 0,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedImage = null;
                            });
                          },
                          child: Container(
                            color: Colors.black54,
                            child: const Icon(Icons.close, color: Colors.white, size: 20),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.add_photo_alternate_outlined, color: Color(0xFF1e3a8a)),
                    onPressed: _showImagePickerOptions,
                    tooltip: 'Attach Image',
                  ),
                  IconButton(
                    icon: const Icon(Icons.content_paste, color: Color(0xFF1e3a8a)),
                    onPressed: _pasteImage,
                    tooltip: 'Paste Image',
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: const Color(0xFFf1f5f9),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFF1e3a8a),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 20),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        ],
      ),
    );
  }

  Widget _buildAiMessage(String text) {
    if (text.contains('⚡ Answered by Backup AI')) {
       // Simple check, can be improved
    }

    // Attempt to parse structured response
    // Regex logic similar to JS but adapted for Dart
    String? getSection(String name) {
      final knownHeaders = ["GER", "ENG", "IND", "Response\\s+ENG", "Response\\s+ROMAJI", "Response", "Feedback", "Pro-Tip", "Example", "JPN", "CHN", "ROMAJI"];
      final knownHeadersPattern = knownHeaders.join('|');
      
      String negativeLookahead = '';
      if (name == 'Response') {
        negativeLookahead = '(?!\\s+ENG|\\s+ROMAJI)';
      }

      // Dart regex doesn't support lookbehind or some advanced features fully in the same way, but let's try a compatible approach
      // We look for the Header followed by content until the next Header or End of String
      final regex = RegExp(
        '(?:^|\\n)\\s*(?:#+\\s*)?(?:\\*\\*|\\*|_)?$name(?:\\*\\*|\\*|_)?$negativeLookahead\\s*:?\\s*(.*?)(?=(?:\\n\\s*(?:#+\\s*)?(?:\\*\\*|\\*|_)?(?:$knownHeadersPattern)\\b(?:\\*\\*|\\*|_)?)|\\Z)', 
        caseSensitive: false, 
        dotAll: true
      );
      
      final match = regex.firstMatch(text);
      if (match != null && match.groupCount >= 1) {
        return match.group(1)?.trim().replaceAll(RegExp(r'^\*+|\*+$'), '').trim();
      }
      return null;
    }

    String langHeader = 'CHN'; // Default or logic to derive
    // In ChatScreen we know widget.langCode
    if (widget.langCode == 'de') langHeader = 'GER';
    else if (widget.langCode == 'jp') langHeader = 'JPN';
    
    // Parse sections
    final transText = getSection(langHeader) ?? getSection(langHeader == 'GER' ? 'GERMAN' : langHeader == 'JPN' ? 'Japanese' : 'Chinese');
    final romajiText = getSection('ROMAJI') ?? getSection('Romaji');
    final engText = getSection('ENG') ?? getSection('ENGLISH');
    final indText = getSection('IND') ?? getSection('INDONESIAN');
    
    final responseText = getSection('RESPONSE') ?? getSection('Response');
    final responseRomaji = getSection('Response ROMAJI') ?? getSection('Response Romaji');
    final responseEng = getSection('RESPONSE ENG') ?? getSection('Response ENG');
    
    final feedback = getSection('Feedback');
    final proTip = getSection('Pro-Tip');
    final example = getSection('Example');

    bool hasStructure = (transText != null && engText != null && indText != null) || (responseText != null);

    if (hasStructure) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Translations
          if (transText != null && engText != null && indText != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  _buildTransRow(langHeader, transText),
                  if (romajiText != null) _buildTransRow('ROMAJI', romajiText),
                  _buildTransRow('ENG', engText),
                  _buildTransRow('IND', indText),
                ],
              ),
            ),
          
          // 2. Main Response
          if (responseText != null) ...[
            const Text('Response', style: TextStyle(fontWeight: FontWeight.bold)),
            MarkdownBody(data: responseText),
            if (responseRomaji != null) ...[
              const SizedBox(height: 4),
              Text(responseRomaji, style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.black54)),
            ],
            if (responseEng != null) ...[
              const SizedBox(height: 4),
              Text(responseEng, style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
            ]
          ],

          // 3. Meta (Feedback, Pro-Tip, Example)
          if (feedback != null) _buildMetaBox('Feedback', feedback, Colors.green[50]!, Colors.green[800]!),
          if (proTip != null) _buildMetaBox('Pro-Tip', proTip, Colors.blue[50]!, Colors.blue[800]!),
          if (example != null) _buildMetaBox('Example', example, Colors.orange[50]!, Colors.orange[800]!),
        ],
      );
    }

    // Fallback
    return MarkdownBody(data: text);
  }

  Widget _buildTransRow(String label, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 60, 
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey))
          ),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildMetaBox(String label, String content, Color bgColor, Color textColor) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(8),
      width: double.infinity,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: textColor)),
          const SizedBox(height: 2),
          MarkdownBody(data: content, styleSheet: MarkdownStyleSheet(p: TextStyle(color: textColor))),
        ],
      ),
    );
  }

  Future<void> _pasteImage() async {
    try {
      final imageBytes = await Pasteboard.image;
      if (imageBytes != null) {
        final tempDir = await Directory.systemTemp.createTemp();
        final tempFile = File('${tempDir.path}/pasted_image_${DateTime.now().millisecondsSinceEpoch}.jpg');
        await tempFile.writeAsBytes(imageBytes);
        
        setState(() {
          _selectedImage = XFile(tempFile.path);
        });
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No image found in clipboard')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error pasting image: $e')),
        );
      }
    }
  }
}
