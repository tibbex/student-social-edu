
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Book, Video, MoreHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PublicHeader from "@/components/PublicHeader";

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
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
            liked: false, // We'll track this client-side
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

  const handleLike = async (postId: string) => {
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

      // Then update in Firestore if user is logged in
      if (currentUser) {
        const postRef = doc(db, "posts", postId);
        const updatedPost = posts.find(post => post.id === postId);
        
        if (updatedPost) {
          await updateDoc(postRef, {
            likes: updatedPost.likes
          });
        }
      } else {
        // If not logged in, show a toast suggesting to login
        toast({
          title: "Want to save your likes?",
          description: "Sign in to keep track of your interactions.",
          action: (
            <Button size="sm" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          ),
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleComment = () => {
    if (!currentUser) {
      toast({
        title: "Sign in to comment",
        description: "Create an account or sign in to join the conversation.",
        action: (
          <Button size="sm" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        ),
      });
    } else {
      toast({
        title: "Feature coming soon",
        description: "Comment functionality will be available in the next update.",
      });
    }
  };

  const handleShare = () => {
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
    <div className="min-h-screen bg-edu-background">
      <PublicHeader />

      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-center">Educational Community</h1>
          
          {/* Public Resources Navigation */}
          <div className="flex justify-center gap-4 my-6">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/videos">
                <Video className="h-4 w-4" />
                <span>Videos</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/resources">
                <Book className="h-4 w-4" />
                <span>Resources</span>
              </Link>
            </Button>
          </div>
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
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 ${post.liked ? "text-red-500" : "text-gray-500"}`}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                        <span>{post.likes}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleComment}
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{post.shares}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!currentUser && (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-500">Want to join the conversation?</p>
                <div className="flex justify-center gap-3">
                  <Button asChild variant="outline">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign up to EduHub</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
