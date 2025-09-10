import { Router } from 'express';
import { uploadImage } from '../controllers/imageController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), uploadImage);

export default router;