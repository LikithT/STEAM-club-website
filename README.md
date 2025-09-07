# Heritage H2GP STEAM Website

A modern, interactive website for the Heritage High School STEAM Club showcasing their hydrogen-powered RC car racing program and educational initiatives.

## 🚀 Live Demo

**Website**: [https://heritage-h2gp-steam.netlify.app](https://heritage-h2gp-steam.netlify.app)

## 📋 Overview

The Heritage H2GP STEAM website is a comprehensive platform that showcases the club's innovative work in hydrogen-powered RC car racing, STEAM education, and sustainable technology. The website features a modern dark blue theme with yellow accents, interactive 3D model viewer, photo gallery system, and responsive design.

## ✨ Features

### Core Functionality
- **Interactive Hero Section**: Engaging landing page with animated title and video background
- **About Section**: Information about the club's mission and achievements with animated statistics
- **Projects Showcase**: Detailed information about hydrogen-powered RC cars and competitive racing
- **Photo Gallery**: Comprehensive photo management system with drag & drop upload
- **3D Model Viewer**: Interactive STL model viewer for the Heritage H2GP car
- **Team Information**: Details about advisors and team structure
- **Contact Section**: Social media links and contact information

### Technical Features
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Modern UI/UX**: Smooth animations and transitions
- **Photo Management**: 
  - Drag & drop photo upload
  - Category-based organization (RC Cars, Racing, Education, Team)
  - Full-screen image viewer with navigation
  - localStorage persistence
- **3D Model Integration**: Three.js-powered STL model viewer
- **Performance Optimized**: Fast loading times and smooth interactions

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js for STL model rendering
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Storage**: localStorage for client-side photo persistence
- **Deployment**: Netlify with serverless functions
- **Version Control**: Git

## 📁 Project Structure

```
heritage-h2gp-steam/
├── netlify-deploy/           # Production deployment files
│   ├── index.html           # Main HTML file
│   ├── styles.css           # Main stylesheet
│   ├── script.js            # Main JavaScript file
│   ├── netlify.toml         # Netlify configuration
│   ├── package.json         # Node.js dependencies
│   ├── assets/              # Static assets
│   │   └── models/          # 3D model files
│   └── netlify/             # Netlify functions
│       └── functions/       # Serverless functions
├── memory-bank/             # Project documentation
│   ├── projectbrief.md      # Project overview
│   ├── productContext.md    # Product requirements
│   ├── systemPatterns.md    # Technical architecture
│   ├── techContext.md       # Technology decisions
│   ├── activeContext.md     # Current work status
│   └── progress.md          # Development progress
└── README.md               # This file
```

## 🎨 Design System

### Color Palette
- **Primary Background**: Dark blue gradient (`#0B1426` to `#0F1B2E`)
- **Accent Color**: Yellow (`#FFD700`)
- **Text Primary**: Light gray (`#F5F5F5`)
- **Text Secondary**: Medium gray (`#B9BDC7`)
- **Card Background**: Dark gray with transparency (`rgba(17, 18, 21, 0.6)`)

### Typography
- **Primary Font**: Space Grotesk (headings)
- **Secondary Font**: Inter (body text)
- **Font Weights**: 300, 400, 500, 600, 700

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/heritage-h2gp-steam.git
   cd heritage-h2gp-steam
   ```

2. **Navigate to the deployment directory**
   ```bash
   cd netlify-deploy
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start local development server**
   ```bash
   # Using Python (if available)
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server . -p 8000
   
   # Or using Live Server extension in VS Code
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development

The website is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance. No build process is required for basic development.

#### Key Files:
- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design
- `script.js` - Interactive functionality and 3D model viewer
- `assets/models/` - STL files for 3D model viewer

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1920px and above
- **Laptop**: 1440px - 1919px
- **Tablet**: 768px - 1439px
- **Mobile**: 375px - 767px

## 🔧 Configuration

### Netlify Deployment
The website is configured for Netlify deployment with:
- Automatic builds from the `netlify-deploy` directory
- Serverless functions for STL model management
- Custom domain support
- HTTPS enabled

### Environment Variables (Optional)
For cloud storage functionality:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
```

## 📸 Photo Gallery System

The website includes a comprehensive photo management system:

### Features:
- **Drag & Drop Upload**: Intuitive file upload interface
- **Category Organization**: RC Cars, Racing, Education, Team
- **Image Viewer**: Full-screen viewing with navigation
- **Metadata Management**: Title, description, and category for each photo
- **Responsive Grid**: Adaptive layout for all screen sizes

### Usage:
1. Click "ADD PHOTOS" button in the Projects section
2. Drag and drop images or click to browse
3. Fill in photo details (title, description, category)
4. Photos are automatically saved and displayed in the gallery

## 🎯 3D Model Viewer

Interactive STL model viewer powered by Three.js:

### Features:
- **STL File Support**: Load and display 3D models
- **Interactive Controls**: Rotate, zoom, and pan
- **Model Selection**: Choose from available models
- **Responsive Design**: Works on all devices

### Supported Models:
- Heritage H2GP Car 2024
- Custom STL uploads (via serverless functions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines:
- Follow existing code style and conventions
- Test on multiple devices and browsers
- Update documentation for new features
- Maintain responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Heritage High School STEAM Club**
- **Advisor**: [Advisor Name]
- **Students**: Active STEAM club members
- **Website Development**: Built with modern web technologies

## 🙏 Acknowledgments

- Heritage High School for supporting STEAM education
- H2GP (Hydrogen Grand Prix) for the racing program
- Three.js community for 3D graphics capabilities
- Netlify for hosting and deployment services

## 📞 Contact

- **Website**: [https://heritage-h2gp-steam.netlify.app](https://heritage-h2gp-steam.netlify.app)
- **Email**: [Contact Email]
- **Social Media**: Links available on the website

---

**Built with ❤️ by the Heritage H2GP STEAM Club**
