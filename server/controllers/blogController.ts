import { Response } from 'express';
import { AuthRequest } from '../auth';
import { BlogService } from '../services';
import { createBlogPostSchema } from '../../shared/schema';
import { z } from 'zod';

export class BlogController {
  static async getBlogPosts(req: AuthRequest, res: Response) {
    try {
      const posts = await BlogService.getBlogPostsByUserId(req.userId!);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  }

  static async createBlogPost(req: AuthRequest, res: Response) {
    try {
      const data = createBlogPostSchema.parse(req.body);
      const post = await BlogService.createBlogPost(req.userId!, data);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Error creating blog post:', error);
      res.status(500).json({ message: 'Failed to create blog post' });
    }
  }
}