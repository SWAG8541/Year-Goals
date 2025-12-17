import { Router } from 'express';
import { authMiddleware } from '../auth';
import { BlogController } from '../controllers';

const router = Router();

router.get('/posts', authMiddleware, BlogController.getBlogPosts);
router.post('/posts', authMiddleware, BlogController.createBlogPost);

export { router as blogRoutes };