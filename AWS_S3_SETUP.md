# AWS S3 Storage Setup Guide

## Overview
This project supports both local file storage and AWS S3 cloud storage. You can switch between them using environment variables.

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

```env
# Enable S3 Storage
USE_S3_STORAGE=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name
S3_BUCKET_URL=https://your-bucket-name.s3.us-east-1.amazonaws.com
```

## Switching Between Storage Types

### Local Storage (Default)
```env
USE_S3_STORAGE=false
```

### S3 Storage
```env
USE_S3_STORAGE=true
# ... AWS configuration above
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

## Testing S3 Setup

1. Set `USE_S3_STORAGE=true` in your `.env`
2. Add your AWS credentials
3. Start the server: `npm run dev`
4. Upload an image via POST `/api/images`
5. Check your S3 bucket - the file should be there
6. The API response should return the S3 URL

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
