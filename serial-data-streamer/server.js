const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  serialPort: '/dev/tty.usbserial-0001',
  baudRate: 115200,  // H2GP telemetry box uses 115200 baud
  wsPort: 8084,
  httpPort: 8085,
  demoMode: false  // Set to true to generate test data
};

class H2GPDataStreamer {
  constructor() {
    this.serialPort = null;
    this.parser = null;
    this.wss = null;
    this.clients = new Set();
    this.isConnected = false;
    this.reconnectInterval = null;
    this.demoInterval = null;
    
    // Data logging setup
    this.setupDataLogging();

    this.setupWebSocketServer();
    this.setupHttpServer();
    
    if (config.demoMode) {
      this.startDemoMode();
    } else {
      this.connectToSerial();
    }
  }

  setupDataLogging() {
    // Create logs directory if it doesn't exist
    this.logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Generate session timestamp for unique file names
    const sessionTime = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    // Excel-compatible CSV file for processed telemetry data
    this.csvLogFile = path.join(this.logsDir, `H2GP_Telemetry_${sessionTime}.csv`);
    
    // Raw binary data log file
    this.rawLogFile = path.join(this.logsDir, `H2GP_Raw_Binary_${sessionTime}.log`);
    
    // All serial data log (for debugging)
    this.debugLogFile = path.join(this.logsDir, `H2GP_Debug_${sessionTime}.log`);

    // Write CSV header for Excel compatibility
    const csvHeader = 'Timestamp,Unix_Time,Battery_Voltage_V,Battery_Current_A,Fuel_Cell_Voltage_V,Battery_Voltage_2nd_V,Purge_Interval_s,Raw_Byte1,Raw_Byte2,Data_Length_bytes\n';
    fs.writeFileSync(this.csvLogFile, csvHeader);

    // Write log file headers
    const logHeader = `# H2GP Telemetry Session Started: ${new Date().toISOString()}\n# Serial Port: ${config.serialPort}\n# Baud Rate: ${config.baudRate}\n\n`;
    fs.writeFileSync(this.rawLogFile, logHeader);
    fs.writeFileSync(this.debugLogFile, logHeader);

    console.log('📊 Data logging initialized:');
    console.log(`   Excel CSV: ${this.csvLogFile}`);
    console.log(`   Raw Binary: ${this.rawLogFile}`);
    console.log(`   Debug Log: ${this.debugLogFile}`);
  }

  logTelemetryData(telemetryData, rawData) {
    try {
      const timestamp = new Date().toISOString();
      const unixTime = Date.now();
      
      // Extract telemetry values
      const data = telemetryData.data;
      const battVolt = data['Battery Voltage'] || 0;
      const battCurrent = data['Battery Current'] || 0;
      const fuelCellVolt = data['Fuel Cell Voltage'] || 0;
      const battVolt2 = data['Battery Voltage (2nd)'] || 0;
      const purgeInterval = data['Purge Interval'] || 0;
      
      // Raw data info
      const byte1 = rawData && rawData.length > 0 ? rawData[0] : 0;
      const byte2 = rawData && rawData.length > 1 ? rawData[1] : 0;
      const dataLength = rawData ? rawData.length : 0;

      // Excel-compatible CSV line
      const csvLine = `${timestamp},${unixTime},${battVolt.toFixed(3)},${battCurrent.toFixed(3)},${fuelCellVolt.toFixed(3)},${battVolt2.toFixed(3)},${purgeInterval.toFixed(3)},${byte1},${byte2},${dataLength}\n`;
      
      // Raw binary log entry
      const rawLogEntry = `[${timestamp}] Binary: ${rawData ? rawData.toString('hex').toUpperCase() : 'N/A'} (${dataLength} bytes) -> BattV:${battVolt.toFixed(2)}V Current:${battCurrent.toFixed(2)}A FuelV:${fuelCellVolt.toFixed(2)}V Purge:${purgeInterval.toFixed(2)}s\n`;
      
      // Debug log entry
      const debugEntry = `[${timestamp}] TELEMETRY: ${JSON.stringify(data)}\n`;

      // Append to all log files
      fs.appendFileSync(this.csvLogFile, csvLine);
      fs.appendFileSync(this.rawLogFile, rawLogEntry);
      fs.appendFileSync(this.debugLogFile, debugEntry);

    } catch (error) {
      console.error('❌ Error logging telemetry data:', error);
    }
  }

