import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Target, Calendar, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { format } from "date-fns";

interface FeedPost {
  id: string;
  type: 'goal' | 'achievement' | 'blog' | 'progress';
  user: {
    id: string;
    name: string;
    avatar?: string;
    username: string;
  };
  content: {
    title: string;
    description: string;
    tags?: string[];
    progress?: number;
    goalTitle?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: Date;
  isLiked: boolean;
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'goals' | 'achievements' | 'blogs'>('all');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockPosts: FeedPost[] = [
      {
        id: '1',
        type: 'goal',
        user: {
          id: '1',
          name: 'Sarah Johnson',
          username: '@sarah_j',
          avatar: ''
        },
        content: {
          title: 'New Year, New Goals!',
          description: 'Just committed to reading 50 books this year and exercising 5 days a week. Accountability starts now! 📚💪',
          tags: ['reading', 'fitness', '2025goals']
        },
        stats: { likes: 24, comments: 8, shares: 3 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isLiked: false
      },
      {
        id: '2',
        type: 'achievement',
        user: {
          id: '2',
          name: 'Mike Chen',
          username: '@mike_codes',
          avatar: ''
        },
        content: {
          title: 'Day 30 Complete! 🎉',
          description: 'Just finished my 30th consecutive day of coding practice. The consistency is paying off!',
          progress: 30,
          goalTitle: '100 Days of Code Challenge'
        },
        stats: { likes: 45, comments: 12, shares: 7 },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isLiked: true
      },
      {
        id: '3',
        type: 'blog',
        user: {
          id: '3',
          name: 'Emma Wilson',
          username: '@emma_writes',
          avatar: ''
        },
        content: {
          title: 'The Power of Small Habits',
          description: 'Reflecting on how tiny daily actions have transformed my life over the past year. Sometimes the smallest steps lead to the biggest changes...',
          tags: ['habits', 'reflection', 'growth']
        },
        stats: { likes: 67, comments: 23, shares: 15 },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isLiked: false
      }
    ];
    setPosts(mockPosts);
  }, []);

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            stats: { 
              ...post.stats, 
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 
            }
          }
        : post
    ));
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Target className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'blog': return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'goal': return 'Goal';
      case 'achievement': return 'Achievement';
      case 'blog': return 'Blog Post';
      default: return 'Update';
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => {
        if (filter === 'goals') return post.type === 'goal';
        if (filter === 'achievements') return post.type === 'achievement';
        if (filter === 'blogs') return post.type === 'blog';
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar currentPage="feed" />
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            See what others are achieving and get inspired by the community
          </p>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Posts' },
              { key: 'goals', label: 'Goals' },
              { key: 'achievements', label: 'Achievements' },
              { key: 'blogs', label: 'Blog Posts' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as any)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>
                        {post.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{post.user.name}</p>
                        <p className="text-sm text-muted-foreground">{post.user.username}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getPostIcon(post.type)}
                        <span>{getTypeLabel(post.type)}</span>
                        <span>•</span>
                        <span>{format(post.createdAt, 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{getTypeLabel(post.type)}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{post.content.title}</h3>
                  <p className="text-foreground leading-relaxed">{post.content.description}</p>
                  
                  {post.content.progress !== undefined && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{post.content.goalTitle}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          Day {post.content.progress}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(post.content.progress / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {post.content.tags && post.content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.content.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={post.isLiked ? "text-red-500" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.stats.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.stats.comments}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    {post.stats.shares}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "The community feed is empty. Be the first to share your goals!"
                    : `No ${filter} posts found. Try a different filter.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}