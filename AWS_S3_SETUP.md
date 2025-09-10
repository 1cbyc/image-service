# Cloud Storage Setup Guide

## Overview
This project supports local file storage and multiple cloud storage providers (AWS S3, Google Cloud Storage, Cloudflare R2). You can switch between them using environment variables.

## Supported Providers
- **AWS S3** - Amazon Simple Storage Service
- **Google Cloud Storage** - GCP Cloud Storage
- **Cloudflare R2** - Cloudflare's S3-compatible storage

## Prerequisites

### 1. AWS Account Setup
1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Go to IAM (Identity and Access Management)
3. Create a new user with programmatic access
4. Attach the following policy to the user:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::YOUR_BUCKET_NAME/*",
                   "arn:aws:s3:::YOUR_BUCKET_NAME"
               ]
           }
       ]
   }
   ```

### 2. Create S3 Bucket
1. Go to S3 service in AWS Console
2. Create a new bucket (choose a unique name)
3. Configure bucket settings:
   - **Block all public access**: OFF (we need public read access)
   - **Bucket versioning**: Enable (optional but recommended)
   - **Server-side encryption**: Enable with AES256

### Google Cloud Storage Setup

#### 1. GCP Account Setup
1. Create a Google Cloud account at [cloud.google.com](https://cloud.google.com)
2. Create a new project or select existing one
3. Enable billing for your project

#### 2. Enable APIs
Enable these APIs in your GCP project:
- Cloud Storage API
- Cloud Resource Manager API

#### 3. Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Create a new service account with Storage Object Admin role
3. Generate and download JSON key file
4. Store the JSON file securely (never commit to version control)

#### 4. Create Cloud Storage Bucket
1. Go to Cloud Storage → Buckets
2. Create a new bucket with unique name
3. Configure bucket settings:
   - **Location**: Choose region close to your users
   - **Storage class**: Standard
   - **Access control**: Uniform (recommended)
   - **Public access**: Allow public access to objects

### 3. Configure Bucket Policy
Add this bucket policy to allow public read access:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/uploads/*"
        }
    ]
}
```

## Environment Configuration

Add these variables to your `.env` file:

### AWS S3 Configuration
```env
# Enable Cloud Storage
USE_CLOUD_STORAGE=true
CLOUD_PROVIDER=aws
CLOUD_REGION=us-east-1

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Bucket Configuration
CLOUD_BUCKET_NAME=your-bucket-name
CLOUD_BUCKET_URL=https://your-bucket-name.s3.us-east-1.amazonaws.com
```

### Google Cloud Storage Configuration
```env
# Enable Cloud Storage
USE_CLOUD_STORAGE=true
CLOUD_PROVIDER=gcp
CLOUD_REGION=us-central1

# GCP Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_KEY_FILENAME=path/to/service-account-key.json

# Bucket Configuration
CLOUD_BUCKET_NAME=your-gcs-bucket-name
CLOUD_BUCKET_URL=https://storage.googleapis.com/your-gcs-bucket-name
```

## Switching Between Storage Types

### Local Storage (Default)
```env
USE_CLOUD_STORAGE=false
```

### AWS S3 Storage
```env
USE_CLOUD_STORAGE=true
CLOUD_PROVIDER=aws
# ... AWS configuration above
```

### Google Cloud Storage
```env
USE_CLOUD_STORAGE=true
CLOUD_PROVIDER=gcp
# ... GCP configuration above
```

## File Structure in S3

When using S3, files are organized as:
```
your-bucket-name/
├── uploads/
│   ├── 1234567890-uuid-filename.jpg
│   ├── 1234567891-uuid-filename.png
│   └── processed/
│       ├── 1234567892-transformed-image.webp
```

## Security Considerations

1. **Access Keys**: Never commit access keys to version control
2. **IAM Policies**: Use least privilege principle
3. **Public Access**: Only allow public access to uploaded files, not the entire bucket
4. **Encryption**: Enable server-side encryption for all objects
5. **Backup**: Enable versioning and lifecycle policies for data protection

## Cost Optimization

1. **Storage Classes**: Use Intelligent Tiering for cost optimization
2. **Lifecycle Policies**: Automatically move old files to cheaper storage
3. **Delete Unused Files**: Implement cleanup for temporary files
4. **Monitoring**: Set up billing alerts and usage monitoring

## Testing Cloud Storage Setup

### AWS S3 Testing
1. Set these variables in your `.env`:
   ```env
   USE_CLOUD_STORAGE=true
   CLOUD_PROVIDER=aws
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   CLOUD_BUCKET_NAME=your-bucket
   ```
2. Start the server: `npm run dev`
3. Upload an image via POST `/api/images`
4. Check your S3 bucket - the file should be there
5. The API response should return the S3 URL

### Google Cloud Storage Testing
1. Set these variables in your `.env`:
   ```env
   USE_CLOUD_STORAGE=true
   CLOUD_PROVIDER=gcp
   GCP_PROJECT_ID=your-project-id
   GCP_KEY_FILENAME=path/to/service-account.json
   CLOUD_BUCKET_NAME=your-gcs-bucket
   ```
2. Start the server: `npm run dev`
3. Upload an image via POST `/api/images`
4. Check your GCS bucket - the file should be there
5. The API response should return the GCS URL

## Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions and bucket policy
2. **Region Mismatch**: Ensure bucket region matches AWS_REGION
3. **Public Access Blocked**: Disable "Block all public access" in bucket settings
4. **CORS Issues**: Configure CORS in S3 bucket if needed

### Debug Mode:
Set `NODE_ENV=development` to see detailed error logs including S3 errors.

## Alternative: Cloudflare R2

If you prefer Cloudflare R2 (cheaper than S3):

1. Create R2 bucket at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Get API tokens
3. Use R2-compatible S3 client configuration
4. Update `S3_BUCKET_URL` to your R2 domain

The code is compatible with both AWS S3 and Cloudflare R2!
