# InfinityFree Manual Deployment Guide

Since you can't download the ZIP file, here are alternative ways to get your website files for InfinityFree deployment:

## Option 1: Use the Individual Files (Recommended)

All the files you need are already in your project directory. You can upload them directly to InfinityFree:

### Files to Upload to InfinityFree:
```
📁 Root files (upload to htdocs/public_html):
├── index.html (main website)
├── styles.css (main styling)
├── script.js (main JavaScript)
├── attendance.html (attendance system)
├── attendance-styles.css
├── attendance-script.js
├── login.html
├── login-styles.css
├── login-script.js
├── student-attendance.html
├── student-attendance-script.js
├── hydrogen-fuel-cell.html
└── assets/ (entire folder with subfolders)
    ├── actual-mclaren-p1.jpg
    ├── yellow-mclaren-p1.jpg
    ├── yellow-mclaren.jpg
    ├── mclaren-p1-replacement.jpg
    └── models/
        ├── heritage-h2gp-2024.stl
        └── models-config.json
```

## Option 2: Create Your Own ZIP

If you want to create a ZIP file yourself:

### On Mac:
1. Open Finder
2. Navigate to your project folder: `/Users/likithtatini/genai_apps/STEAM_website/infinityfree-deploy/`
3. Select all files in the `infinityfree-deploy` folder
4. Right-click and choose "Compress items"
5. This will create a ZIP file you can upload

### On Windows:
1. Open File Explorer
2. Navigate to the `infinityfree-deploy` folder
3. Select all files
4. Right-click and choose "Send to" > "Compressed (zipped) folder"

## Option 3: Upload Files Directly via InfinityFree File Manager

### Step-by-Step Process:
1. **Create InfinityFree Account**
   - Go to https://infinityfree.net
   - Sign up for free
   - Create a new website/subdomain

2. **Access File Manager**
   - Log into your InfinityFree control panel
   - Click on "File Manager"
   - Navigate to `htdocs` or `public_html` folder

3. **Upload Files One by One**
   - Upload `index.html` first (this is your main page)
   - Upload all CSS files: `styles.css`, `attendance-styles.css`, `login-styles.css`
   - Upload all JS files: `script.js`, `attendance-script.js`, `login-script.js`, `student-attendance-script.js`
   - Upload all HTML files: `attendance.html`, `login.html`, `student-attendance.html`, `hydrogen-fuel-cell.html`

4. **Create Assets Folder**
   - In File Manager, create a new folder called `assets`
   - Upload all image files to the `assets` folder:
     - `actual-mclaren-p1.jpg`
     - `yellow-mclaren-p1.jpg` 
     - `yellow-mclaren.jpg`
     - `mclaren-p1-replacement.jpg`
   - Create a `models` subfolder inside `assets`
   - Upload to `assets/models/`:
     - `heritage-h2gp-2024.stl`
     - `models-config.json`

## Option 4: Use GitHub to Download

Since your files are on GitHub, you can:
1. Go to your GitHub repository: https://github.com/LikithT/STEAM-club-website
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file
5. Use the files from the extracted folder

## Option 5: Copy Files from Your Local Directory

You can manually copy files from your local directory:
- **Source**: `/Users/likithtatini/genai_apps/STEAM_website/`
- **Files needed**: All `.html`, `.css`, `.js` files and the `assets/` folder
- **Destination**: Upload to InfinityFree's `htdocs` or `public_html` folder

## Important Notes:

### File Structure Must Be Maintained:
```
htdocs/
├── index.html
├── styles.css
├── script.js
├── attendance.html
├── attendance-styles.css
├── attendance-script.js
├── login.html
├── login-styles.css
├── login-script.js
├── student-attendance.html
├── student-attendance-script.js
├── hydrogen-fuel-cell.html
└── assets/
    ├── actual-mclaren-p1.jpg
    ├── yellow-mclaren-p1.jpg
    ├── yellow-mclaren.jpg
    ├── mclaren-p1-replacement.jpg
    └── models/
        ├── heritage-h2gp-2024.stl
        └── models-config.json
```

### Testing After Upload:
1. Visit your InfinityFree URL
2. Check that the main website loads (index.html)
3. Test navigation between pages
4. Test attendance system with secret code "Pagani"
5. Verify images and 3D models load correctly

## Troubleshooting:
- **404 Errors**: Make sure file names match exactly (case-sensitive)
- **Images not loading**: Verify the `assets/` folder structure is correct
- **CSS/JS not working**: Check that all files are uploaded to the root directory

Choose the option that works best for you! The individual file upload method (Option 3) is often the most reliable for InfinityFree.
