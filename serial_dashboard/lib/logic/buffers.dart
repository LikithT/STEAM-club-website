import 'dart:collection';
import 'dart:math' as math;

class DataPoint {
  final DateTime timestamp;
  final double value;

  const DataPoint(this.timestamp, this.value);

  @override
  String toString() => 'DataPoint(${timestamp.toIso8601String()}, $value)';
}

class RollingBuffer {
  final int maxDuration; // in seconds
  final int maxPoints;
  final Queue<DataPoint> _data = Queue<DataPoint>();
  
  double? _currentMin;
  double? _currentMax;
  double? _currentValue;

  RollingBuffer({
    this.maxDuration = 60,
    this.maxPoints = 1200,
  });

  void addPoint(double value) {
    final now = DateTime.now();
    final point = DataPoint(now, value);
    
    _data.add(point);
    _currentValue = value;
    
    // Clean old data based on time window
    _cleanOldData(now);
    
    // Maintain max points limit with downsampling if needed
    _maintainMaxPoints();
    
    // Update min/max
    _updateMinMax();
  }

  void _cleanOldData(DateTime now) {
    final cutoff = now.subtract(Duration(seconds: maxDuration));
    
    while (_data.isNotEmpty && _data.first.timestamp.isBefore(cutoff)) {
      _data.removeFirst();
    }
    
    // Recalculate min/max after cleaning
    _updateMinMax();
  }

  void _maintainMaxPoints() {
    if (_data.length <= maxPoints) return;
    
    // Downsample by keeping every nth point
    final factor = (_data.length / maxPoints).ceil();
    final newData = Queue<DataPoint>();
    
    int index = 0;
    for (final point in _data) {
      if (index % factor == 0 || index == _data.length - 1) {
        newData.add(point);
      }
      index++;
    }
    
    _data.clear();
    _data.addAll(newData);
  }

  void _updateMinMax() {
    if (_data.isEmpty) {
      _currentMin = null;
      _currentMax = null;
      return;
    }
    
    double min = _data.first.value;
    double max = _data.first.value;
    
    for (final point in _data) {
      min = math.min(min, point.value);
      max = math.max(max, point.value);
    }
    
    _currentMin = min;
    _currentMax = max;
  }

  List<DataPoint> get data => _data.toList();
  double? get currentValue => _currentValue;
  double? get minValue => _currentMin;
  double? get maxValue => _currentMax;
  int get length => _data.length;
  bool get isEmpty => _data.isEmpty;

  void clear() {
    _data.clear();
    _currentMin = null;
    _currentMax = null;
    _currentValue = null;
  }
}
