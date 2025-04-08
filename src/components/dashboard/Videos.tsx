
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Plus, Video, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db, uploadVideo, formatTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    category: "educational",
    description: "",
    file: null as File | null,
    thumbnail: null as File | null
  });
  
  const { toast } = useToast();
  const { userData } = useAuth();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setVideoForm({
      ...videoForm,
      [e.target.id.replace('video-', '')]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setVideoForm({
      ...videoForm,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileType = e.target.id.includes('thumbnail') ? 'thumbnail' : 'file';
      setVideoForm({
        ...videoForm,
        [fileType]: e.target.files[0]
      });
    }
  };

  const handleUploadVideo = async () => {
    // Validate form
    if (!videoForm.title || !videoForm.description || !videoForm.file) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields and upload a video file.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload video file to Firebase Storage
      const videoFileName = `${Date.now()}_${videoForm.file.name}`;
      const videoPath = `videos/${videoFileName}`;
      const videoUrl = await uploadVideo(videoForm.file, videoPath);
      
      // Upload thumbnail if available, or use a default
      let thumbnailUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb";
      if (videoForm.thumbnail) {
        const thumbnailFileName = `${Date.now()}_${videoForm.thumbnail.name}`;
        const thumbnailPath = `thumbnails/${thumbnailFileName}`;
        thumbnailUrl = await uploadVideo(videoForm.thumbnail, thumbnailPath);
      }

      // Calculate rough duration (this would normally be done server-side or with a media processing library)
      // Just using a placeholder value based on file size for demo purposes
      const fileSizeInMB = videoForm.file.size / (1024 * 1024);
      const estimatedMinutes = Math.max(1, Math.round(fileSizeInMB / 5)); // Rough estimate: 5MB per minute
      const duration = `${String(Math.floor(estimatedMinutes / 60)).padStart(2, '0')}:${String(estimatedMinutes % 60).padStart(2, '0')}`;
      
      // Create video document in Firestore
      const videoData = {
        title: videoForm.title,
        category: videoForm.category,
        description: videoForm.description,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        creator: userData?.name || "Anonymous",
        duration: duration,
        views: 0,
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, "videos"), videoData);
      
      toast({
        title: "Video uploaded",
        description: "Your video has been published successfully.",
      });
      
      setIsUploadDialogOpen(false);
      
      // Reset form
      setVideoForm({
        title: "",
        category: "educational",
        description: "",
        file: null,
        thumbnail: null
      });
      
      // Refresh videos list
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
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    }
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
    
    // In a real app, you might want to increment the view count here
    toast({
      title: "Video playing",
      description: "The video is now playing in a new tab.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Educational Videos</h1>
        
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="bg-edu-accent hover:bg-edu-accent/90 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Video</span>
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
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            Be the first to upload a video
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

      {/* Upload Video Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input 
                id="video-title" 
                placeholder="Enter video title" 
                value={videoForm.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-category">Category</Label>
              <Select 
                defaultValue={videoForm.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="video-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea 
                id="video-description" 
                placeholder="Provide a detailed description of your video"
                rows={4}
                value={videoForm.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-file">Upload Video File</Label>
              <Input 
                id="video-file" 
                type="file" 
                onChange={handleFileChange}
                accept="video/*"
              />
              <p className="text-xs text-gray-500">Max file size: 500MB. Accepted formats: MP4, MOV, AVI, etc.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-thumbnail">Upload Thumbnail (Optional)</Label>
              <Input 
                id="video-thumbnail" 
                type="file" 
                onChange={handleFileChange}
                accept="image/*"
              />
              <p className="text-xs text-gray-500">Recommended size: 1280x720 pixels (16:9 ratio)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUploadVideo} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span>Upload Video</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Videos;
