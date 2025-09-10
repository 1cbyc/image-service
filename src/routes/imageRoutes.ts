import { Router } from 'express';
import { uploadImage, transformImageController } from '../controllers/imageController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// POST /api/images - Upload image
router.post('/', authMiddleware, upload.single('image'), uploadImage);

// POST /api/images/:id/transform - Transform image
router.post('/:id/transform', authMiddleware, transformImageController);

export default router;