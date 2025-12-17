import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PenTool, Calendar, Share2, Heart, MessageCircle, Eye } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [newPost, setNewPost] = useState({ 
    title: "", 
    content: "", 
    tags: "", 
    isPublic: true 
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const post: BlogPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      views: 0,
      isPublic: newPost.isPublic
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", tags: "", isPublic: true });
    setDialogOpen(false);
  };

  const sharePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      navigator.clipboard.writeText(`Check out my blog post: "${post.title}"`);
      // In real app, this would share to social media or generate shareable link
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar currentPage="blog" />
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Share your journey, thoughts, and experiences with the world
          </p>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PenTool className="w-4 h-4 mr-2" />
                Write Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Textarea
                  placeholder="Share your thoughts, experiences, or journey..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={8}
                />
                <Input
                  placeholder="Tags (comma separated): goals, journey, motivation"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newPost.isPublic}
                    onChange={(e) => setNewPost({ ...newPost, isPublic: e.target.checked })}
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    Make this post public (visible in Feed)
                  </label>
                </div>
                <Button onClick={createPost} className="w-full">Publish Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(post.createdAt, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </div>
                      <Badge variant={post.isPublic ? "default" : "secondary"}>
                        {post.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => sharePost(post.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {posts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start sharing your journey, thoughts, and experiences with your first blog post.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <PenTool className="w-4 h-4 mr-2" />
                  Write Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}