import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 for Android Emulator, localhost for Windows/Web
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  } 

  Future<String> sendMessage(String langCode, String message, {String? base64Image}) async {
    // Map short code to full language name for endpoint
    String endpoint;
    switch (langCode) {
      case 'de': endpoint = '/chat/german'; break;
      case 'jp': endpoint = '/chat/japanese'; break;
      case 'cn': endpoint = '/chat/chinese'; break;
      default: throw Exception('Unsupported language');
    }

    try {
      final body = {
        'message': message,
        // Server handles history internally, so we don't send it
      };
      
      if (base64Image != null) {
        body['image'] = base64Image;
      }

      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reply'] ?? 'No reply received';
      } else {
        throw Exception('Failed to load response: ${response.statusCode}');
      }
    } catch (e) {
      return 'Error: Could not connect to server. Make sure server.js is running.';
    }
  }

  Future<String> translate(String text, String targetLang, {String? context, bool isReverse = false}) async {
    String endpoint;
    switch (targetLang) {
      case 'de': endpoint = '/translate/german'; break;
      case 'jp': endpoint = '/translate/japanese'; break;
      case 'cn': endpoint = '/translate/chinese'; break;
      default: throw Exception('Unsupported language');
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'text': text,
          'context': context ?? 'General',
          'isReverse': isReverse,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // server.js returns { "result": "..." }
        return data['result'] ?? 'Translation failed';
      } else {
        throw Exception('Failed to translate');
      }
    } catch (e) {
      return 'Error: Translation failed.';
    }
  }
}
