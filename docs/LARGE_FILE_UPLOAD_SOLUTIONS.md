# Large STL File Upload Solutions

## Problem
The Heritage H2GP STL model file (heritage-h2gp-2024.stl, 98MB) is too large to upload through InfinityFree's standard file manager interface.

## Solution Options

### Option 1: File Compression (Recommended)
**Compress the STL file to reduce size:**

```bash
# Using gzip compression
gzip -k assets/models/heritage-h2gp-2024.stl
# This creates heritage-h2gp-2024.stl.gz (typically 70-80% smaller)

# Using 7zip (better compression)
7z a -t7z -mx=9 assets/models/heritage-h2gp-2024.stl.7z assets/models/heritage-h2gp-2024.stl
```

**Update JavaScript to handle compressed files:**
```javascript
// In script.js, modify the STL loading function
async function loadCompressedSTL(url) {
    try {
        const response = await fetch(url);
        const compressedData = await response.arrayBuffer();
        
        // Decompress using pako library (add to HTML)
        const decompressed = pako.inflate(new Uint8Array(compressedData));
        
        // Load with STLLoader
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(decompressed.buffer);
        return geometry;
    } catch (error) {
        console.error('Error loading compressed STL:', error);
        return null;
    }
}
```

### Option 2: File Splitting
**Split the large file into smaller chunks:**

```bash
# Split into 10MB chunks
split -b 10m assets/models/heritage-h2gp-2024.stl heritage-h2gp-part-

# This creates: heritage-h2gp-part-aa, heritage-h2gp-part-ab, etc.
```

**JavaScript to reassemble:**
```javascript
async function loadSplitSTL(baseUrl, partCount) {
    const chunks = [];
    
    for (let i = 0; i < partCount; i++) {
        const suffix = String.fromCharCode(97 + Math.floor(i / 26)) + 
                      String.fromCharCode(97 + (i % 26));
        const response = await fetch(`${baseUrl}-${suffix}`);
        chunks.push(await response.arrayBuffer());
    }
    
    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
    }
    
    // Load with STLLoader
    const loader = new THREE.STLLoader();
    return loader.parse(combined.buffer);
}
```

### Option 3: Alternative Upload Methods

#### FTP Upload (If Available)
```bash
# Using FileZilla or command line FTP
ftp your-infinityfree-ftp-server.com
# Login with your credentials
# Navigate to htdocs/assets/models/
# Upload the file in binary mode
```

#### cPanel File Manager (If Available)
1. Login to InfinityFree control panel
2. Open File Manager
3. Navigate to htdocs/assets/models/
4. Use "Upload" feature (may have higher limits than web interface)

### Option 4: External CDN Hosting
**Host the STL file on a CDN service:**

1. **GitHub LFS (Large File Storage)**
   ```bash
   git lfs track "*.stl"
   git add .gitattributes
   git add assets/models/heritage-h2gp-2024.stl
   git commit -m "Add STL file with LFS"
   git push
   ```
   
   Access via: `https://github.com/yourusername/repo/raw/main/assets/models/heritage-h2gp-2024.stl`

2. **Google Drive Public Link**
   - Upload to Google Drive
   - Make publicly accessible
   - Use direct download link

3. **Dropbox Public Link**
   - Upload to Dropbox
   - Generate public link
   - Use in your website

### Option 5: Simplified 3D Model
**Create a lower-resolution version:**

```bash
# Using Blender (command line)
blender --background --python-expr "
import bpy
bpy.ops.import_mesh.stl(filepath='heritage-h2gp-2024.stl')
bpy.ops.object.modifier_add(type='DECIMATE')
bpy.context.object.modifiers['Decimate'].ratio = 0.5
bpy.ops.object.modifier_apply(modifier='Decimate')
bpy.ops.export_mesh.stl(filepath='heritage-h2gp-2024-optimized.stl')
"
```

## Recommended Implementation

### Step 1: Compress the STL File
```bash
# Navigate to your project directory
cd /Users/likithtatini/genai_apps/STEAM_website

# Compress the STL file
gzip -k assets/models/heritage-h2gp-2024.stl
```

### Step 2: Add Compression Library
Add to your HTML `<head>`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
```

### Step 3: Update JavaScript
Modify the STL loading function in `script.js`:
```javascript
async function loadHeritageModel() {
    try {
        // Try to load compressed version first
        const compressedUrl = 'assets/models/heritage-h2gp-2024.stl.gz';
        const response = await fetch(compressedUrl);
        
        if (response.ok) {
            const compressedData = await response.arrayBuffer();
            const decompressed = pako.inflate(new Uint8Array(compressedData));
            
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(decompressed.buffer);
            return geometry;
        } else {
            // Fallback to original file
            return loadOriginalSTL();
        }
    } catch (error) {
        console.error('Error loading Heritage H2GP model:', error);
        return null;
    }
}
```

## Quick Fix for Current Deployment

If you want to get the website working immediately without the 3D model:

1. **Temporarily disable 3D model loading**
2. **Add a placeholder message**
3. **Upload the compressed file later**

Would you like me to implement any of these solutions?
