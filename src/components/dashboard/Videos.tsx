
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: "educational" | "lecture" | "tutorial";
}

const sampleVideos: Video[] = [
  {
    id: "1",
    title: "Understanding Photosynthesis",
    creator: "Science Academy",
    thumbnail: "https://images.unsplash.com/photo-1618044733300-9472054094ee",
    duration: "12:34",
    views: 1245,
    category: "educational"
  },
  {
    id: "2",
    title: "World History: Ancient Civilizations",
    creator: "History Channel",
    thumbnail: "https://images.unsplash.com/photo-1563177978-4c5ea5de6473",
    duration: "28:17",
    views: 894,
    category: "lecture"
  },
  {
    id: "3",
    title: "Solving Quadratic Equations",
    creator: "Math Masters",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    duration: "15:42",
    views: 2567,
    category: "tutorial"
  },
  {
    id: "4",
    title: "Chemistry Lab Safety Procedures",
    creator: "Science Academy",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    duration: "08:52",
    views: 736,
    category: "educational"
  },
  {
    id: "5",
    title: "Learning Spanish: Basic Conversation",
    creator: "Language Institute",
    thumbnail: "https://images.unsplash.com/photo-1581097543550-5573a8f30468",
    duration: "19:23",
    views: 1823,
    category: "tutorial"
  },
  {
    id: "6",
    title: "Physics Principles in Daily Life",
    creator: "Science Academy",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    duration: "22:16",
    views: 1105,
    category: "lecture"
  },
];

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const filteredVideos = sampleVideos.filter(video => {
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

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6">Educational Videos</h1>
      
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
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
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
    </div>
  );
};

export default Videos;
