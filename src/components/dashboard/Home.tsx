
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, updateDoc, doc, increment } from "firebase/firestore";

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

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, currentUser, demoMode } = useAuth();
  const { toast } = useToast();
  
  // Check if the user is authenticated
  const isAuthenticated = Boolean(currentUser || demoMode);

  useEffect(() => {
    // Fetch real posts from Firebase
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
              name: data.author?.name || "Unknown User",
              role: data.author?.role || "user",
              avatar: data.author?.avatar || "",
            },
            content: data.content,
            media: data.media || undefined,
            mediaType: data.mediaType,
            timePosted: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : "Unknown time",
            likes: data.likes || 0,
            liked: false, // We'll manage this client-side
            comments: data.comments || 0,
            shares: data.shares || 0,
            saved: false, // We'll manage this client-side
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

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or sign up to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update UI first for responsiveness
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

      // Then update in Firestore
      const postRef = doc(db, "posts", postId);
      const updatedPost = posts.find(post => post.id === postId);
      
      if (updatedPost) {
        await updateDoc(postRef, {
          likes: updatedPost.likes
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert the UI change on error
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const revertedLiked = !post.liked;
          return {
            ...post,
            liked: revertedLiked,
            likes: revertedLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      }));
    }
  };

  const handleSave = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or sign up to save posts.",
        variant: "destructive",
      });
      return;
    }
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, saved: !post.saved };
      }
      return post;
    }));
  };

  const handleComment = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or sign up to comment on posts.",
        variant: "destructive",
      });
      return;
    }
    
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
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-20">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <p className="text-sm text-center max-w-md">
            Be the first to share something with the community! Click the "Create Post" button at the top of the page.
          </p>
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
      )}
    </div>
  );
};

export default Home;
