import multer from 'multer';
import path from 'path';
import { config } from '../config/environment';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

// Storage configuration based on environment
let storage: multer.StorageEngine;

if (config.useCloudStorage) {
    // Cloud Storage - files will be uploaded to cloud after multer processing
    storage = multer.memoryStorage();
} else {
    // Local Storage - traditional disk storage
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = 'uploads/original';
            mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    });
}

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = config.allowedFileTypes.split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    },
    limits: {
        fileSize: config.maxFileSize,
    },
});

export default upload;