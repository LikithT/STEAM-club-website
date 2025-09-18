import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/serial_repository.dart';
import '../../data/web_serial_repository.dart';
import '../../data/websocket_serial_repository.dart';
import '../../data/mock_serial_repository.dart';
import '../../logic/buffers.dart';

// Connection state
class ConnectionState {
  final bool isConnected;
  final bool isConnecting;
  final String? error;

  ConnectionState({
    this.isConnected = false,
    this.isConnecting = false,
    this.error,
  });

  ConnectionState copyWith({
    bool? isConnected,
    bool? isConnecting,
    String? error,
  }) {
    return ConnectionState(
      isConnected: isConnected ?? this.isConnected,
      isConnecting: isConnecting ?? this.isConnecting,
      error: error ?? this.error,
    );
  }
}

// Serial repository provider - prioritize WebSocket streamer
final serialRepositoryProvider = Provider<SerialRepository>((ref) {
  // Try WebSocket first (connects to our Node.js data streamer)
  return WebSocketSerialRepository();
  
  // Fallback options:
  // final webSerial = WebSerialRepository();
  // return webSerial.isSupported ? webSerial : MockSerialRepository();
});

// Connection state notifier
class ConnectionStateNotifier extends StateNotifier<ConnectionState> {
  final SerialRepository _repository;

  ConnectionStateNotifier(this._repository) : super(ConnectionState());

  Future<void> toggleConnection() async {
    if (state.isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  }

  Future<void> connect() async {
    state = state.copyWith(isConnecting: true, error: null);
    
    try {
      final success = await _repository.connect();
      state = state.copyWith(
        isConnected: success,
        isConnecting: false,
        error: success ? null : 'Failed to connect',
      );
    } catch (e) {
      state = state.copyWith(
        isConnected: false,
        isConnecting: false,
        error: e.toString(),
      );
    }
  }

  Future<void> disconnect() async {
    await _repository.disconnect();
    state = state.copyWith(isConnected: false, isConnecting: false);
  }
}

final connectionStateProvider = StateNotifierProvider<ConnectionStateNotifier, ConnectionState>((ref) {
  final repository = ref.watch(serialRepositoryProvider);
  return ConnectionStateNotifier(repository);
});

// Data buffers provider
final dataBuffersProvider = StateNotifierProvider<DataBuffersNotifier, Map<String, RollingBuffer>>((ref) {
  final repository = ref.watch(serialRepositoryProvider);
  return DataBuffersNotifier(repository);
});

class DataBuffersNotifier extends StateNotifier<Map<String, RollingBuffer>> {
  final SerialRepository _repository;
  
  DataBuffersNotifier(this._repository) : super({}) {
    _initializeBuffers();
    _listenToData();
  }

  void _initializeBuffers() {
    final channels = [
      'Battery Voltage',
      'Battery Current',
      'Fuel Cell Voltage',
      'Battery Voltage (2nd)',
      'Purge Interval',
    ];

    final buffers = <String, RollingBuffer>{};
    for (final channel in channels) {
      buffers[channel] = RollingBuffer(maxDuration: 60, maxPoints: 600);
    }
    state = buffers;
  }

  void _listenToData() {
    _repository.dataStream.listen((data) {
      final newState = Map<String, RollingBuffer>.from(state);
      
      for (final entry in data.entries) {
        final buffer = newState[entry.key];
        if (buffer != null) {
          buffer.addPoint(entry.value);
        }
      }
      
      state = newState;
    });
  }
}