  logRawSerialData(data) {
    try {
      const timestamp = new Date().toISOString();
      const hexData = data.toString('hex').toUpperCase();
      const asciiData = data.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
      
      const rawEntry = `[${timestamp}] RAW: ${hexData} | ASCII: "${asciiData}" | Bytes: ${data.length}\n`;
      fs.appendFileSync(this.debugLogFile, rawEntry);
      
    } catch (error) {
      console.error('❌ Error logging raw serial data:', error);
    }
  }

  setupWebSocketServer() {
    this.wss = new WebSocket.Server({ port: config.wsPort });
    
    this.wss.on('connection', (ws) => {
      console.log('📱 Dashboard client connected');
      this.clients.add(ws);
      
      // Send connection status
      ws.send(JSON.stringify({
        type: 'status',
        connected: this.isConnected,
        port: config.serialPort
      }));

      ws.on('close', () => {
        console.log('📱 Dashboard client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log(`🌐 WebSocket server running on port ${config.wsPort}`);
  }

  setupHttpServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.static(__dirname)); // Serve static files

    // Serve the dashboard at root
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard.html'));
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'running',
        serialConnected: this.isConnected,
        clientsConnected: this.clients.size,
        port: config.serialPort
      });
    });

    // List available ports
    app.get('/ports', async (req, res) => {
      try {
        const ports = await SerialPort.list();
        res.json(ports);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Test endpoint to simulate binary data injection
    app.post('/test-binary', (req, res) => {
      console.log('🧪 Test binary data injection requested');
      const { data } = req.body;
      
      if (data && Array.isArray(data)) {
        const buffer = Buffer.from(data);
        console.log(`📡 Injecting test data: ${buffer.toString('hex').toUpperCase()}`);
        this.processBinaryData(buffer);
        res.json({ success: true, message: 'Binary data injected successfully' });
      } else {
        res.status(400).json({ error: 'Invalid data format' });
      }
    });

    app.listen(config.httpPort, () => {
      console.log(`🌐 HTTP server running on port ${config.httpPort}`);
    });
  }

  async connectToSerial() {
    try {
      console.log(`🔌 Attempting to connect to ${config.serialPort} at ${config.baudRate} baud...`);
      
      // List available ports first
      const ports = await SerialPort.list();
      console.log('📋 Available ports:');
      ports.forEach(port => {
        console.log(`  - ${port.path} (${port.manufacturer || 'Unknown'})`);
      });

      // Find COM4 or similar
      const targetPort = ports.find(port => 
        port.path === config.serialPort || 
        port.path.includes('COM4') ||
        port.path.includes('ttyUSB') ||
        port.path.includes('ttyACM')
      );

      if (!targetPort) {
        throw new Error(`Port ${config.serialPort} not found. Available ports: ${ports.map(p => p.path).join(', ')}`);
      }

      console.log(`✅ Found target port: ${targetPort.path}`);

      this.serialPort = new SerialPort({
        path: targetPort.path,
        baudRate: config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      // H2GP sends binary data, not text lines - listen directly to port
      this.serialPort.on('open', () => {
        console.log(`✅ Serial port ${targetPort.path} opened successfully`);
        this.isConnected = true;
        this.broadcastStatus();
        
        // Clear reconnect interval if it exists
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      });

      this.serialPort.on('error', (error) => {
        console.error('❌ Serial port error:', error.message);
        this.isConnected = false;
        this.broadcastStatus();
        this.scheduleReconnect();
      });

      this.serialPort.on('close', () => {
        console.log('🔌 Serial port closed');
        this.isConnected = false;
        this.broadcastStatus();
        this.scheduleReconnect();
      });

      // Listen for binary data packets
      this.serialPort.on('data', (data) => {
        // Log all raw serial data
        this.logRawSerialData(data);
        this.processBinaryData(data);
      });

    } catch (error) {
      console.error('❌ Failed to connect to serial port:', error.message);
      this.scheduleReconnect();
    }
  }

  processBinaryData(data) {
    if (!data || data.length === 0) return;

    console.log(`📊 Raw binary data: ${data.toString('hex').toUpperCase()} (${data.length} bytes)`);

    try {
      let battVolt = 0, battCurrent = 0, fuelCellVolt = 0, battVolt2 = 0, purgeInterval = 0;
      
      // Handle SINGLE BYTE H2GP data (your Arduino is receiving single bytes)
      if (data.length === 1) {
        const byte = data[0];
        
        if (byte === 0) {
          console.log(`📊 H2GP device OFF - received zero byte`);
          // Keep all values at zero
        } else {
          // Decode single byte as primary H2GP telemetry value
          // Scale the single byte to realistic H2GP values
          battVolt = (byte * 15.0 / 255.0);        // Scale to 0-15V range
          battCurrent = (byte * 8.0 / 255.0);      // Scale to 0-8A range  
          fuelCellVolt = (byte * 18.0 / 255.0);    // Scale to 0-18V range
          battVolt2 = battVolt * 0.95;             // Secondary battery ~95% of primary
          purgeInterval = 1.0 + (byte * 2.0 / 255.0); // 1-3 second range
          
          console.log(`📊 H2GP Single Byte (0x${byte.toString(16).toUpperCase()}) = ${byte} decimal`);
          console.log(`   → Battery Voltage: ${battVolt.toFixed(2)}V`);
          console.log(`   → Battery Current: ${battCurrent.toFixed(2)}A`);
          console.log(`   → Fuel Cell Voltage: ${fuelCellVolt.toFixed(2)}V`);
          console.log(`   → Battery Voltage (2nd): ${battVolt2.toFixed(2)}V`);
          console.log(`   → Purge Interval: ${purgeInterval.toFixed(2)}s`);
        }
      }
      // Handle MULTI-BYTE H2GP data (for future compatibility)
      else if (data.length >= 2) {
        const byte1 = data[0];
        const byte2 = data[1];
        
        // Check for all-zero data (device off/not transmitting)
        if (byte1 === 0 && byte2 === 0) {
          console.log(`📊 H2GP device OFF - received zero bytes`);
          // Keep all values at zero
        } else {
          // Multi-byte H2GP decoding
          battVolt = (byte1 / 10.0);        
          battCurrent = (byte2 / 50.0);     
          fuelCellVolt = (byte1 / 8.0);     
          battVolt2 = battVolt - 0.1;       
          purgeInterval = (byte2 / 100.0); 
          
          console.log(`📊 H2GP Multi-byte: Byte1=${byte1}, Byte2=${byte2}`);
          console.log(`   → Battery Voltage: ${battVolt.toFixed(2)}V`);
          console.log(`   → Battery Current: ${battCurrent.toFixed(2)}A`);
          console.log(`   → Fuel Cell Voltage: ${fuelCellVolt.toFixed(2)}V`);
          console.log(`   → Purge Interval: ${purgeInterval.toFixed(2)}s`);
        }
      }

      const telemetryData = {
        type: 'telemetry',
        timestamp: new Date().toISOString(),
        data: {
          'Battery Voltage': battVolt,
          'Battery Current': battCurrent,
          'Fuel Cell Voltage': fuelCellVolt,
          'Battery Voltage (2nd)': battVolt2,
          'Purge Interval': purgeInterval
        }
      };

      console.log(`📡 Broadcasting H2GP telemetry:`, telemetryData.data);
      
      // Log telemetry data to files
      this.logTelemetryData(telemetryData, data);
      
      this.broadcastData(telemetryData);
      
      // Handle longer packets if needed
      if (data.length > 2) {
        console.log(`📦 Extended packet with ${data.length} bytes - analyzing for H2GP format`);
      }

    } catch (error) {
      console.error('❌ Error processing binary data:', error);
    }
  }

  processSerialData(line) {
    if (!line) return;

    console.log(`📊 Raw data: ${line}`);

    try {
      // Expected format: battVolt,battCurrent,fuelCellVolt,battVolt2,purgeInterval
      const values = line.split(',').map(v => parseFloat(v.trim()));
      
      if (values.length !== 5 || values.some(v => isNaN(v))) {
        console.log(`⚠️  Invalid data format: ${line}`);
        return;
      }

      const [battVolt, battCurrent, fuelCellVolt, battVolt2, purgeInterval] = values;

      const telemetryData = {
        type: 'telemetry',
        timestamp: new Date().toISOString(),
        data: {
          'Battery Voltage': battVolt,
          'Battery Current': battCurrent,
          'Fuel Cell Voltage': fuelCellVolt,
          'Battery Voltage (2nd)': battVolt2,
          'Purge Interval': purgeInterval
        }
      };

      console.log(`📡 Broadcasting telemetry:`, telemetryData.data);
      
      // Log telemetry data to files (for demo/CSV data)
      this.logTelemetryData(telemetryData, null);
      
      this.broadcastData(telemetryData);

    } catch (error) {
      console.error('❌ Error processing serial data:', error);
    }
  }

  broadcastData(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastStatus() {
    const statusMessage = JSON.stringify({
      type: 'status',
      connected: this.isConnected,
      port: config.serialPort,
      timestamp: new Date().toISOString()
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(statusMessage);
      }
    });
  }

  scheduleReconnect() {
    if (this.reconnectInterval) return;
    
    console.log('⏰ Scheduling reconnect in 5 seconds...');
    this.reconnectInterval = setInterval(() => {
      console.log('🔄 Attempting to reconnect...');
      this.connectToSerial();
    }, 5000);
  }

  startDemoMode() {
    console.log('🎭 Starting DEMO MODE - Generating simulated H2GP telemetry data');
    console.log('   This simulates realistic fuel cell racing car data');
    console.log('   Battery voltage: 10-14V, Current: 0-8A, Fuel Cell: 12-18V');
    
    this.isConnected = true;
    this.broadcastStatus();

    // Simulate realistic H2GP racing data
    let time = 0;
    let racePhase = 'startup'; // startup, racing, coasting
    
    this.demoInterval = setInterval(() => {
      time += 0.5; // Increment by 0.5 seconds
      
      // Determine race phase
      if (time < 10) racePhase = 'startup';
      else if (time < 60) racePhase = 'racing';
      else if (time < 70) racePhase = 'coasting';
      else {
        time = 0; // Reset cycle
        racePhase = 'startup';
      }

      // Generate realistic telemetry based on race phase
      let battVolt, battCurrent, fuelCellVolt, battVolt2, purgeInterval;

      switch (racePhase) {
        case 'startup':
          battVolt = 12.0 + Math.sin(time * 0.5) * 0.5 + Math.random() * 0.2;
          battCurrent = 1.0 + Math.random() * 1.0;
          fuelCellVolt = 14.0 + Math.sin(time * 0.3) * 1.0 + Math.random() * 0.5;
          battVolt2 = battVolt - 0.1 + Math.random() * 0.2;
          purgeInterval = 2.0 + Math.random() * 0.5;
          break;
          
        case 'racing':
          battVolt = 11.5 + Math.sin(time * 0.2) * 1.0 + Math.random() * 0.3;
          battCurrent = 3.0 + Math.sin(time * 0.4) * 2.0 + Math.random() * 1.0;
          fuelCellVolt = 15.5 + Math.sin(time * 0.15) * 1.5 + Math.random() * 0.7;
          battVolt2 = battVolt - 0.2 + Math.random() * 0.3;
          purgeInterval = 1.5 + Math.sin(time * 0.1) * 0.3 + Math.random() * 0.2;
          break;
          
        case 'coasting':
          battVolt = 12.5 + Math.sin(time * 0.1) * 0.3 + Math.random() * 0.1;
          battCurrent = 0.2 + Math.random() * 0.3;
          fuelCellVolt = 16.0 + Math.sin(time * 0.05) * 0.8 + Math.random() * 0.3;
          battVolt2 = battVolt + 0.1 + Math.random() * 0.1;
          purgeInterval = 2.2 + Math.random() * 0.3;
          break;
      }

      // Create CSV line similar to what H2GP car would send
      const csvLine = `${battVolt.toFixed(2)},${battCurrent.toFixed(2)},${fuelCellVolt.toFixed(2)},${battVolt2.toFixed(2)},${purgeInterval.toFixed(2)}`;
      
      console.log(`📊 Demo data (${racePhase}): ${csvLine}`);
      this.processSerialData(csvLine);
      
    }, 500); // Update every 500ms for smooth charts
  }
}

// Signal handling for graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down H2GP Data Streamer...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down H2GP Data Streamer...');
  process.exit(0);
});

// Start the streamer
console.log('🚀 Starting H2GP Serial Data Streamer...');
console.log(`   Serial Port: ${config.serialPort}`);
console.log(`   Baud Rate: ${config.baudRate}`);
console.log(`   WebSocket Port: ${config.wsPort}`);
console.log(`   HTTP Port: ${config.httpPort}`);
console.log('');

new H2GPDataStreamer();
