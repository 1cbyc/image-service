import { Request, Response } from 'express';
import Image from '../models/Images';
import { config } from '../config/environment';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import User from '../models/User'; // i imported this to use the user model in the request
import { transformImage as processTransformation } from '../services/imageTransformService';

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

export const transformImageController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const transformations = req.body.transformations;

        // to find the image
        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // check if the user owns the image
        if (image.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // to process the transformation (so apply fezz)
        const transformedPath = await processTransformation(image.path, transformations);
        
        // save transformations to db
        const transformationRecord = {
            type: 'multiple',
            parameters: transformations,
            resultPath: transformedPath,
            processedAt: new Date()
        };

        image.transformations.push(transformationRecord);
        await image.save();

        // return response
        res.json({
            message: 'Image transformed successfully',
            transformedImage: {
                id: image._id,
                transformationId: image.transformations[image.transformations.length - 1]._id,
                originalPath: image.path,
                transformedPath: transformedPath,
                transformations: transformations
            }
        });
    } catch (error) {
        console.error('Transform error:', error);
        res.status(500).json({ message: 'Failed to transform image' });
    }
};