import dotenv from 'dotenv';

// so i will load env fezz
dotenv.config();

// then i would define what env we need
const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
];

// want to check if all required var exists
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file.');
    process.exit(1);
}

export const config = {
    port: parseInt(process.env.PORT || '3000'),
    mongodbUri: process.env.MONGODB_URI!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
    // added ! at the end because i have already validated they exist

    // for file upload configs
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // TO BE 5MB DEFAULT
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp',
    
    // security configs
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001',

    // cloud storage configs
    useCloudStorage: process.env.USE_CLOUD_STORAGE === 'true',
    cloudProvider: process.env.CLOUD_PROVIDER || 'aws', // 'aws', 'gcp', 'cloudflare'
    cloudRegion: process.env.CLOUD_REGION || 'us-east-1',

    // AWS S3 configs
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

    // GCP configs
    gcpProjectId: process.env.GCP_PROJECT_ID,
    gcpKeyFilename: process.env.GCP_KEY_FILENAME,

    // Shared configs
    cloudBucketName: process.env.CLOUD_BUCKET_NAME,
    cloudBucketUrl: process.env.CLOUD_BUCKET_URL

};

export default config;