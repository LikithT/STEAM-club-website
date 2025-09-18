const { SerialPort } = require('serialport');

async function monitorRawData() {
  const targetPort = '/dev/tty.usbserial-0001';
  
  console.log('🔍 Monitoring raw H2GP telemetry data...');
  console.log('📡 This will show ALL data received from the telemetry box');
  console.log('');
  
  try {
    const port = new SerialPort({
      path: targetPort,
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

    let byteCount = 0;
    let dataBuffer = Buffer.alloc(0);
    
    port.on('open', () => {
      console.log('✅ Port opened - monitoring live H2GP data...');
      console.log('📊 Format: [Byte Count] HEX | ASCII | Interpreted');
      console.log('─'.repeat(70));
    });

    port.on('error', (err) => {
      console.error('❌ Port error:', err.message);
    });

    port.on('data', (data) => {
      byteCount += data.length;
      dataBuffer = Buffer.concat([dataBuffer, data]);
      
      console.log(`📊 [${byteCount.toString().padStart(4, '0')}] ${data.toString('hex').toUpperCase().padEnd(20)} | ${data.toString().replace(/[^\x20-\x7E]/g, '·').padEnd(10)} | ${data.toString()}`);
      
      // Try to interpret as different formats
      if (data.length >= 4) {
        console.log(`   → As 16-bit values: ${Array.from(data).map(b => b.toString().padStart(3, ' ')).join(' ')}`);
        
        // Try to find patterns
        if (data.includes(0x0D) || data.includes(0x0A)) {
          console.log('   → Contains line ending (CR/LF)');
        }
        
        if (data.includes(0x2C)) {
          console.log('   → Contains comma (CSV separator)');
        }
      }
      
      console.log('');
      
      // Keep buffer manageable
      if (dataBuffer.length > 1000) {
        dataBuffer = dataBuffer.slice(-500);
      }
    });

    // Auto-close after 30 seconds
    setTimeout(() => {
      console.log('\n⏰ Monitoring complete. Closing port...');
      port.close();
      process.exit(0);
    }, 30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

monitorRawData();
