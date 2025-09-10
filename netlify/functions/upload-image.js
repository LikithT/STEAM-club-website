const AWS = require('aws-sdk');
const multipart = require('lambda-multipart-parser');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'heritage-h2gp-stl-models';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const result = await multipart.parse(event);
    
    if (!result.files || result.files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    const file = result.files[0];
    const { filename, content, contentType } = file;

    // Validate file type (allow common image formats)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only image files (JPG, PNG, GIF, WebP) are allowed' })
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `images/${uniqueFilename}`,
      Body: content,
      ContentType: contentType || 'image/jpeg',
      ACL: 'public-read'
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Get image metadata from form
    const imageTitle = result.title || filename.replace(fileExtension, '');
    const imageDescription = result.description || 'Uploaded image';

    // Store metadata in S3 as JSON
    const metadataParams = {
      Bucket: BUCKET_NAME,
      Key: `metadata/images/${uniqueFilename}.json`,
      Body: JSON.stringify({
        filename: uniqueFilename,
        originalFilename: filename,
        title: imageTitle,
        description: imageDescription,
        uploadDate: new Date().toISOString(),
        fileUrl: uploadResult.Location,
        fileSize: content.length,
        contentType: contentType
      }),
      ContentType: 'application/json',
      ACL: 'public-read'
    };

    await s3.upload(metadataParams).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Image uploaded successfully',
        fileUrl: uploadResult.Location,
        filename: uniqueFilename,
        title: imageTitle,
        description: imageDescription
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to upload image',
        details: error.message 
      })
    };
  }
};
