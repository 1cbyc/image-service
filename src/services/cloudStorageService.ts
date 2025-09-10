import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Storage } from '@google-cloud/storage';
import { config } from '../config/environment';
import fs from 'fs';
import path from 'path';

interface CloudStorageProvider {
  uploadFile(fileData: string | Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

class AWSS3Provider implements CloudStorageProvider {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.cloudRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId!,
        secretAccessKey: config.awsSecretAccessKey!,
      },
    });
  }

  async uploadFile(fileData: string | Buffer, fileName: string, mimeType: string): Promise<string> {
    let body: any;

    if (typeof fileData === 'string') {
      body = fs.createReadStream(fileData);
    } else {
      body = fileData;
    }

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: config.cloudBucketName!,
        Key: `uploads/${fileName}`,
        Body: body,
        ContentType: mimeType,
        ACL: 'public-read',
      },
    });

    await upload.done();

    if (typeof fileData === 'string') {
      fs.unlinkSync(fileData);
    }

    return config.cloudBucketUrl
      ? `${config.cloudBucketUrl}/uploads/${fileName}`
      : `https://${config.cloudBucketName}.s3.${config.cloudRegion}.amazonaws.com/uploads/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: config.cloudBucketName!,
      Key: `uploads/${fileName}`,
    });

    await this.s3Client.send(deleteCommand);
  }
}

class GCPStorageProvider implements CloudStorageProvider {
  private storage: Storage;
  private bucket: any;

  constructor() {
    this.storage = new Storage({
      projectId: config.gcpProjectId,
      keyFilename: config.gcpKeyFilename,
    });
    this.bucket = this.storage.bucket(config.cloudBucketName!);
  }

  async uploadFile(fileData: string | Buffer, fileName: string, mimeType: string): Promise<string> {
    const blob = this.bucket.file(`uploads/${fileName}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
      public: true,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('GCP upload error:', error);
        reject(new Error('Failed to upload file to GCP'));
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${config.cloudBucketName}/uploads/${fileName}`;
        resolve(publicUrl);
      });

      if (typeof fileData === 'string') {
        fs.createReadStream(fileData).pipe(blobStream);
        fs.unlinkSync(fileData);
      } else {
        blobStream.end(fileData);
      }
    });
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.bucket.file(`uploads/${fileName}`).delete();
  }
}

class CloudStorageService {
  private provider: CloudStorageProvider;

  constructor() {
    switch (config.cloudProvider) {
      case 'aws':
        this.provider = new AWSS3Provider();
        break;
      case 'gcp':
        this.provider = new GCPStorageProvider();
        break;
      default:
        this.provider = new AWSS3Provider();
    }
  }

  async uploadFile(fileData: string | Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      return await this.provider.uploadFile(fileData, fileName, mimeType);
    } catch (error) {
      console.error(`${config.cloudProvider.toUpperCase()} upload error:`, error);
      throw new Error(`Failed to upload file to ${config.cloudProvider.toUpperCase()}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.provider.deleteFile(fileName);
    } catch (error) {
      console.error(`${config.cloudProvider.toUpperCase()} delete error:`, error);
      throw new Error(`Failed to delete file from ${config.cloudProvider.toUpperCase()}`);
    }
  }
}

export default new CloudStorageService();
