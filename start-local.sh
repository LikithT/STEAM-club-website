#!/bin/bash

# Heritage H2GP STEAM Website - Local Development Script
echo "🚀 Starting Heritage H2GP STEAM Website locally..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found - Starting local server..."
    echo "🌐 Website will be available at: http://localhost:8000"
    echo "📱 Mobile testing: http://$(ipconfig getifaddr en0):8000 (if on same network)"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python found - Starting local server..."
    echo "🌐 Website will be available at: http://localhost:8000"
    echo "📱 Mobile testing: http://$(ipconfig getifaddr en0):8000 (if on same network)"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    python -m http.server 8000
else
    echo "❌ Python not found. Please install Python or use one of these alternatives:"
    echo ""
    echo "Option 1: Install Python"
    echo "  brew install python3  (if you have Homebrew)"
    echo ""
    echo "Option 2: Use Node.js (if installed)"
    echo "  npx http-server -p 8000"
    echo ""
    echo "Option 3: Use PHP (if installed)"
    echo "  php -S localhost:8000"
    echo ""
    echo "Option 4: Open index.html directly in your browser"
    echo "  open index.html"
fi
