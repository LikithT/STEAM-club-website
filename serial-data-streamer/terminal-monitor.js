const { SerialPort } = require('serialport');

console.log('🔍 LIVE COM PORT MONITOR - /dev/cu.usbserial-0001');
console.log('📡 This will print EVERYTHING received from the H2GP device');
console.log('═'.repeat(80));

async function startMonitor() {
  try {
    console.log('🔌 Opening serial port...');
    
    const port = new SerialPort({
      path: '/dev/cu.usbserial-0001',
      baudRate: 115200,  // Standard H2GP baud rate
      dataBits: 8,       // Standard 8 bits
      stopBits: 1,       // Standard 1 stop bit
      parity: 'none'     // Standard no parity
    });

    port.on('open', () => {
      console.log('✅ Port opened - monitoring live data...');
      console.log('⏰ Press Ctrl+C to stop monitoring');
      console.log('─'.repeat(80));
    });

    port.on('error', (error) => {
      console.error('❌ Port error:', error.message);
      process.exit(1);
    });

    // Listen for ANY data - raw bytes
    port.on('data', (data) => {
      const timestamp = new Date().toISOString();
      const hexString = data.toString('hex').toUpperCase();
      const asciiString = data.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
      const csvString = data.toString('utf8').trim();
      
      console.log(`[${timestamp}]`);
      console.log(`  📊 RAW BYTES: ${data.length} bytes -> ${hexString}`);
      console.log(`  📝 ASCII: "${asciiString}"`);
      console.log(`  📄 UTF8: "${csvString}"`);
      
      // Interpret as H2GP telemetry values
      if (data.length >= 2) {
        const byte1 = data[0];
        const byte2 = data[1];
        
        // H2GP telemetry calculation
        const batteryVoltage = (byte1 * 0.1).toFixed(2);
        const batteryCurrent = (byte2 * 0.02).toFixed(2);
        const fuelCellVoltage = ((byte1 + byte2) * 0.05).toFixed(3);
        const batteryVoltage2nd = ((byte1 - 1) * 0.1).toFixed(1);
        const purgeInterval = (byte2 * 0.01).toFixed(2);
        
        console.log(`  🔋 H2GP VALUES:`);
        console.log(`    Battery Voltage: ${batteryVoltage}V`);
        console.log(`    Battery Current: ${batteryCurrent}A`);
        console.log(`    Fuel Cell Voltage: ${fuelCellVoltage}V`);
        console.log(`    Battery Voltage (2nd): ${batteryVoltage2nd}V`);
        console.log(`    Purge Interval: ${purgeInterval}s`);
      }
      
      // Check if it looks like CSV data
      if (csvString.includes(',') && !csvString.includes('\x00')) {
        console.log(`  💡 LOOKS LIKE CSV: ${csvString}`);
      }
      
      // Check if it's all zeros (device off)
      const isAllZeros = data.every(byte => byte === 0);
      if (isAllZeros) {
        console.log(`  ⚠️  ALL ZEROS - Device appears OFF`);
        console.log(`  🔋 H2GP VALUES: All 0.00 (Device OFF)`);
      }
      
      console.log('─'.repeat(80));
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitor...');
      port.close(() => {
        console.log('✅ Port closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start monitor:', error.message);
    process.exit(1);
  }
}

startMonitor();
