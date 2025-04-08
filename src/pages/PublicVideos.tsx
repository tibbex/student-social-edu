
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import PublicHeader from "@/components/PublicHeader";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: "educational" | "lecture" | "tutorial";
  description: string;
  videoUrl?: string;
}

const PublicVideos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const videosRef = collection(db, "videos");
        const q = query(videosRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const videosList: Video[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          videosList.push({
            id: doc.id,
            title: data.title || "Untitled Video",
            creator: data.creator || "Unknown Creator",
            thumbnail: data.thumbnailUrl || "https://images.unsplash.com/photo-1618044733300-9472054094ee",
            duration: data.duration || "00:00",
            views: data.views || 0,
            category: data.category || "educational",
            description: data.description || "No description available",
            videoUrl: data.videoUrl
          });
        });
        
        setVideos(videosList);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast({
          title: "Error",
          description: "Failed to load videos. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [toast]);
  
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.creator.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || video.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatViews = (views: number): string => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handlePlayVideo = (videoUrl?: string) => {
    if (!videoUrl) {
      toast({
        title: "Video unavailable",
        description: "This video cannot be played at the moment.",
        variant: "destructive"
      });
      return;
    }
    
    // Open the video in a new tab
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-edu-background">
      <PublicHeader />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Educational Videos</h1>
          
          <Button 
            onClick={() => navigate("/register")}
            className="bg-edu-accent hover:bg-edu-accent/90"
          >
            Join to Upload Videos
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search videos..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="educational">Educational</TabsTrigger>
              <TabsTrigger value="lecture">Lectures</TabsTrigger>
              <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <p className="text-gray-500 mb-4">No videos found</p>
            <Button onClick={() => navigate("/register")}>
              Sign up to upload the first video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="edu-card overflow-hidden card-hover">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handlePlayVideo(video.videoUrl)}
                    >
                      <div className="h-12 w-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                        <Play className="h-6 w-6 text-edu-primary" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{video.creator}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{formatViews(video.views)} views</span>
                      <span className="inline-block mx-2">•</span>
                      <span className="capitalize">{video.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVideos;
