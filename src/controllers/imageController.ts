import { Request, Response } from 'express';
import Image from '../models/Images';
import { config } from '../config/environment';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import User from '../models/User'; // i imported this to use the user model in the request

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const uploadImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // to get image metadata using Sharp
        const metadata = await sharp(req.file.path).metadata();
        
        // to generate new image record
        const image = new Image({
            filename: req.file.filename,
            originalName: req.file.originalname,
            format: req.file.mimetype.split('/')[1],
            dimensions: {
                width: metadata.width || 0,
                height: metadata.height || 0,
            },
            path: req.file.path,
            size: req.file.size,
            user: req.user._id,
            transformations: [] // to start with empty transformations
        });

        await image.save();
        
        res.status(201).json({
            message: 'Image uploaded successfully',
            image: {
                id: image._id,
                filename: image.filename,
                originalName: image.originalName,
                format: image.format,
                dimensions: image.dimensions,
                size: image.size,
                uploadedAt: image.createdAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
};