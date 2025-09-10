const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS S3 (you'll need to set these environment variables)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'heritage-h2gp-stl-models';

async function uploadImageToS3() {
  try {
    // Read the yellow McLaren image
    const imagePath = path.join(__dirname, 'assets', 'yellow-mclaren.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.error('Image file not found:', imagePath);
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const filename = 'yellow-mclaren.jpg';
    const uniqueFilename = `heritage-h2gp-${filename}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `images/${uniqueFilename}`,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    console.log('Uploading image to S3...');
    const uploadResult = await s3.upload(uploadParams).promise();

    // Store metadata in S3 as JSON
    const metadataParams = {
      Bucket: BUCKET_NAME,
      Key: `metadata/images/${uniqueFilename}.json`,
      Body: JSON.stringify({
        filename: uniqueFilename,
        originalFilename: filename,
        title: 'Yellow McLaren P1',
        description: 'Heritage H2GP reward image - Yellow McLaren P1 supercar',
        uploadDate: new Date().toISOString(),
        fileUrl: uploadResult.Location,
        fileSize: imageBuffer.length,
        contentType: 'image/jpeg'
      }),
      ContentType: 'application/json',
      ACL: 'public-read'
    };

    await s3.upload(metadataParams).promise();

    console.log('✅ Image uploaded successfully!');
    console.log('📍 S3 URL:', uploadResult.Location);
    console.log('🔗 Use this URL in your attendance page:', uploadResult.Location);

    return uploadResult.Location;

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  uploadImageToS3()
    .then((url) => {
      console.log('\n🎉 Upload completed successfully!');
      console.log('Now update your attendance.html to use this URL:', url);
    })
    .catch((error) => {
      console.error('\n💥 Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadImageToS3 };
