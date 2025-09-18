# 🚀 H2GP Serial Data Streamer

A Node.js application that reads data from COM4 serial port and streams it via WebSocket to the Heritage H2GP Live Telemetry Dashboard.

## 🎯 Purpose

This data streamer acts as a bridge between:
- **Physical H2GP Racing Car** (connected via USB/COM4)
- **Web-based Telemetry Dashboard** (running in browser)

## 🏗️ Architecture

```
H2GP Racing Car → COM4 → Node.js Data Streamer → WebSocket → Flutter Dashboard
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **H2GP racing car** connected to COM4 port
- **Serial device** sending data at 115200 baud rate

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd serial-data-streamer
npm install
```

### 2. Start the Data Streamer
```bash
npm start
```

### 3. Start the Flutter Dashboard
```bash
cd ../serial_dashboard
flutter run -d web-server --web-port=8081
```

### 4. Connect Your H2GP Car
- Plug H2GP racing car into USB port (should appear as COM4)
- The streamer will automatically detect and connect
- Dashboard will show live telemetry data

## 📊 Data Format

The H2GP racing car should send CSV data in this format:
```
battVolt,battCurrent,fuelCellVolt,battVolt2,purgeInterval
12.5,3.2,15.8,11.9,2.1
13.1,2.8,16.2,12.3,1.9
```

## 🔧 Configuration

Edit `server.js` to customize:

```javascript
const config = {
  serialPort: 'COM4',        // Target COM port
  baudRate: 115200,          // Serial baud rate
  wsPort: 8082,             // WebSocket server port
  httpPort: 8083            // HTTP API port
};
```

## 🌐 API Endpoints

### Health Check
```
GET http://localhost:8083/health
```
Returns server status and connection information.

### List Serial Ports
```
GET http://localhost:8083/ports
```
Returns all available serial ports on the system.

## 🔌 WebSocket Connection

The dashboard connects to: `ws://localhost:8082`

### Message Types

#### Status Messages
```json
{
  "type": "status",
  "connected": true,
  "port": "COM4",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Telemetry Data
```json
{
  "type": "telemetry",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "Battery Voltage": 12.5,
    "Battery Current": 3.2,
    "Fuel Cell Voltage": 15.8,
    "Battery Voltage (2nd)": 11.9,
    "Purge Interval": 2.1
  }
}
```

## 🛠️ Troubleshooting

### Port Not Found
If COM4 is not available, the streamer will:
1. List all available ports
2. Look for similar ports (COM3, COM5, etc.)
3. Attempt automatic reconnection every 5 seconds

### No Data Received
1. **Check H2GP car connection**: Ensure USB cable is working
2. **Verify data format**: Car should send CSV data as specified above
3. **Check baud rate**: Must be 115200 (standard for H2GP systems)
4. **Monitor console logs**: Look for data parsing errors

### WebSocket Connection Issues
1. **Check ports**: Ensure 8082 is not blocked by firewall
2. **Browser console**: Look for WebSocket connection errors
3. **Restart services**: Stop and restart both streamer and dashboard

## 📝 Console Output

Normal operation shows:
```
🚀 Starting H2GP Serial Data Streamer...
🌐 WebSocket server running on port 8082
🌐 HTTP server running on port 8083
📋 Available ports:
  - COM4 (Silicon Labs)
✅ Found target port: COM4
✅ Serial port COM4 opened successfully
📱 Dashboard client connected
📊 Raw data: 12.5,3.2,15.8,11.9,2.1
📡 Broadcasting telemetry: {...}
```

## 🔄 Auto-Reconnection

The streamer includes robust reconnection logic:
- **Serial Port**: Reconnects every 5 seconds if connection drops
- **WebSocket**: Dashboard auto-reconnects every 3 seconds
- **Error Recovery**: Handles malformed data gracefully

## 🏁 Racing Integration

Perfect for H2GP racing scenarios:
- **Real-time monitoring** during races
- **Performance analysis** with live charts
- **Educational tool** for STEAM learning
- **Competition ready** with professional interface

## 🎓 Educational Use

Ideal for:
- **Fuel cell physics demonstrations**
- **Real-time data analysis lessons**
- **Engineering project showcases**
- **STEAM club activities**

## 🤝 Support

For issues or questions:
1. Check console logs for error messages
2. Verify H2GP car data format matches specification
3. Test with different COM ports if needed
4. Ensure all services are running on correct ports

---

**Ready for H2GP Racing!** 🏎️⚡
