const { SerialPort } = require('serialport');

console.log('🔍 Quick H2GP Data Monitor - Checking for telemetry data...');
console.log('📡 Listening on /dev/tty.usbserial-0001 for 5 seconds');
console.log('════════════════════════════════════════════════════════════════');

const port = new SerialPort({
  path: '/dev/tty.usbserial-0001',
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});

let dataReceived = false;
let dataCount = 0;

port.on('open', () => {
  console.log('✅ Port opened - monitoring live data...');
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (!dataReceived) {
      console.log('');
      console.log('❌ NO DATA RECEIVED in 5 seconds');
      console.log('💡 Possible issues:');
      console.log('   - H2GP telemetry device is powered OFF');
      console.log('   - Arduino receiver not getting signal');
      console.log('   - Wrong baud rate or connection');
      console.log('   - Device transmitting on different frequency');
    } else {
      console.log('');
      console.log(`✅ Received ${dataCount} data packets from H2GP device`);
    }
    process.exit(0);
  }, 5000);
});

port.on('data', (data) => {
  dataReceived = true;
  dataCount++;
  
  const timestamp = new Date().toISOString();
  const hexData = data.toString('hex').toUpperCase();
  const asciiData = data.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
  
  console.log(`[${timestamp}]`);
  console.log(`  📊 RAW BYTES: ${data.length} bytes -> ${hexData}`);
  console.log(`  📝 ASCII: "${asciiData}"`);
  
  // Try to decode as H2GP values
  if (data.length >= 2) {
    const byte1 = data[0];
    const byte2 = data[1];
    
    // Decode potential H2GP values
    const battVolt = (byte1 / 10.0);
    const battCurrent = (byte2 / 50.0);
    const fuelCellVolt = (byte1 / 8.0);
    const battVolt2 = battVolt - 0.1;
    const purgeInterval = (byte2 / 100.0);
    
    console.log(`  🔋 H2GP VALUES:`);
    console.log(`    Battery Voltage: ${battVolt.toFixed(2)}V`);
    console.log(`    Battery Current: ${battCurrent.toFixed(2)}A`);
    console.log(`    Fuel Cell Voltage: ${fuelCellVolt.toFixed(3)}V`);
    console.log(`    Battery Voltage (2nd): ${battVolt2.toFixed(1)}V`);
    console.log(`    Purge Interval: ${purgeInterval.toFixed(2)}s`);
  }
  console.log('────────────────────────────────────────────────────────────────');
});

port.on('error', (error) => {
  console.error('❌ Serial port error:', error.message);
  process.exit(1);
});
