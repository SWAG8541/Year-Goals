import { BlogPost } from '../models';

export class BlogService {
  static async getBlogPostsByUserId(userId: string) {
    return BlogPost.find({ userId }).sort({ createdAt: -1 });
  }

  static async createBlogPost(userId: string, postData: { title: string; content: string; tags?: string[]; isPublic?: boolean }) {
    const post = new BlogPost({ ...postData, userId });
    return post.save();
  }
}