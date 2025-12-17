import { Response } from 'express';
import { AuthRequest } from '../auth';
import { FeedService } from '../services';
import { createFeedPostSchema } from '../../shared/schema';
import { z } from 'zod';

export class FeedController {
  static async getFeed(req: AuthRequest, res: Response) {
    try {
      const posts = await FeedService.getFeedPosts(req.userId!);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ message: 'Failed to fetch feed' });
    }
  }

  static async createFeedPost(req: AuthRequest, res: Response) {
    try {
      const data = createFeedPostSchema.parse(req.body);
      const post = await FeedService.createFeedPost(req.userId!, data);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Error creating feed post:', error);
      res.status(500).json({ message: 'Failed to create feed post' });
    }
  }

  static async toggleLike(req: AuthRequest, res: Response) {
    try {
      const result = await FeedService.toggleLike(req.params.id, req.userId!);
      if (!result) return res.status(404).json({ message: 'Post not found' });
      res.json(result);
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  }
}