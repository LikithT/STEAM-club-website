const AWS = require('aws-sdk');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // List metadata files from S3
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: 'metadata/',
      MaxKeys: 100
    };

    const listResult = await s3.listObjectsV2(listParams).promise();
    
    if (!listResult.Contents || listResult.Contents.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          models: [],
          message: 'No STL models found'
        })
      };
    }

    // Fetch metadata for each model
    const models = [];
    
    for (const object of listResult.Contents) {
      try {
        const getParams = {
          Bucket: BUCKET_NAME,
          Key: object.Key
        };

        const metadataResult = await s3.getObject(getParams).promise();
        const metadata = JSON.parse(metadataResult.Body.toString());
        
        models.push({
          id: metadata.filename,
          title: metadata.title,
          description: metadata.description,
          uploadDate: metadata.uploadDate,
          fileUrl: metadata.fileUrl,
          fileSize: metadata.fileSize,
          originalFilename: metadata.originalFilename
        });
      } catch (error) {
        console.error(`Error fetching metadata for ${object.Key}:`, error);
        // Continue with other models even if one fails
      }
    }

    // Sort by upload date (newest first)
    models.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        models: models,
        count: models.length
      })
    };

  } catch (error) {
    console.error('List models error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to list STL models',
        details: error.message 
      })
    };
  }
};
