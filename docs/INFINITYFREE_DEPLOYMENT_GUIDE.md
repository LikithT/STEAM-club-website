# InfinityFree Deployment Guide

## Overview
InfinityFree is a free web hosting service that supports static HTML, CSS, JavaScript, and PHP websites. This guide will help you deploy your STEAM website to InfinityFree.

## Prerequisites
1. Create a free account at https://infinityfree.net
2. Set up a subdomain or use a custom domain
3. Access to FTP/File Manager for uploading files

## Deployment Steps

### Step 1: Create InfinityFree Account
1. Go to https://infinityfree.net
2. Click "Create Account"
3. Fill in your details and verify your email
4. Create a new website/subdomain

### Step 2: Prepare Files for Upload
Your website files are ready for InfinityFree deployment. The main files to upload are:
- `index.html` (main website)
- `styles.css` (main styles)
- `script.js` (main JavaScript)
- `attendance.html` (attendance system)
- `attendance-styles.css`
- `attendance-script.js`
- `assets/` folder (images and models)
- All other HTML files (login.html, student-attendance.html, etc.)

### Step 3: Upload Files via FTP or File Manager

#### Option A: Using File Manager (Recommended for beginners)
1. Log into your InfinityFree control panel
2. Go to "File Manager"
3. Navigate to the `htdocs` or `public_html` folder
4. Upload all your website files to this folder
5. Maintain the folder structure (keep assets/ folder intact)

#### Option B: Using FTP Client
1. Get your FTP credentials from InfinityFree control panel
2. Use an FTP client like FileZilla
3. Connect to your hosting account
4. Upload files to the `htdocs` or `public_html` directory

### Step 4: Configure for InfinityFree
InfinityFree has some limitations and requirements:

1. **File Extensions**: Make sure all files have proper extensions (.html, .css, .js)
2. **Case Sensitivity**: File names are case-sensitive on Linux servers
3. **Directory Structure**: Maintain your current folder structure
4. **No Server-Side Functions**: Netlify functions won't work, but your static site will

## Important Notes

### What Will Work on InfinityFree:
- ✅ Main STEAM website (index.html)
- ✅ Attendance system (client-side functionality)
- ✅ Photo gallery and upload features
- ✅ All CSS animations and styling
- ✅ JavaScript interactions
- ✅ STL model viewer (if CORS allows)

### What Won't Work:
- ❌ Netlify Functions (upload-image.js, etc.)
- ❌ Server-side processing
- ❌ Automatic GitHub deployment
- ❌ Build processes

### Workarounds:
- Use client-side storage (localStorage) for data persistence
- Replace server functions with client-side alternatives
- Manual file uploads for deployment

## File Structure for InfinityFree
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
    └── models/
        ├── heritage-h2gp-2024.stl
        └── models-config.json
```

## Testing Your Deployment
1. Upload all files to InfinityFree
2. Visit your website URL (e.g., yoursite.infinityfreeapp.com)
3. Test all pages and functionality
4. Check browser console for any errors
5. Test the attendance system with the "Pagani" secret code

## Troubleshooting

### Common Issues:
1. **404 Errors**: Check file names and paths are correct
2. **CSS/JS Not Loading**: Verify file paths in HTML files
3. **Images Not Showing**: Check image file paths and names
4. **CORS Errors**: Some external resources might be blocked

### Solutions:
1. Use relative paths (./styles.css instead of /styles.css)
2. Ensure all file names match exactly (case-sensitive)
3. Check that all referenced files are uploaded
4. Use browser developer tools to debug issues

## Custom Domain (Optional)
If you have a custom domain:
1. Go to InfinityFree control panel
2. Add your custom domain
3. Update DNS settings to point to InfinityFree servers
4. Wait for DNS propagation (24-48 hours)

## Maintenance
- Manual updates: Upload changed files via FTP/File Manager
- Regular backups: Download your files periodically
- Monitor usage: Check InfinityFree limits and usage

Your STEAM website should work perfectly on InfinityFree with all its interactive features!
