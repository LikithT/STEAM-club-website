abstract class SerialRepository {
  Stream<Map<String, double>> get dataStream;
  Future<bool> connect();
  Future<void> disconnect();
  bool get isConnected;
  bool get isSupported;
}

class SerialData {
  final double battVolt;
  final double battCurrent;
  final double fuelCellVolt;
  final double battVolt2;
  final double purgeInterval;
  final DateTime timestamp;

  SerialData({
    required this.battVolt,
    required this.battCurrent, 
    required this.fuelCellVolt,
    required this.battVolt2,
    required this.purgeInterval,
    required this.timestamp,
  });

  Map<String, double> toMap() {
    return {
      'Battery Voltage': battVolt,
      'Battery Current': battCurrent,
      'Fuel Cell Voltage': fuelCellVolt,
      'Battery Voltage (2nd)': battVolt2,
      'Purge Interval': purgeInterval,
    };
  }

  factory SerialData.fromCsv(String csvLine) {
    final parts = csvLine.split(',');
    if (parts.length != 5) {
      throw FormatException('Invalid CSV format: expected 5 values');
    }
    
    return SerialData(
      battVolt: double.parse(parts[0].trim()),
      battCurrent: double.parse(parts[1].trim()),
      fuelCellVolt: double.parse(parts[2].trim()),
      battVolt2: double.parse(parts[3].trim()),
      purgeInterval: double.parse(parts[4].trim()),
      timestamp: DateTime.now(),
    );
  }
}
