const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

async function testSerial() {
  const baudRates = [9600, 19200, 38400, 57600, 115200];
  const targetPort = '/dev/tty.usbserial-0001';
  
  console.log('🔍 Testing H2GP telemetry box for data...');
  console.log('📡 Make sure the telemetry box is powered on and active!');
  console.log('');
  
  for (const baudRate of baudRates) {
    console.log(`🔌 Testing ${baudRate} baud...`);
    
    try {
      const port = new SerialPort({
        path: targetPort,
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      
      let dataReceived = false;
      
      port.on('open', () => {
        console.log(`  ✅ Port opened at ${baudRate} baud`);
      });

      port.on('error', (err) => {
        console.log(`  ❌ Error: ${err.message}`);
      });

      port.on('data', (data) => {
        dataReceived = true;
        console.log(`  📊 RAW DATA:`, data);
        console.log(`  📝 As string:`, data.toString());
      });

      parser.on('data', (line) => {
        console.log(`  📄 PARSED LINE:`, line);
      });

      // Wait 3 seconds for data
      await new Promise(resolve => {
        setTimeout(() => {
          if (!dataReceived) {
            console.log(`  ⏸️  No data received at ${baudRate} baud`);
          }
          port.close();
          resolve();
        }, 3000);
      });
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🏁 Testing complete');
  console.log('');
  console.log('💡 TROUBLESHOOTING:');
  console.log('   1. Is the H2GP telemetry box powered on?');
  console.log('   2. Is it in active/race mode (not standby)?');
  console.log('   3. Check USB cable connection');
  console.log('   4. Try different USB port');
  console.log('   5. Box might need engine running to send data');
  console.log('   6. Check if box has a start/enable button');
}

testSerial().catch(console.error);
