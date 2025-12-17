import { FeedPost } from '../models';

export class FeedService {
  static async getFeedPosts(userId: string) {
    const posts = await FeedPost.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    return posts.map(post => ({
      ...post.toObject(),
      user: {
        id: post.userId._id,
        name: `${post.userId.firstName || ''} ${post.userId.lastName || ''}`.trim() || post.userId.email,
        username: `@${post.userId.email.split('@')[0]}`,
        avatar: ''
      },
      isLiked: post.likedBy.includes(userId)
    }));
  }

  static async createFeedPost(userId: string, postData: { type: string; title: string; description: string; tags?: string[]; progress?: number; goalTitle?: string }) {
    const post = new FeedPost({ ...postData, userId });
    return post.save();
  }

  static async toggleLike(postId: string, userId: string) {
    const post = await FeedPost.findById(postId);
    if (!post) return null;
    
    const isLiked = post.likedBy.includes(userId);
    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => !id.equals(userId));
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    await post.save();
    return { liked: !isLiked, likes: post.likes };
  }
}