
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  media?: string;
  mediaType?: "image" | "video" | "document";
  timePosted: string;
  likes: number;
  liked: boolean;
  comments: number;
  shares: number;
  saved: boolean;
}

const demoData: Post[] = [
  {
    id: "1",
    author: {
      name: "Ms. Johnson",
      role: "teacher",
      avatar: "",
    },
    content: "Just shared a new algebra worksheet in the resources section! Check it out if you're in my Math 101 class. Let me know if you have any questions!",
    timePosted: "2 hours ago",
    likes: 24,
    liked: false,
    comments: 5,
    shares: 2,
    saved: false,
  },
  {
    id: "2",
    author: {
      name: "Central High School",
      role: "school",
      avatar: "",
    },
    content: "Reminder: Parent-teacher conferences will be held next Friday from 4-7 PM. Please sign up for a time slot by Wednesday.",
    media: "https://images.unsplash.com/photo-1577896851231-70ef18881754",
    mediaType: "image",
    timePosted: "5 hours ago",
    likes: 31,
    liked: false,
    comments: 12,
    shares: 8,
    saved: false,
  },
  {
    id: "3",
    author: {
      name: "Michael Lee",
      role: "student",
      avatar: "",
    },
    content: "Just submitted my science project! Anyone else working on it? I'd love to compare notes before the deadline on Friday.",
    timePosted: "Yesterday",
    likes: 16,
    liked: false,
    comments: 8,
    shares: 0,
    saved: false,
  },
];

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { userData } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch posts from Firebase
    setPosts(demoData);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, saved: !post.saved };
      }
      return post;
    }));
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Feature coming soon",
      description: "Comment functionality will be available in the next update.",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Share options",
      description: "Sharing options will be available in the next update.",
    });
  };

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="edu-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback className={`${
                        post.author.role === "teacher" ? "bg-edu-secondary" : 
                        post.author.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                      } text-white`}>
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <p className="text-xs text-gray-500">{post.timePosted}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                
                {post.media && post.mediaType === "image" && (
                  <div className="mb-4 rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={post.media} 
                      alt="Post content" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 ${post.liked ? "text-red-500" : "text-gray-500"}`}
                  >
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComment(post.id)}
                    className="flex items-center gap-1 text-gray-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1 text-gray-500"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSave(post.id)}
                  className={post.saved ? "text-edu-primary" : "text-gray-500"}
                >
                  <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
