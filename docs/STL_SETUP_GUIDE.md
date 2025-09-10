# Heritage H2GP STL Model Setup Guide

## Overview
Your website now supports **permanent server-side STL storage** in addition to the existing upload functionality. This means your Heritage H2GP club car models can be permanently available on the website without requiring uploads.

## Current System Features

### ✅ What's Already Working
- **Permanent Model Selection**: Pre-configured Heritage H2GP models available instantly
- **Upload Functionality**: Users can still upload their own STL files
- **Cloud Storage**: Uploaded files are stored in AWS S3
- **Model Persistence**: Models persist across page reloads
- **Japanese Street Environment**: 3D scene with buildings and street details
- **No Spinning Animation**: STL models remain stationary as requested

## Adding Your STL Files Permanently

### Step 1: Prepare Your STL Files
Place your Heritage H2GP STL files in the `assets/models/` directory with these recommended names:
- `heritage-h2gp-2024.stl` - Your latest competition car
- `heritage-h2gp-prototype.stl` - Early prototype design
- `heritage-h2gp-chassis.stl` - Chassis component

### Step 2: Update Model Configuration
Edit `assets/models/models-config.json` to match your actual models:

```json
{
  "models": [
    {
      "id": "heritage-h2gp-2024",
      "name": "Heritage H2GP Car 2024",
      "description": "Our latest hydrogen-powered RC car design for the 2024 competition season",
      "filename": "heritage-h2gp-2024.stl",
      "category": "competition",
      "year": 2024,
      "isDefault": true
    },
    {
      "id": "heritage-h2gp-prototype",
      "name": "Heritage H2GP Prototype",
      "description": "Early prototype design showcasing our initial hydrogen fuel cell integration",
      "filename": "heritage-h2gp-prototype.stl",
      "category": "prototype",
      "year": 2023,
      "isDefault": false
    }
  ]
}
```

### Step 3: Deploy Updated Files
After adding your STL files and updating the configuration:

```bash
cd netlify-deploy
netlify deploy --prod
```

## File Structure
```
netlify-deploy/
├── assets/
│   └── models/
│       ├── models-config.json          # Model configuration
│       ├── heritage-h2gp-2024.stl      # Your STL files
│       ├── heritage-h2gp-prototype.stl
│       └── heritage-h2gp-chassis.stl
├── script.js                           # Updated with permanent model support
├── styles.css                          # Updated with model selection UI
└── index.html                          # Main website
```

## How It Works

### User Experience
1. **Visit 3D Model Section**: Users navigate to the 3D MODEL section
2. **Click "UPLOAD STL MODEL"**: Opens the model selection modal
3. **See Permanent Models**: Your Heritage H2GP models are displayed at the top
4. **One-Click Loading**: Users can instantly load any permanent model
5. **Upload Option**: Users can still upload their own STL files below

### Technical Implementation
- **Permanent Models**: Loaded from `/assets/models/models-config.json`
- **File Serving**: STL files served directly from `/assets/models/`
- **Model Selection UI**: Beautiful card-based interface with model details
- **Automatic Loading**: Models load instantly without upload process
- **Persistence**: Selected models persist across page reloads

## Model Configuration Options

### Required Fields
- `id`: Unique identifier for the model
- `name`: Display name shown to users
- `description`: Brief description of the model
- `filename`: STL file name in the assets/models/ directory

### Optional Fields
- `category`: "competition", "prototype", "component", etc.
- `year`: Year the model was created
- `isDefault`: Set to `true` for the primary model

### Categories
- **competition**: Race-ready competition cars
- **prototype**: Early development models
- **component**: Individual parts (chassis, body, etc.)
- **educational**: Models for teaching purposes

## Benefits of Permanent Storage

### ✅ Advantages
- **Instant Access**: No upload time required
- **Always Available**: Models never get lost or deleted
- **Professional Presentation**: Curated collection of your best models
- **Fast Loading**: Direct server delivery
- **Organized Display**: Categorized with descriptions and metadata

### 🔄 Dual System
- **Permanent Models**: Your official Heritage H2GP collection
- **Upload Functionality**: Visitors can still upload their own STL files
- **Cloud Storage**: Uploaded files stored in AWS S3 with persistence

## Next Steps

1. **Gather Your STL Files**: Collect your best Heritage H2GP car models
2. **Rename Files**: Use descriptive names matching the configuration
3. **Add to Assets Folder**: Place files in `netlify-deploy/assets/models/`
4. **Update Configuration**: Edit `models-config.json` with your model details
5. **Deploy**: Run `netlify deploy --prod` to make them live

## Current Live Site
🌐 **https://heritage-h2gp-steam.netlify.app**

The permanent model system is now live and ready for your STL files!

## Support
If you need help adding your STL files or modifying the configuration, the system is designed to be easily maintainable and expandable.
