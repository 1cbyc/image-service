import { Router } from 'express';
import { uploadImage, transformImageController, getImageById, listImages } from '../controllers/imageController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate, transformSchema } from '../middleware/validation';

const router = Router();

// GET /api/images - List all images with pagination
router.get('/', authMiddleware, listImages);

// GET /api/images/:id - Get specific image
router.get('/:id', authMiddleware, getImageById);

// POST /api/images - Upload image
router.post('/', authMiddleware, upload.single('image'), uploadImage);

// POST /api/images/:id/transform - Transform image
router.post('/:id/transform', authMiddleware, validate(transformSchema), transformImageController);

export default router;