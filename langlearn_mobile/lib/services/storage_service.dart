import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _notebookKeyPrefix = 'langlearn_notebook_';
  static const String _chatKeyPrefix = 'langlearn_chat_'; // Legacy
  static const String _sessionsKeyPrefix = 'langlearn_sessions_';

  Future<List<Map<String, String>>> getWords(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString('$_notebookKeyPrefix$langCode');
    if (raw == null) return [];

    try {
      final List<dynamic> decoded = jsonDecode(raw);
      return decoded.map((e) => Map<String, String>.from(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveWord(String langCode, Map<String, String> word) async {
    final prefs = await SharedPreferences.getInstance();
    final words = await getWords(langCode);
    words.insert(0, word); // Add to top
    await prefs.setString('$_notebookKeyPrefix$langCode', jsonEncode(words));
  }

  Future<void> deleteWord(String langCode, int index) async {
    final prefs = await SharedPreferences.getInstance();
    final words = await getWords(langCode);
    if (index >= 0 && index < words.length) {
      words.removeAt(index);
      await prefs.setString('$_notebookKeyPrefix$langCode', jsonEncode(words));
    }
  }

  // Chat History Methods

  Future<List<Map<String, String>>> getChatHistory(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString('$_chatKeyPrefix$langCode');
    if (raw == null) return [];

    try {
      final List<dynamic> decoded = jsonDecode(raw);
      return decoded.map((e) => Map<String, String>.from(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveChatHistory(String langCode, List<Map<String, String>> messages) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_chatKeyPrefix$langCode', jsonEncode(messages));
  }

  Future<void> clearChatHistory(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_chatKeyPrefix$langCode');
  }

  // Session Methods

  Future<List<Map<String, dynamic>>> getSessions(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    final String? raw = prefs.getString('$_sessionsKeyPrefix$langCode');
    if (raw == null) return [];

    try {
      final List<dynamic> decoded = jsonDecode(raw);
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveSession(String langCode, Map<String, dynamic> session) async {
    final prefs = await SharedPreferences.getInstance();
    final sessions = await getSessions(langCode);
    
    final index = sessions.indexWhere((s) => s['id'] == session['id']);
    if (index != -1) {
      sessions[index] = session;
    } else {
      sessions.insert(0, session); // Newest first
    }
    
    await prefs.setString('$_sessionsKeyPrefix$langCode', jsonEncode(sessions));
  }

  Future<void> deleteSession(String langCode, String sessionId) async {
    final prefs = await SharedPreferences.getInstance();
    final sessions = await getSessions(langCode);
    
    sessions.removeWhere((s) => s['id'] == sessionId);
    await prefs.setString('$_sessionsKeyPrefix$langCode', jsonEncode(sessions));
  }
}
