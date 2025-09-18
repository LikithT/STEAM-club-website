# 🍎 Mac H2GP Data Streaming Guide

**Complete Excel Data Streamer Alternative for macOS**

This guide provides a comprehensive Mac-compatible solution for real-time H2GP fuel cell racing car telemetry visualization and analysis, replacing Microsoft Excel Data Streamer functionality.

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Real-Time Dashboard](#real-time-dashboard)
6. [Data Analysis](#data-analysis)
7. [Export & Reporting](#export--reporting)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)

## 🎯 Overview

### What This Solution Provides

- **🔄 Real-time telemetry streaming** from Arduino H2GP systems
- **📊 Interactive dashboards** with live data visualization
- **📈 Advanced plotting** using Plotly for professional charts
- **💾 Automated CSV logging** for race data preservation
- **📤 Export capabilities** for race reports and analysis
- **🔌 WebSocket streaming** for low-latency data transmission

### Why Use This Instead of Excel Data Streamer?

✅ **Native Mac compatibility** - No Windows emulation required  
✅ **Superior visualization** - Interactive plots with zoom, pan, hover  
✅ **Real-time performance** - WebSocket streaming for minimal latency  
✅ **Professional analysis** - Pandas, NumPy, and Plotly integration  
✅ **Customizable dashboards** - Jupyter notebook flexibility  
✅ **Race-ready features** - Designed specifically for H2GP telemetry  

## 🖥️ System Requirements

### Hardware
- **Mac** (Intel or Apple Silicon)
- **USB port** for Arduino connection
- **4GB RAM minimum** (8GB recommended)
- **1GB free disk space**

### Software
- **macOS 10.15+** (Catalina or newer)
- **Homebrew** package manager
- **Node.js 18+** (for data streaming server)
- **Python 3.8+** (for Jupyter analysis)

## 🚀 Installation

### Step 1: Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js and Python
```bash
# Install Node.js
brew install node

# Install Python (if needed)
brew install python@3.11

# Verify installations
node --version  # Should show v18+ 
python3 --version  # Should show 3.8+
```

### Step 3: Set Up H2GP Data Streaming
```bash
# Navigate to your project directory
cd serial-data-streamer

# Install Node.js dependencies
npm install

# Create Python virtual environment
python3 -m venv h2gp_jupyter_env

# Activate virtual environment
source h2gp_jupyter_env/bin/activate

# Install Python packages
pip install pandas matplotlib seaborn plotly websocket-client ipywidgets jupyter
```

### Step 4: Verify Installation
```bash
# Test the data streaming server
node server.js

# In another terminal, test Jupyter
source h2gp_jupyter_env/bin/activate
jupyter --version
```

## 🎯 Quick Start

### 1. Connect Your H2GP System
```bash
# Connect Arduino via USB
# Note the port (usually /dev/cu.usbmodem* or /dev/cu.usbserial*)
ls /dev/cu.*

# Update server.js with correct port if needed
# const SERIAL_PORT = '/dev/cu.usbmodem101';
```

### 2. Start Data Streaming
```bash
cd serial-data-streamer
node server.js
```

You should see:
```
🚀 H2GP Data Streaming Server Starting...
✅ Serial port connected: /dev/cu.usbmodem101
🌐 WebSocket server running on ws://localhost:8084
📊 Real-time dashboard: http://localhost:3000
```

### 3. Launch Jupyter Dashboard
```bash
# In a new terminal
cd serial-data-streamer
source h2gp_jupyter_env/bin/activate
jupyter notebook H2GP_Real_Time_Dashboard.ipynb
```

### 4. View Real-Time Data
- **Web Dashboard**: Open http://localhost:3000
- **Jupyter Notebook**: Follow the cells in sequence
- **CSV Logs**: Check `logs/` directory for saved data

## 📊 Real-Time Dashboard

### Web Interface Features

#### Main Dashboard (http://localhost:3000)
- **Live telemetry display** with automatic updates
- **Connection status** indicators
- **Data logging** controls
- **Export buttons** for immediate data download

#### Key Metrics Displayed
- **Battery Voltage** - Primary power source monitoring
- **Fuel Cell Voltage** - Hydrogen system output
- **Battery Current** - Power consumption tracking
- **Purge Interval** - System maintenance timing
- **Calculated Power** - Real-time wattage (V × I)

### Jupyter Notebook Dashboard

#### Interactive Features
- **Zoom and pan** on all plots
- **Hover details** for precise data points
- **Live updates** every 3 seconds
- **Historical analysis** of CSV logs
- **Export controls** for race reports

#### Dashboard Sections
1. **Real-time streaming** plots
2. **System overview** with power calculations
3. **Performance metrics** summary
4. **Historical data** analysis
5. **Export and reporting** tools

## 📈 Data Analysis

### Automatic CSV Logging

All telemetry data is automatically saved to CSV files:
```
logs/H2GP_Telemetry_YYYY-MM-DDTHH-MM-SS.csv
```

#### CSV Format
```csv
Timestamp,Battery_Voltage_V,Battery_Current_A,Fuel_Cell_Voltage_V,Battery_Voltage_2nd_V,Purge_Interval_s
2025-09-16T18:30:15.123Z,12.45,2.3,8.7,12.44,15.0
```

### Performance Analysis Features

#### Jupyter Notebook Analysis
- **Load historical data** from CSV files
- **Calculate performance metrics** (power, energy, efficiency)
- **Generate trend analysis** plots
- **Identify optimization opportunities**
- **Create race comparison** charts

#### Key Metrics Calculated
- **Maximum Power Output** (W)
- **Average Battery Voltage** (V)
- **Current Draw Patterns** (A)
- **Fuel Cell Efficiency** trends
- **System Stability** analysis

### Advanced Analytics

#### Performance Optimization
```python
# Example analysis in Jupyter
df['Power_W'] = df['Battery_Voltage_V'] * df['Battery_Current_A']
df['Efficiency'] = df['Fuel_Cell_Voltage_V'] / df['Battery_Voltage_V']

# Find peak performance periods
peak_power = df[df['Power_W'] > df['Power_W'].quantile(0.9)]
```

## 📤 Export & Reporting

### Automated Reports

#### CSV Export
- **Processed data** with calculated metrics
- **Summary statistics** in separate file
- **Race-ready format** for further analysis

#### JSON Summary
```json
{
  "Race_Date": "20250916_183015",
  "Total_Records": 1247,
  "Max_Power_W": 28.635,
  "Avg_Battery_V": 12.341,
  "Avg_Current_A": 2.156,
  "Max_Fuel_Cell_V": 9.234,
  "Min_Fuel_Cell_V": 7.891
}
```

### Report Generation

#### Race Performance Report
- **Executive summary** with key metrics
- **Performance charts** (voltage, current, power)
- **System health** indicators
- **Optimization recommendations**

#### Export Commands
```python
# In Jupyter notebook
export_h2gp_report(race_data, "MyRace_2025")
```

## 🔧 Troubleshooting

### Common Issues

#### Serial Port Connection
```bash
# Issue: Port not found
# Solution: Check USB connection and permissions
ls -la /dev/cu.*
sudo chmod 666 /dev/cu.usbmodem*
```

#### WebSocket Connection
```bash
# Issue: Connection refused
# Solution: Ensure server is running
lsof -i :8084  # Check if port is in use
node server.js  # Restart server
```

#### Jupyter Issues
```bash
# Issue: Kernel won't start
# Solution: Recreate virtual environment
rm -rf h2gp_jupyter_env
python3 -m venv h2gp_jupyter_env
source h2gp_jupyter_env/bin/activate
pip install pandas matplotlib seaborn plotly websocket-client ipywidgets jupyter
```

#### Data Not Appearing
1. **Check Arduino connection** - Verify USB cable and port
2. **Verify data format** - Ensure Arduino sends JSON
3. **Check WebSocket** - Confirm ws://localhost:8084 is accessible
4. **Review server logs** - Look for parsing errors

### Port Configuration

#### Find Arduino Port
```bash
# Before connecting Arduino
ls /dev/cu.* 

# After connecting Arduino (new port should appear)
ls /dev/cu.*

# Common port patterns:
# /dev/cu.usbmodem* - Arduino Uno/Nano
# /dev/cu.usbserial* - Generic USB-Serial
```

#### Update Server Configuration
```javascript
// In server.js, update this line:
const SERIAL_PORT = '/dev/cu.usbmodem101';  // Your actual port
```

### Performance Optimization

#### For Better Performance
- **Close unused applications** to free memory
- **Use wired connection** for Arduino (avoid wireless)
- **Adjust data rate** in Arduino code if needed
- **Limit dashboard update frequency** if system is slow

## 🔬 Advanced Features

### Custom Data Processing

#### Arduino Data Format
```cpp
// Expected JSON format from Arduino:
{
  "battery_voltage": 12.45,
  "battery_current": 2.30,
  "fuel_cell_voltage": 8.70,
  "battery_voltage_2nd": 12.44,
  "purge_interval": 15.0
}
```

#### Server Customization
```javascript
// Add custom metrics in server.js
function processData(data) {
  data.power = data.battery_voltage * data.battery_current;
  data.efficiency = data.fuel_cell_voltage / data.battery_voltage;
  return data;
}
```

### Integration Options

#### External APIs
- **Cloud storage** for race data backup
- **Team communication** via Slack/Discord webhooks
- **Race timing systems** integration
- **Weather data** correlation

#### Custom Dashboards
- **Grafana integration** for professional monitoring
- **Custom web interfaces** using the WebSocket feed
- **Mobile apps** connecting to the data stream
- **Big screen displays** for pit crew monitoring

### Competition Features

#### Race Day Setup
1. **Pre-race testing** - Verify all connections
2. **Data validation** - Check sensor accuracy
3. **Backup systems** - Multiple logging methods
4. **Team access** - Share WebSocket URL for remote monitoring

#### Real-Time Strategy
- **Performance alerts** for critical thresholds
- **Fuel cell optimization** based on live data
- **Battery management** strategies
- **Pit stop timing** based on telemetry

## 🏁 Competition Compliance

### Data Requirements
- **Timestamp accuracy** - Millisecond precision
- **Sensor validation** - Cross-reference multiple sources  
- **Data integrity** - Checksums and validation
- **Export standards** - Compatible with race officials

### Privacy & Security
- **Local processing** - No cloud dependencies required
- **Secure connections** - WebSocket authentication options
- **Data ownership** - All data stays on your Mac
- **Access control** - Team-based permissions

## 📞 Support

### Getting Help
- **GitHub Issues** - Report bugs or request features
- **Documentation** - This guide and inline comments
- **Community** - H2GP racing forums and Discord
- **Direct Support** - Contact development team

### Contributing
- **Bug reports** - Help improve the system
- **Feature requests** - Suggest new capabilities
- **Code contributions** - Submit pull requests
- **Testing** - Help validate on different Mac systems

---

## 🎉 Success! 

You now have a complete Mac-compatible alternative to Excel Data Streamer for H2GP telemetry analysis. This solution provides professional-grade real-time visualization, comprehensive data analysis, and race-ready reporting capabilities.

**Happy Racing! 🏎️💨**
