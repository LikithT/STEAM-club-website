# Local Development Guide - Heritage H2GP STEAM Website

## Quick Start (Recommended)

### For macOS/Linux:
```bash
./start-local.sh
```

### For Windows:
```cmd
start-local.bat
```

Then open your browser to: **http://localhost:8000**

---

## Manual Setup Options

### Option 1: Python HTTP Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Python 2 (if Python 3 not available)
python -m http.server 8000
```

### Option 2: Node.js HTTP Server
```bash
# Install globally (one time)
npm install -g http-server

# Run server
http-server -p 8000

# Or use npx (no installation needed)
npx http-server -p 8000
```

### Option 3: PHP Built-in Server
```bash
php -S localhost:8000
```

### Option 4: Direct File Opening
Simply double-click `index.html` or drag it to your browser.
*Note: Some features may not work due to CORS restrictions.*

---

## What You'll Get Locally

### ✅ Full Website Features
- **Interactive Hero Section** with 3D animations
- **Team Information** and achievements
- **Project Showcase** with hydrogen car details
- **Photo Gallery** with drag & drop upload
- **Contact Information** and social links

### ✅ Attendance System
- Access via "Attendance" in navigation
- Secret code: **"Pagani"** (for admin access)
- Student check-in functionality
- Excel export for attendance records

### ✅ 3D Model Viewer
- Interactive STL model viewing
- Hydrogen car 3D models
- Zoom, rotate, and inspect functionality

---

## Testing Different Devices

### Mobile Testing
If on the same WiFi network, access from mobile devices using:
```
http://YOUR_COMPUTER_IP:8000
```

To find your IP:
- **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig | findstr IPv4`
- **Linux**: `hostname -I`

### Browser Testing
Test in multiple browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

---

## Features to Test

### 🎯 Core Functionality
- [ ] Navigation menu (desktop & mobile)
- [ ] Hero section animations
- [ ] Smooth scrolling between sections
- [ ] Responsive design on different screen sizes

### 📸 Photo System
- [ ] Drag & drop photo upload
- [ ] Photo categorization
- [ ] Modal photo viewing
- [ ] Photo deletion
- [ ] Category filtering

### 📋 Attendance System
- [ ] Access attendance page from navigation
- [ ] Student check-in process
- [ ] Admin login with "Pagani" code
- [ ] View attendance records
- [ ] Excel export functionality

### 🚗 3D Models
- [ ] STL model loading
- [ ] 3D model interaction (zoom, rotate)
- [ ] Model information display

---

## Troubleshooting

### Port Already in Use
If port 8000 is busy, try:
```bash
python3 -m http.server 8080
# Then visit http://localhost:8080
```

### Python Not Found
1. **Install Python**: https://www.python.org/downloads/
2. **Use Node.js**: `npx http-server -p 8000`
3. **Use PHP**: `php -S localhost:8000`
4. **Direct file**: Open `index.html` in browser

### CORS Issues
If opening `index.html` directly causes issues:
- Use any of the server options above
- CORS restrictions prevent some features from working with `file://` protocol

### 3D Models Not Loading
- Ensure you're using a server (not direct file opening)
- Check browser console for errors
- Verify STL files exist in `assets/models/` folder

---

## Development Tips

### Making Changes
1. Edit HTML, CSS, or JavaScript files
2. Save changes
3. Refresh browser (Ctrl+R / Cmd+R)
4. Changes appear immediately

### Browser Developer Tools
- **F12** or **Ctrl+Shift+I** (Windows/Linux)
- **Cmd+Option+I** (macOS)
- Use Console tab to see any JavaScript errors

### Mobile Simulation
Use browser dev tools:
1. Open Developer Tools (F12)
2. Click device icon (mobile/tablet view)
3. Select different device sizes

---

## Next Steps

After local testing, you can:
1. **Deploy to Netlify**: Push changes to GitHub (auto-deploys)
2. **Share locally**: Use your IP address for same-network access
3. **Make modifications**: Edit files and test changes immediately

---

## Live Website
The production version is available at: https://heritage-h2gp-steam.netlify.app

Compare your local version with the live site to ensure everything works correctly before deploying changes.
