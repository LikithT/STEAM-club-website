const WebSocket = require('ws');

// Test script to inject binary data similar to what H2GP telemetry box sends
console.log('🧪 Testing binary data injection...');

// Connect to our server's WebSocket
const ws = new WebSocket('ws://localhost:8084');

ws.on('open', () => {
  console.log('✅ Connected to data streamer WebSocket');
  
  // Simulate the binary data we detected: 0x63F6
  const testData = Buffer.from([0x63, 0xF6]);
  
  console.log(`📡 Injecting test binary data: ${testData.toString('hex').toUpperCase()}`);
  
  // We need to simulate this data coming from the serial port
  // Let's create a direct HTTP call to test our processing
  const http = require('http');
  
  const postData = JSON.stringify({
    type: 'test_binary',
    data: Array.from(testData)
  });

  const options = {
    hostname: 'localhost',
    port: 8085,
    path: '/test-binary',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();

  setTimeout(() => {
    console.log('🏁 Test complete');
    process.exit(0);
  }, 2000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('📊 Received WebSocket message:', message);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});
