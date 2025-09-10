# AWS Image Upload Instructions

## Overview
The attendance page has been updated to load the yellow McLaren image from AWS S3 with a local fallback. Here's how to complete the setup:

## Current Status
✅ **Fixed**: The p1 image in the main website (index.html) now works correctly  
✅ **Updated**: Attendance page now tries to load from AWS S3 first, falls back to local image  
✅ **Created**: AWS upload function and script ready to use  
⏳ **Pending**: Upload the actual image to AWS S3 (requires AWS credentials)

## Image URL Configuration
The attendance page is now configured to load the image from:
```
Primary: https://heritage-h2gp-stl-models.s3.amazonaws.com/images/heritage-h2gp-yellow-mclaren.jpg
Fallback: assets/yellow-mclaren.jpg (local file)
```

## To Complete the AWS Upload:

### Option 1: Using the Upload Script (Recommended)
1. Set your AWS environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_REGION="us-east-1"
   export S3_BUCKET_NAME="heritage-h2gp-stl-models"
   ```

2. Run the upload script:
   ```bash
   node upload-image-to-aws.js
   ```

### Option 2: Manual AWS S3 Upload
1. Log into AWS S3 Console
2. Navigate to bucket: `heritage-h2gp-stl-models`
3. Create folder: `images/` (if it doesn't exist)
4. Upload `assets/yellow-mclaren.jpg` as `heritage-h2gp-yellow-mclaren.jpg`
5. Set permissions to "Public Read"
6. The final URL should be: `https://heritage-h2gp-stl-models.s3.amazonaws.com/images/heritage-h2gp-yellow-mclaren.jpg`

### Option 3: Using AWS CLI
```bash
aws s3 cp assets/yellow-mclaren.jpg s3://heritage-h2gp-stl-models/images/heritage-h2gp-yellow-mclaren.jpg --acl public-read
```

## Testing
After uploading, test the attendance page:
1. Open `attendance.html`
2. Fill out the attendance form
3. Submit to see the success page
4. The yellow McLaren image should load from AWS S3

## Files Created/Modified
- ✅ `netlify/functions/upload-image.js` - AWS image upload function
- ✅ `upload-image-to-aws.js` - Upload script for the image
- ✅ `attendance.html` - Updated to use AWS S3 URL with fallback
- ✅ `index.html` - Fixed the corrupted p1 image

## Benefits of AWS Hosting
- ✅ Faster loading times
- ✅ Better reliability
- ✅ CDN distribution
- ✅ Reduced server load
- ✅ Automatic fallback to local image if AWS is unavailable
