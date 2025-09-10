# InfinityFree Upload Guide - Organized Structure

## 🎯 Your InfinityFree Setup
- ✅ Account: if0_39905671
- ✅ Website: HeritageH2GP.infinityfreeapp.com
- ✅ Ready to upload the newly organized files!

## 📁 NEW ORGANIZED STRUCTURE TO UPLOAD

With the recent reorganization, your files are now properly organized. Here's exactly what to upload to InfinityFree:

### Step 1: Access Your File Manager
1. Go to your InfinityFree dashboard
2. Click on "HeritageH2GP.infinityfreeapp.com"
3. Click "File Manager" or "Online File Manager"
4. Navigate to the `htdocs` folder

### Step 2: Upload Root Files First
Upload these files directly to the `htdocs` folder:

**Main HTML Files:**
- `index.html` - Main website (UPLOAD FIRST)
- `attendance.html` - Attendance system
- `login.html` - Login page
- `student-attendance.html` - Student interface
- `hydrogen-fuel-cell.html` - Educational content

**Configuration Files:**
- `netlify.toml` - Configuration
- `upload-image-to-aws.js` - AWS integration

### Step 3: Create and Upload Organized Folders

#### 📁 Create `assets` folder in htdocs, then:

**Create `assets/images/` subfolder and upload:**
- `actual-mclaren-p1.jpg`
- `mclaren-p1-replacement.jpg`
- `yellow-mclaren-p1.jpg`
- `yellow-mclaren.jpg`

**Create `assets/models/` subfolder and upload:**
- `heritage-h2gp-2024.stl` (98MB - will take time!)
- `heritage-h2gp-2024.stl.gz` (19MB compressed version)
- `models-config.json`

#### 📁 Create `css` folder in htdocs and upload:
- `styles.css` - Main styling
- `attendance-styles.css` - Attendance styling
- `login-styles.css` - Login styling

#### 📁 Create `js` folder in htdocs and upload:
- `script.js` - Main functionality
- `attendance-script.js` - Attendance system
- `login-script.js` - Login functionality
- `student-attendance-script.js` - Student interface

## 🚀 Upload Order (IMPORTANT!)

**Phase 1 - Core Files:**
1. Upload `index.html` first
2. Create `css/` folder and upload all CSS files
3. Create `js/` folder and upload all JS files
4. Test: Visit https://heritageh2gp.infinityfreeapp.com

**Phase 2 - Assets:**
5. Create `assets/images/` folder and upload all images
6. Create `assets/models/` folder
7. Upload `models-config.json` first
8. Upload `heritage-h2gp-2024.stl.gz` (compressed version)
9. Upload `heritage-h2gp-2024.stl` (large file - be patient!)

**Phase 3 - Additional Pages:**
10. Upload remaining HTML files
11. Upload configuration files

## 💡 Upload Tips for Organized Structure

### File Manager Tips:
- **Create folders first** before uploading files to them
- **Upload in small batches** - don't select all files at once
- **Test after each phase** - check your website works
- **Be patient with large files** - the STL file will take several minutes

### Folder Structure in InfinityFree:
```
htdocs/
├── index.html
├── attendance.html
├── login.html
├── student-attendance.html
├── hydrogen-fuel-cell.html
├── assets/
│   ├── images/
│   │   ├── actual-mclaren-p1.jpg
│   │   ├── mclaren-p1-replacement.jpg
│   │   ├── yellow-mclaren-p1.jpg
│   │   └── yellow-mclaren.jpg
│   └── models/
│       ├── heritage-h2gp-2024.stl
│       ├── heritage-h2gp-2024.stl.gz
│       └── models-config.json
├── css/
│   ├── styles.css
│   ├── attendance-styles.css
│   └── login-styles.css
└── js/
    ├── script.js
    ├── attendance-script.js
    ├── login-script.js
    └── student-attendance-script.js
```

## 🔧 If Upload Fails

### Large File Issues:
- Try uploading the compressed `.stl.gz` file instead of the full `.stl`
- Upload during off-peak hours (early morning/late night)
- Use FTP if file manager fails (get FTP credentials from InfinityFree)

### Folder Creation Issues:
- Use the "New Folder" button in file manager
- Make sure you're inside `htdocs` when creating folders
- Create parent folders before subfolders

## ✅ Testing Your Organized Website

After upload, test these features:
1. **Main site loads**: https://heritageh2gp.infinityfreeapp.com
2. **Images display**: Check McLaren photos show up
3. **3D model works**: Should load Heritage H2GP car
4. **Attendance system**: Use secret code "Pagani"
5. **All styling works**: CSS should load from `css/` folder
6. **JavaScript functions**: Interactive features should work

## 🎉 Success Indicators

✅ Website loads without errors
✅ All images display correctly
✅ 3D model viewer shows the Heritage H2GP car
✅ Attendance system accepts "Pagani" code
✅ Navigation works smoothly
✅ No 404 errors in browser console

## 📞 Alternative: FTP Upload

If the file manager is too slow:
1. Get FTP credentials from InfinityFree dashboard
2. Use FileZilla or similar FTP client
3. Upload the entire organized folder structure
4. Maintain the exact folder hierarchy shown above

Your organized website will be live at https://heritageh2gp.infinityfreeapp.com! 🚀

The new organized structure will make it much easier to manage your files in InfinityFree's file manager, and all the CAD model functionality will work perfectly with the updated paths.
