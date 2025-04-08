
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Logo from "@/components/Logo";

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
  comments: number;
  shares: number;
}

const PublicFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts from Firebase
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const fetchedPosts: Post[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetchedPosts.push({
            id: doc.id,
            author: {
              name: data.userName || "Unknown User",
              role: data.userRole || "user",
              avatar: data.userAvatar || "",
            },
            content: data.content,
            media: data.media || undefined,
            mediaType: data.mediaType,
            timePosted: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : "Unknown time",
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0,
          });
        });
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="min-h-screen bg-edu-background">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="w-48">
          <Logo />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link to="/">Login</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Educational Community Posts</h1>
          <p className="text-gray-500">Join our community to post and interact with content</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <p className="text-gray-500 mb-4">No posts yet</p>
            <Button asChild>
              <Link to="/register">Join to be the first to share something!</Link>
            </Button>
          </div>
        ) : (
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
                        className="flex items-center gap-1 text-gray-500"
                        onClick={() => {}}
                      >
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-gray-500"
                        onClick={() => {}}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-gray-500"
                        onClick={() => {}}
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{post.shares}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center py-6">
              <p className="mb-4 text-gray-500">Want to join the conversation?</p>
              <Button asChild>
                <Link to="/register">Sign up to EduHub</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicFeed;
