import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  visibleTo?: string[];
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, currentUser, demoMode } = useAuth();
  const { toast } = useToast();
  
  const isAuthenticated = Boolean(currentUser || demoMode);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const postsRef = collection(db, "posts");
        let q = query(postsRef, orderBy("createdAt", "desc"));

        // Add role-based filtering
        if (userData && userData.role !== 'school') {
          q = query(q, where('visibleTo', 'array-contains', userData.role));
        }
        
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
            visibleTo: data.visibleTo || ['student', 'teacher', 'school'], // Default visibility
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
  }, [isAuthenticated, userData]);

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
    <ScrollArea className="h-[calc(100vh-5rem)] w-full">
      <div className="max-w-3xl mx-auto pb-16 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('openPostForm'))}
            className="bg-edu-accent hover:bg-edu-accent/90"
          >
            Share something
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="edu-card">
                <CardContent className="p-6">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="edu-card">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-edu-accent/10 p-4 mb-4">
                <MessageCircle className="h-8 w-8 text-edu-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Be the first to share something with the community!
              </p>
              <Button 
                onClick={() => window.dispatchEvent(new CustomEvent('openPostForm'))}
                className="bg-edu-accent hover:bg-edu-accent/90"
              >
                Create your first post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="edu-card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-edu-primary/10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback className={`${
                            post.author.role === "teacher" ? "bg-edu-secondary" : 
                            post.author.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                          } text-white text-lg`}>
                            {getInitials(post.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              {post.author.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{post.timePosted}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.media && post.mediaType === "image" && (
                      <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={post.media} 
                          alt="Post content" 
                          className="w-full h-auto max-h-96 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 ${post.liked ? "text-red-500" : "text-gray-600"}`}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                        <span className="text-sm">{post.likes}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{post.comments}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">{post.shares}</span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(post.id)}
                      className={post.saved ? "text-edu-primary" : "text-gray-600"}
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
    </ScrollArea>
  );
};

export default Home;
