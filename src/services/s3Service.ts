import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '../config/environment';
import fs from 'fs';
import path from 'path';

class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId!,
        secretAccessKey: config.awsSecretAccessKey!,
      },
    });
  }

  async uploadFile(fileData: string | Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      let body: any;

      if (typeof fileData === 'string') {
        // File path - create read stream
        body = fs.createReadStream(fileData);
      } else {
        // Buffer - use directly
        body = fileData;
      }

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.s3BucketName!,
          Key: `uploads/${fileName}`,
          Body: body,
          ContentType: mimeType,
          ACL: 'public-read', // Makes the file publicly accessible
        },
      });

      const result = await upload.done();

      // Clean up local file if it was a file path
      if (typeof fileData === 'string') {
        fs.unlinkSync(fileData);
      }

      // Return the public URL
      return config.s3BucketUrl
        ? `${config.s3BucketUrl}/uploads/${fileName}`
        : `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/uploads/${fileName}`;

    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.s3BucketName!,
        Key: `uploads/${fileName}`,
      });

      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // Generate a signed URL for private files (optional future enhancement)
  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    // This would require additional AWS SDK imports for GetObjectCommand
    // Implementation can be added later if needed
    throw new Error('Signed URLs not implemented yet');
  }
}

export default new S3Service();
