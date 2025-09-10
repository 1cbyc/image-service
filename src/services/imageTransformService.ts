import sharp from 'sharp';
import path from 'path';
import { mkdirSync } from 'fs';
import { config } from '../config/environment';
import { randomUUID } from 'crypto';
import cloudStorageService from './cloudStorageService';
import { extname } from 'path';
import fs from 'fs';

interface TransformationOptions {
    resize?: { width?: number; height?: number };
    crop?: { width: number; height: number; left: number; top: number };
    rotate?: number;
    flip?: boolean;
    flop?: boolean;
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    filters?: {
        grayscale?: boolean;
        blur?: number;
    };
}

export const transformImage = async (
    imagePath: string, 
    transformations: TransformationOptions
): Promise<string> => {
    try {
        // create output directory
        const outputDir = 'uploads/processed';
        mkdirSync(outputDir, { recursive: true });
        
        // generate unique output filename
        const outputPath = path.join(outputDir, `${randomUUID()}.jpg`);
        
        // start the sharp pipeline
        let pipeline = sharp(imagePath);
        
        // apply transformations in sequence
        if (transformations.resize) {
            pipeline = pipeline.resize(transformations.resize.width, transformations.resize.height);
        }
        
        if (transformations.crop) {
            const { left, top, width, height } = transformations.crop;
            pipeline = pipeline.extract({ left, top, width, height });
        }
        
        if (transformations.rotate) {
            pipeline = pipeline.rotate(transformations.rotate);
        }
        
        if (transformations.flip) {
            pipeline = pipeline.flip();
        }
        
        if (transformations.flop) {
            pipeline = pipeline.flop();
        }
        
        if (transformations.filters?.grayscale) {
            pipeline = pipeline.grayscale();
        }
        
        if (transformations.filters?.blur) {
            pipeline = pipeline.blur(transformations.filters.blur);
        }
        
        // handle format conversion
        if (transformations.format) {
            switch (transformations.format) {
                case 'jpeg':
                    pipeline = pipeline.jpeg({ quality: transformations.quality || 80 });
                break;
                case 'png':
                    pipeline = pipeline.png({ quality: transformations.quality || 80 });
                break;
                case 'webp':
                    pipeline = pipeline.webp({ quality: transformations.quality || 80 });
                break;
            }
        }
        
        // save transformed image
        await pipeline.toFile(outputPath);

        // If using cloud storage, upload the transformed image
        if (config.useCloudStorage) {
            try {
                const cloudUrl = await cloudStorageService.uploadFile(
                    outputPath,
                    path.basename(outputPath),
                    `image/${path.extname(outputPath).slice(1)}`
                );
                return cloudUrl;
            } catch (error) {
                console.error('Failed to upload transformed image to cloud:', error);
                throw new Error('Failed to upload transformed image to cloud storage');
            }
        }

        return outputPath;
    } catch (error) {
        console.error('Image transformation error:', error);
        throw new Error('Failed to transform image');
    }
};