
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Book, FileText, Download } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import PublicHeader from "@/components/PublicHeader";
import { useNavigate } from "react-router-dom";

interface Resource {
  id: string;
  title: string;
  creator: string;
  thumbnail?: string;
  type: "book" | "worksheet" | "guide";
  subject: string;
  grade: string;
  downloads: number;
  description: string;
  fileUrl?: string;
}

const PublicResources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourcesRef = collection(db, "resources");
        const q = query(resourcesRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const resourcesList: Resource[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          resourcesList.push({
            id: doc.id,
            title: data.title || "Untitled Resource",
            creator: data.creator || "Unknown Creator",
            thumbnail: data.thumbnailUrl,
            type: data.type || "book",
            subject: data.subject || "General",
            grade: data.grade || "All grades",
            downloads: data.downloads || 0,
            description: data.description || "No description available",
            fileUrl: data.fileUrl
          });
        });
        
        setResources(resourcesList);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Error",
          description: "Failed to load resources. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [toast]);
  
  const filteredResources = resources.filter(resource => {
    return resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
           resource.grade.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDownloads = (downloads: number): string => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  const handleResourceDownload = (fileUrl?: string, resourceId?: string) => {
    if (!fileUrl) {
      toast({
        title: "Resource unavailable",
        description: "This resource cannot be downloaded at the moment.",
        variant: "destructive"
      });
      return;
    }
    
    // Open the file in a new tab
    window.open(fileUrl, '_blank');
    
    // In a real app, we would increment the download count here
    toast({
      title: "Download started",
      description: "Your resource is being downloaded.",
    });
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'book':
        return <Book className="h-5 w-5 text-edu-primary" />;
      default:
        return <FileText className="h-5 w-5 text-edu-secondary" />;
    }
  };

  return (
    <div className="min-h-screen bg-edu-background">
      <PublicHeader />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Books & Worksheets</h1>
          
          <Button 
            onClick={() => navigate("/register")}
            className="bg-edu-accent hover:bg-edu-accent/90"
          >
            Join to Share Resources
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative max-w-md w-full mx-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources by title, subject, or grade..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20">
            <p className="text-gray-500 mb-4">No resources found</p>
            <Button onClick={() => navigate("/register")}>
              Sign up to share the first resource
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="edu-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.creator}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="capitalize">{resource.type}</span>
                          <span className="inline-block mx-2">•</span>
                          <span>{resource.subject}</span>
                          <span className="inline-block mx-2">•</span>
                          <span>{resource.grade}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50">
                    <span className="text-xs text-gray-500">{formatDownloads(resource.downloads)} downloads</span>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleResourceDownload(resource.fileUrl, resource.id)}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
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

export default PublicResources;
