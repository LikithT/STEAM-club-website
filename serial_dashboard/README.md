# Heritage H2GP Serial Dashboard

A real-time telemetry dashboard for the Heritage H2GP hydrogen fuel cell vehicle, built with Flutter Web.

## Features

- **Real-time Data Visualization**: Live charts for 5 key telemetry channels
- **Web Serial API Support**: Direct connection to serial devices in Chrome/Edge browsers
- **Mock Data Mode**: Fallback simulation when no serial device is connected
- **Responsive Design**: Works on desktop and tablet devices
- **Professional UI**: Clean, modern interface with dark/light theme support

## Telemetry Channels

1. **Battery Voltage** - Main battery voltage monitoring
2. **Battery Current** - Current draw from battery
3. **Fuel Cell Voltage** - Hydrogen fuel cell output voltage
4. **Battery Voltage (2nd)** - Secondary battery voltage
5. **Purge Interval** - Fuel cell purging cycle timing

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Chrome or Edge browser (for Web Serial API support)
- Serial device with CSV data format: `battVolt,battCurrent,fuelCellVolt,battVolt2,purgeInterval`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run in development mode:
   ```bash
   flutter run -d web-server --web-port=8080
   ```

4. Build for production:
   ```bash
   flutter build web --release
   ```

### Serial Data Format

The dashboard expects CSV data in this format:
```
12.4,2.3,0.85,12.5,30.2
12.3,2.4,0.86,12.4,29.8
```

Where the fields are:
- Battery Voltage (V)
- Battery Current (A) 
- Fuel Cell Voltage (V)
- Battery Voltage 2nd (V)
- Purge Interval (s)

## Deployment

The built web application is in `build/web/` and can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `build/web` folder
- **Vercel**: Deploy via CLI or GitHub integration
- **GitHub Pages**: Upload contents to gh-pages branch
- **Firebase Hosting**: Use Firebase CLI

## Architecture

- **Repository Pattern**: Clean separation between data sources
- **State Management**: Riverpod for reactive state management
- **Data Buffering**: Rolling buffers with automatic downsampling
- **Charts**: FL Chart library for smooth, interactive visualizations
- **Responsive Layout**: GridView with adaptive column counts

## Web Serial API Support

The dashboard automatically detects Web Serial API support and falls back to mock data if unavailable. Supported browsers:
- Chrome 89+
- Edge 89+
- Opera 75+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

Part of the Heritage STEAM Club website project.
