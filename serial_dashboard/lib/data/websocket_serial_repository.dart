import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;
import 'serial_repository.dart';

class WebSocketSerialRepository implements SerialRepository {
  StreamController<Map<String, double>>? _controller;
  html.WebSocket? _websocket;
  bool _isConnected = false;
  Timer? _reconnectTimer;
  final String _wsUrl = 'ws://localhost:8084';

  @override
  Stream<Map<String, double>> get dataStream {
    _controller ??= StreamController<Map<String, double>>.broadcast();
    return _controller!.stream;
  }

  @override
  bool get isConnected => _isConnected;

  @override
  bool get isSupported => true; // WebSocket is always supported

  @override
  Future<bool> connect() async {
    if (_isConnected) return true;

    try {
      print('🔌 Connecting to WebSocket data streamer at $_wsUrl...');
      
      _websocket = html.WebSocket(_wsUrl);
      
      _websocket!.onOpen.listen((event) {
        print('✅ Connected to H2GP data streamer');
        _isConnected = true;
        _cancelReconnectTimer();
      });

      _websocket!.onMessage.listen((html.MessageEvent event) {
        _handleWebSocketMessage(event.data.toString());
      });

      _websocket!.onClose.listen((html.CloseEvent event) {
        print('🔌 WebSocket connection closed (${event.code}: ${event.reason})');
        _isConnected = false;
        _scheduleReconnect();
      });

      _websocket!.onError.listen((event) {
        print('❌ WebSocket error: $event');
        _isConnected = false;
        _scheduleReconnect();
      });

      // Wait for connection or timeout
      await _waitForConnection();
      return _isConnected;

    } catch (e) {
      print('❌ Failed to connect to WebSocket: $e');
      _scheduleReconnect();
      return false;
    }
  }

  Future<void> _waitForConnection() async {
    for (int i = 0; i < 50; i++) { // Wait up to 5 seconds
      if (_isConnected) return;
      await Future.delayed(const Duration(milliseconds: 100));
    }
  }

  void _handleWebSocketMessage(String message) {
    try {
      final data = jsonDecode(message);
      
      switch (data['type']) {
        case 'telemetry':
          _processTelemetryData(data);
          break;
        case 'status':
          print('📊 Status update: Connected=${data['connected']}, Port=${data['port']}');
          break;
        default:
          print('📨 Unknown message type: ${data['type']}');
      }
    } catch (e) {
      print('❌ Error parsing WebSocket message: $e');
    }
  }

  void _processTelemetryData(Map<String, dynamic> data) {
    try {
      final telemetryData = Map<String, double>.from(data['data']);
      
      print('📡 Received telemetry: $telemetryData');
      
      if (_controller != null && !_controller!.isClosed) {
        _controller!.add(telemetryData);
      }
    } catch (e) {
      print('❌ Error processing telemetry data: $e');
    }
  }

  void _scheduleReconnect() {
    if (_reconnectTimer != null) return;
    
    print('⏰ Scheduling WebSocket reconnect in 3 seconds...');
    _reconnectTimer = Timer(const Duration(seconds: 3), () {
      _reconnectTimer = null;
      print('🔄 Attempting WebSocket reconnect...');
      connect();
    });
  }

  void _cancelReconnectTimer() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
  }

  @override
  Future<void> disconnect() async {
    try {
      _isConnected = false;
      _cancelReconnectTimer();
      
      if (_websocket != null) {
        _websocket!.close();
        _websocket = null;
      }
      
      print('🔌 Disconnected from WebSocket data streamer');
    } catch (e) {
      print('❌ Error disconnecting WebSocket: $e');
    }
  }

  void dispose() {
    disconnect();
    _controller?.close();
  }
}
