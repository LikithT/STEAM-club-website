import 'dart:async';
import 'dart:math' as math;
import 'serial_repository.dart';

class MockSerialRepository implements SerialRepository {
  Timer? _timer;
  late StreamController<Map<String, double>> _controller;
  bool _isConnected = false;
  final math.Random _random = math.Random();
  
  // Base values for realistic simulation
  double _battVoltBase = 12.0;
  double _battCurrentBase = 2.5;
  double _fuelCellVoltBase = 0.8;
  double _battVolt2Base = 12.1;
  double _purgeIntervalBase = 30.0;
  
  // Time tracking for sine waves
  double _timeElapsed = 0.0;

  MockSerialRepository() {
    _controller = StreamController<Map<String, double>>.broadcast();
  }

  @override
  Stream<Map<String, double>> get dataStream => _controller.stream;

  @override
  bool get isConnected => _isConnected;

  @override
  bool get isSupported => true; // Mock is always supported

  @override
  Future<bool> connect() async {
    if (_isConnected) return true;
    
    // Simulate connection delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    _isConnected = true;
    _startDataGeneration();
    return true;
  }

  @override
  Future<void> disconnect() async {
    _isConnected = false;
    _timer?.cancel();
    _timer = null;
  }

  void _startDataGeneration() {
    // Generate data every 100ms (10Hz)
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (!_isConnected) {
        timer.cancel();
        return;
      }

      _timeElapsed += 0.1; // 100ms in seconds
      
      // Generate realistic battery/fuel cell data with sine waves + noise
      final data = _generateRealisticData();
      
      if (!_controller.isClosed) {
        _controller.add(data);
      }
    });
  }

  Map<String, double> _generateRealisticData() {
    // Simulate realistic H2GP car telemetry patterns
    
    // Battery voltage: slowly declining with small variations
    final battVolt = _battVoltBase + 
        math.sin(_timeElapsed * 0.1) * 0.3 + // Slow drift
        (_random.nextDouble() - 0.5) * 0.1; // Noise
    
    // Battery current: varies with load cycles
    final battCurrent = _battCurrentBase + 
        math.sin(_timeElapsed * 0.5) * 1.5 + // Load cycles
        math.sin(_timeElapsed * 0.05) * 0.5 + // Slower variation
        (_random.nextDouble() - 0.5) * 0.2; // Noise
    
    // Fuel cell voltage: relatively stable with small fluctuations
    final fuelCellVolt = _fuelCellVoltBase + 
        math.sin(_timeElapsed * 0.3) * 0.1 + 
        (_random.nextDouble() - 0.5) * 0.05;
    
    // Second battery voltage: slightly different from first
    final battVolt2 = _battVolt2Base + 
        math.sin(_timeElapsed * 0.08) * 0.25 + 
        (_random.nextDouble() - 0.5) * 0.08;
    
    // Purge interval: stepped changes with some randomness
    final purgeInterval = _purgeIntervalBase + 
        (math.sin(_timeElapsed * 0.02) * 10).round() + 
        (_random.nextDouble() - 0.5) * 2;

    return {
      'Battery Voltage': double.parse(battVolt.toStringAsFixed(2)),
      'Battery Current': double.parse(battCurrent.toStringAsFixed(2)),
      'Fuel Cell Voltage': double.parse(fuelCellVolt.toStringAsFixed(3)),
      'Battery Voltage (2nd)': double.parse(battVolt2.toStringAsFixed(2)),
      'Purge Interval': double.parse(purgeInterval.toStringAsFixed(1)),
    };
  }

  void dispose() {
    disconnect();
    _controller.close();
  }
}
