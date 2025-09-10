# Heritage H2GP STEAM Website - InfinityFree Deployment Package

## 📦 Package Contents

This folder contains all the files needed to deploy your STEAM website to InfinityFree hosting.

### Core Website Files
- `index.html` - Main STEAM website homepage
- `styles.css` - Main website styling
- `script.js` - Main website JavaScript functionality

### Attendance System
- `attendance.html` - Student attendance system
- `attendance-styles.css` - Attendance system styling
- `attendance-script.js` - Attendance system functionality
- **Secret Code**: "Pagani" (for admin access)

### Additional Pages
- `login.html` + `login-styles.css` + `login-script.js` - Login system
- `student-attendance.html` + `student-attendance-script.js` - Student attendance interface
- `hydrogen-fuel-cell.html` - Educational content page

### Assets
- `assets/` folder containing:
  - Images (McLaren P1 photos)
  - 3D models (Heritage H2GP STL file)
  - Model configuration files

## 🚀 Deployment Instructions

### Step 1: Create InfinityFree Account
1. Go to https://infinityfree.net
2. Sign up for a free account
3. Create a new website/subdomain

### Step 2: Upload Files
1. Log into your InfinityFree control panel
2. Open File Manager
3. Navigate to `htdocs` or `public_html` folder
4. Upload ALL files from this folder to your hosting directory
5. Maintain the folder structure (keep `assets/` folder intact)

### Step 3: Test Your Website
1. Visit your InfinityFree URL (e.g., yoursite.infinityfreeapp.com)
2. Test all pages and functionality
3. Test attendance system with secret code "Pagani"

## ✅ What Works on InfinityFree

- ✅ Complete STEAM website with all sections
- ✅ Interactive photo gallery and upload features
- ✅ Attendance system with admin panel
- ✅ All CSS animations and styling
- ✅ JavaScript interactions and functionality
- ✅ STL 3D model viewer
- ✅ Responsive design for all devices

## ⚠️ Important Notes

### File Requirements
- All files must be uploaded to maintain the exact folder structure
- File names are case-sensitive on Linux servers
- Keep the `assets/` folder structure intact

### Functionality
- Uses localStorage for client-side data storage
- All features work without server-side processing
- Photo uploads are stored locally in browser
- Attendance data is stored in localStorage

### Browser Compatibility
- Works in all modern browsers
- Requires JavaScript enabled
- Best experience on Chrome, Firefox, Safari, Edge

## 🔧 Troubleshooting

### Common Issues
1. **404 Errors**: Check that all files are uploaded correctly
2. **CSS/JS Not Loading**: Verify file paths and names match exactly
3. **Images Not Showing**: Ensure `assets/` folder is uploaded completely
4. **Attendance System Issues**: Make sure secret code "Pagani" is entered correctly

### Solutions
- Use relative paths in HTML files
- Check browser console for error messages
- Ensure all files have proper extensions (.html, .css, .js)
- Clear browser cache if changes don't appear

## 📱 Features

### Main Website
- Modern, responsive design
- Interactive hero section with 3D car model
- Photo gallery with drag & drop upload
- Project showcase sections
- Team information and contact details

### Attendance System
- Student check-in/check-out functionality
- Photo capture for attendance records
- Admin panel with "Pagani" secret code access
- Excel export functionality (client-side)
- Comprehensive attendance tracking

## 🌐 Live Testing

After uploading to InfinityFree:
1. Test main website navigation
2. Try photo upload and gallery features
3. Test attendance system:
   - Student check-in process
   - Photo capture functionality
   - Admin access with "Pagani" code
   - Excel export feature

## 📞 Support

If you encounter issues:
1. Check InfinityFree documentation
2. Verify all files are uploaded correctly
3. Use browser developer tools to debug
4. Check file permissions if needed

Your STEAM website is ready for InfinityFree hosting! 🎉
