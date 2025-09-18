import 'dart:async';
import 'dart:html' as html;
import 'dart:js' as js;
import 'dart:js_util' as js_util;
import 'serial_repository.dart';

class WebSerialRepository implements SerialRepository {
  StreamController<Map<String, double>>? _controller;
  dynamic _port;
  dynamic _reader;
  bool _isConnected = false;
  String _buffer = '';

  @override
  Stream<Map<String, double>> get dataStream {
    _controller ??= StreamController<Map<String, double>>.broadcast();
    return _controller!.stream;
  }

  @override
  bool get isConnected => _isConnected;

  @override
  bool get isSupported {
    try {
      return js.context.hasProperty('navigator') &&
             js.context['navigator'].hasProperty('serial');
    } catch (e) {
      return false;
    }
  }

  @override
  Future<bool> connect() async {
    if (_isConnected) return true;
    if (!isSupported) return false;

    try {
      // Request a port - prioritize COM ports over Bluetooth
      final navigator = js.context['navigator'];
      final serial = navigator['serial'];
      
      // First, try to get available ports to find COM4 specifically
      dynamic availablePorts;
      try {
        availablePorts = await js_util.promiseToFuture(
          serial.callMethod('getPorts')
        );
      } catch (e) {
        // If getPorts fails, fall back to requestPort
        availablePorts = null;
      }

      // Look for COM4 or similar serial ports in available ports
      if (availablePorts != null) {
        final portsLength = availablePorts['length'] ?? 0;
        for (int i = 0; i < portsLength; i++) {
          final port = availablePorts[i];
          final portInfo = port['getInfo']?.call();
          
          // Check if this looks like a COM port (not Bluetooth)
          if (portInfo != null) {
            final vendorId = portInfo['usbVendorId'];
            final productId = portInfo['usbProductId'];
            
            // Skip Bluetooth devices, prioritize USB serial devices
            if (vendorId != null && productId != null) {
              _port = port;
              break;
            }
          }
        }
      }

      // If no suitable port found in available ports, request one with filters
      if (_port == null) {
        _port = await js_util.promiseToFuture(
          serial.callMethod('requestPort', [
            js_util.jsify({
              'filters': [
                // Common USB-to-Serial chip vendors (COM ports)
                {'usbVendorId': 0x10c4}, // Silicon Labs CP210x (common for Arduino/ESP32)
                {'usbVendorId': 0x1a86}, // QinHeng Electronics CH340/CH341
                {'usbVendorId': 0x0403}, // FTDI FT232/FT234 series
                {'usbVendorId': 0x067b}, // Prolific PL2303
                {'usbVendorId': 0x2341}, // Arduino LLC
                {'usbVendorId': 0x1b4f}, // SparkFun
              ]
            })
          ])
        );
      }

      if (_port == null) return false;

      // Open the port
      await js_util.promiseToFuture(
        _port.callMethod('open', [
          js_util.jsify({
            'baudRate': 115200,
            'dataBits': 8,
            'stopBits': 1,
            'parity': 'none',
            'flowControl': 'none',
          })
        ])
      );

      _isConnected = true;
      _startReading();
      return true;

    } catch (e) {
      print('Serial connection error: $e');
      return false;
    }
  }

  @override
  Future<void> disconnect() async {
    if (!_isConnected) return;

    try {
      _isConnected = false;

      // Cancel reader
      if (_reader != null) {
        await js_util.promiseToFuture(_reader.callMethod('cancel'));
        _reader = null;
      }

      // Close port
      if (_port != null) {
        await js_util.promiseToFuture(_port.callMethod('close'));
        _port = null;
      }

    } catch (e) {
      print('Serial disconnect error: $e');
    }
  }

  void _startReading() async {
    if (!_isConnected || _port == null) return;

    try {
      final readable = _port['readable'];
      _reader = readable.callMethod('getReader');

      while (_isConnected) {
        final result = await js_util.promiseToFuture(
          _reader.callMethod('read')
        );

        if (result['done'] == true) break;

        final value = result['value'];
        if (value != null) {
          _processSerialData(value);
        }
      }

    } catch (e) {
      print('Serial reading error: $e');
      _isConnected = false;
    }
  }

  void _processSerialData(dynamic uint8Array) {
    // Convert Uint8Array to string
    final List<int> bytes = [];
    final length = uint8Array['length'];
    
    for (int i = 0; i < length; i++) {
      bytes.add(uint8Array[i]);
    }
    
    final chunk = String.fromCharCodes(bytes);
    _buffer += chunk;

    // Process complete lines
    final lines = _buffer.split('\n');
    _buffer = lines.removeLast(); // Keep incomplete line in buffer

    for (final line in lines) {
      _parseLine(line.trim());
    }
  }

  void _parseLine(String line) {
    if (line.isEmpty) return;

    try {
      // Expected format: battVolt,battCurrent,fuelCellVolt,battVolt2,purgeInterval
      final data = SerialData.fromCsv(line);
      
      if (_controller != null && !_controller!.isClosed) {
        _controller!.add(data.toMap());
      }
      
    } catch (e) {
      // Ignore malformed lines
      print('Ignoring malformed line: $line');
    }
  }

  void dispose() {
    disconnect();
    _controller?.close();
  }
}
