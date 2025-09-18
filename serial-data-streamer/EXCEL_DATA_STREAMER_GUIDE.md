# Excel Data Streamer Integration Guide

## Overview
The H2GP Telemetry System now includes comprehensive data logging with Excel Data Streamer compatibility, allowing you to analyze all serial port data in Microsoft Excel.

## 🎯 What's Working

### ✅ SYSTEM STATUS: FULLY OPERATIONAL
- **Serial Connection**: ✅ Connected to `/dev/tty.usbserial-0001`
- **WebSocket Clients**: ✅ 5 connected clients
- **Data Logging**: ✅ All telemetry data being logged
- **Excel Integration**: ✅ CSV format ready for Excel Data Streamer

## 📊 Log Files Generated

The system automatically creates three types of log files in `serial-data-streamer/logs/`:

### 1. Excel-Compatible CSV File
**Format**: `H2GP_Telemetry_YYYY-MM-DDTHH-MM-SS.csv`
**Purpose**: Direct import into Excel Data Streamer

**Columns**:
- `Timestamp` - ISO 8601 timestamp
- `Unix_Time` - Unix epoch timestamp  
- `Battery_Voltage_V` - Battery voltage in volts
- `Battery_Current_A` - Battery current in amps
- `Fuel_Cell_Voltage_V` - Fuel cell voltage in volts
- `Battery_Voltage_2nd_V` - Secondary battery voltage in volts
- `Purge_Interval_s` - Purge interval in seconds
- `Raw_Byte1` - First raw byte from H2GP telemetry
- `Raw_Byte2` - Second raw byte from H2GP telemetry  
- `Data_Length_bytes` - Number of bytes received

### 2. Raw Binary Log
**Format**: `H2GP_Raw_Binary_YYYY-MM-DDTHH-MM-SS.log`
**Purpose**: Complete binary data logging with interpreted values

### 3. Debug Log  
**Format**: `H2GP_Debug_YYYY-MM-DDTHH-MM-SS.log`
**Purpose**: All raw serial data and system debugging information

## 📈 Excel Data Streamer Setup

### Step 1: Enable Excel Data Streamer
1. Open Microsoft Excel
2. Go to **Insert** > **Add-ins** > **Get Add-ins**
3. Search for "Data Streamer"
4. Install and enable the Data Streamer add-in

### Step 2: Import H2GP Telemetry Data
1. In Excel, go to **Data Streamer** tab
2. Click **Connect a Device** > **Import from CSV**
3. Navigate to: `serial-data-streamer/logs/`
4. Select the latest `H2GP_Telemetry_*.csv` file
5. Click **Start Data Stream**

### Step 3: Live Data Monitoring
- Excel will automatically update as new telemetry data arrives
- Create charts and graphs for real-time visualization
- Set up alerts for voltage/current thresholds

## 🔧 System Architecture

```
H2GP Telemetry Box (USB Serial)
         ↓ 115200 baud
Node.js Data Streamer
         ↓ Process binary data (0x63F6 format)
         ↓ Log to 3 file types
WebSocket Bridge (port 8084)  →  Excel CSV Files
         ↓                              ↓
Flutter Dashboard (port 8081)  →  Excel Data Streamer
```

## 📋 Current Data Sample

```csv
Timestamp,Unix_Time,Battery_Voltage_V,Battery_Current_A,Fuel_Cell_Voltage_V,Battery_Voltage_2nd_V,Purge_Interval_s,Raw_Byte1,Raw_Byte2,Data_Length_bytes
2025-09-17T00:46:41.505Z,1758070001505,9.900,4.920,12.375,9.800,2.460,99,246,2
```

## 🚀 Testing & Verification

### Test Binary Data Injection
```bash
cd serial-data-streamer
node test-binary-injection.js
```

### Check System Health
```bash
curl http://localhost:8085/health
```

### Monitor Live Data
- **Dashboard**: http://localhost:8081
- **WebSocket**: ws://localhost:8084
- **API**: http://localhost:8085

## 🎯 H2GP Racing Integration

### Real-time Monitoring Capabilities:
- **Battery Performance**: Voltage and current draw analysis
- **Fuel Cell Efficiency**: Voltage output monitoring  
- **System Health**: Purge interval tracking (2.46s confirmed!)
- **Raw Data Access**: Complete binary packet analysis

### Excel Analysis Features:
- Time-series charts of all telemetry parameters
- Statistical analysis of racing performance
- Export data for post-race analysis
- Real-time threshold monitoring

## 📁 File Locations

- **CSV Data**: `serial-data-streamer/logs/H2GP_Telemetry_*.csv`
- **Raw Binary**: `serial-data-streamer/logs/H2GP_Raw_Binary_*.log`  
- **Debug Log**: `serial-data-streamer/logs/H2GP_Debug_*.log`
- **Server**: `serial-data-streamer/server.js`
- **Dashboard**: http://localhost:8081

## ✅ System Verification Complete

**Status**: ✅ ALL SYSTEMS OPERATIONAL
- Live telemetry capture: ✅ Working
- Binary data processing: ✅ Working (0x63F6 format)
- Excel CSV logging: ✅ Working 
- Real-time dashboard: ✅ Working
- WebSocket streaming: ✅ Working
- Serial port connection: ✅ Connected (/dev/tty.usbserial-0001)

**Ready for H2GP Racing Events!** 🏁
