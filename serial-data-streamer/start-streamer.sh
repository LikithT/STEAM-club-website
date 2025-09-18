#!/bin/bash

echo "🚀 Starting H2GP Serial Data Streamer..."
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")"
node server.js
