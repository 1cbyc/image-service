import multer from 'multer';
import path from 'path';
import { config } from '../config/environment';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/original';
        mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// to create upload middleware
export const upload = multer({
    storage,    
    fileFilter: (req, file, cb) => {
        // if the file type is allowed, return true
        const allowedTypes = config.allowedFileTypes.split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // if the file type is not allowed, return false
            cb(new Error('Invalid file type. Only images allowed.'), false);
        }
    },
    limits: {
        // set the maximum file size
        fileSize: config.maxFileSize,
    },
});

export default upload;