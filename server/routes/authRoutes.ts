import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthController } from '../controllers/authController';

const router = Router();
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/google', AuthController.googleLogin);
router.get('/user', authMiddleware, AuthController.getUser);
router.put('/profile', authMiddleware, AuthController.updateProfile);

export { router as authRoutes };
