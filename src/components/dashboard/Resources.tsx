import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Plus, Download, Pencil, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ResourceDetails from "./ResourceDetails";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadDate: string;
  category: string;
  tags: string[];
  downloads: number;
}

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const { userData, currentUser, demoMode } = useAuth();
  const isAuthenticated = Boolean(currentUser || demoMode);
  
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "resources"), orderBy("uploadDate", "desc"));
        
        if (activeCategory !== "all") {
          q = query(q, where("category", "==", activeCategory));
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedResources: Resource[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedResources.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileType: data.fileType,
            uploadedBy: data.uploadedBy,
            uploadDate: data.uploadDate,
            category: data.category,
            tags: data.tags,
            downloads: data.downloads,
          });
        });
        
        setResources(fetchedResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Error",
          description: "Failed to load resources.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [activeCategory, toast]);
  
  useEffect(() => {
    // Extract unique categories and tags from resources
    const uniqueCategories = [...new Set(resources.map(r => r.category))];
    const allTags = resources.map(r => r.tags).flat();
    const uniqueTags = [...new Set(allTags)];
    
    setCategories(uniqueCategories);
    setTags(uniqueTags);
  }, [resources]);
  
  const filteredResources = resources.filter(resource => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(searchTerm) ||
      resource.description.toLowerCase().includes(searchTerm) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning Resources</h1>
        
        {isAuthenticated && (
          <Button 
            variant="default" 
            className="bg-edu-secondary hover:bg-edu-secondary/90 flex items-center gap-1"
            onClick={() => window.dispatchEvent(new Event('openPostForm'))}
          >
            <Plus className="h-4 w-4" />
            <span>Upload Resource</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
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
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-20">
          <p className="text-gray-500 mb-4">No resources found</p>
          <p className="text-sm text-center max-w-md">
            {isAuthenticated ? (
              <>
                Be the first to upload a resource! Click the "Upload Resource" button at the top of the page.
              </>
            ) : (
              <>
                Sign in to upload resources or explore more content.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card 
              key={resource.id} 
              className="edu-card overflow-hidden hover:scale-105 transition-transform duration-200"
              onClick={() => setSelectedResource(resource)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{resource.title}</h3>
                  <span className="text-sm text-gray-500">{resource.fileType}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Uploaded by: {resource.uploadedBy}</span>
                  <span>{resource.uploadDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedResource && (
        <ResourceDetails 
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default Resources;
