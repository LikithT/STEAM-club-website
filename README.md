# Heritage H2GP STEAM Website - Cloud Storage Setup

This website now includes cloud storage functionality for permanently saving uploaded STL files using AWS S3 and Netlify Functions.

## Environment Variables Required

To enable cloud storage functionality, you need to set the following environment variables in your Netlify dashboard:

### AWS S3 Configuration
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=heritage-h2gp-stl-models
```

## Setup Instructions

### 1. Create AWS S3 Bucket
1. Log into AWS Console
2. Go to S3 service
3. Create a new bucket named `heritage-h2gp-stl-models` (or your preferred name)
4. Enable public read access for the bucket
5. Configure CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 2. Create AWS IAM User
1. Go to IAM service in AWS Console
2. Create a new user for programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::heritage-h2gp-stl-models",
                "arn:aws:s3:::heritage-h2gp-stl-models/*"
            ]
        }
    ]
}
```

4. Save the Access Key ID and Secret Access Key

### 3. Configure Netlify Environment Variables
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: `us-east-1` (or your preferred region)
   - `S3_BUCKET_NAME`: `heritage-h2gp-stl-models` (or your bucket name)

### 4. Deploy
Once environment variables are set, deploy your site. The cloud storage functionality will be automatically enabled.

## Features

### STL File Upload
- Users can upload STL files through the web interface
- Files are automatically uploaded to AWS S3
- Metadata is stored alongside the files
- Fallback to local loading if cloud upload fails

### File Management
- All uploaded files are permanently stored in S3
- Files are publicly accessible via S3 URLs
- Metadata includes title, description, upload date, and file size

### API Endpoints
- `/.netlify/functions/upload-stl` - Upload STL files
- `/.netlify/functions/list-stl-models` - List all uploaded models

## File Structure
```
netlify-deploy/
├── netlify/
│   └── functions/
│       ├── upload-stl.js      # Handles STL file uploads to S3
│       └── list-stl-models.js # Lists uploaded STL models
├── netlify.toml               # Netlify configuration
├── package.json               # Dependencies for functions
└── README.md                  # This file
```

## Troubleshooting

### Upload Fails
- Check that AWS credentials are correctly set in Netlify environment variables
- Verify S3 bucket exists and has proper permissions
- Check browser console for error messages

### Files Not Loading
- Ensure S3 bucket has public read access
- Verify CORS policy is correctly configured
- Check that file URLs are accessible

### Function Errors
- Check Netlify function logs in the dashboard
- Verify all required environment variables are set
- Ensure AWS IAM user has proper permissions

## Security Notes
- AWS credentials are stored securely in Netlify environment variables
- S3 bucket is configured for public read access (required for 3D model loading)
- File uploads are validated to only accept STL files
- All uploads are logged with metadata for tracking
