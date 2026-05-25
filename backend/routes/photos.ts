import express from 'express';
import { createPhoto, getPhotos, updatePhoto, deletePhoto } from '../controllers/photo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Admin protected routes
router.post('/', authMiddleware, createPhoto);
router.get('/', getPhotos);
router.put('/:id', authMiddleware, updatePhoto);
router.delete('/:id', authMiddleware, deletePhoto);

export default router;
