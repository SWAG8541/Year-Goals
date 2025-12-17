import { Router } from 'express';
import { authMiddleware } from '../auth';
import { FeedController } from '../controllers';

const router = Router();

router.get('/', authMiddleware, FeedController.getFeed);
router.post('/posts', authMiddleware, FeedController.createFeedPost);
router.post('/posts/:id/like', authMiddleware, FeedController.toggleLike);

export { router as feedRoutes };