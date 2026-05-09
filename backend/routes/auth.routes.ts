import express from 'express';
import { signup, login, getMe, googleAuth, refreshAccessToken, logout, forgotPassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);

export default router;
