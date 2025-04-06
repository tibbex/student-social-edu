
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileText, BookOpen, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  type: "book" | "worksheet";
  subject: string;
  gradeLevel: string;
  author: string;
  uploadDate: string;
  downloads: number;
  thumbnail?: string;
}

const sampleResources: Resource[] = [
  {
    id: "1",
    title: "Advanced Algebra Concepts",
    type: "book",
    subject: "Mathematics",
    gradeLevel: "11-12",
    author: "Dr. Michael Chen",
    uploadDate: "March 15, 2025",
    downloads: 342,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb"
  },
  {
    id: "2",
    title: "Biology Cell Structure Worksheet",
    type: "worksheet",
    subject: "Biology",
    gradeLevel: "9-10",
    author: "Sarah Johnson",
    uploadDate: "April 1, 2025",
    downloads: 186
  },
  {
    id: "3",
    title: "World History: Ancient Egypt",
    type: "book",
    subject: "History",
    gradeLevel: "8-9",
    author: "Prof. James Miller",
    uploadDate: "February 22, 2025",
    downloads: 271,
    thumbnail: "https://images.unsplash.com/photo-1608834467043-629294cc5944"
  },
  {
    id: "4",
    title: "Grammar Practice Exercises",
    type: "worksheet",
    subject: "English",
    gradeLevel: "7-8",
    author: "Lisa Williams",
    uploadDate: "March 28, 2025",
    downloads: 420
  },
  {
    id: "5",
    title: "Introduction to Chemistry",
    type: "book",
    subject: "Chemistry",
    gradeLevel: "9-10",
    author: "Dr. Robert Lewis",
    uploadDate: "January 14, 2025",
    downloads: 185,
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6"
  },
  {
    id: "6",
    title: "Physics Problem Set - Forces",
    type: "worksheet",
    subject: "Physics",
    gradeLevel: "11-12",
    author: "Daniel Thompson",
    uploadDate: "March 10, 2025",
    downloads: 129
  }
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState<string>("all");
  const { toast } = useToast();
  
  const filteredResources = sampleResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = resourceType === "all" || resource.type === resourceType;
    
    return matchesSearch && matchesType;
  });

  const handleDownload = (resource: Resource) => {
    toast({
      title: "Download started",
      description: `Downloading ${resource.title}...`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6">Books & Worksheets</h1>
      
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
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          <Tabs 
            defaultValue="all" 
            value={resourceType}
            onValueChange={setResourceType}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="book">Books</TabsTrigger>
              <TabsTrigger value="worksheet">Worksheets</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="edu-card overflow-hidden card-hover">
            <CardContent className="p-0">
              {resource.thumbnail && (
                <div className="h-36 overflow-hidden">
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title}
                    className="w-full h-36 object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {resource.type === "book" ? (
                    <BookOpen className="h-4 w-4 text-edu-secondary mr-2" />
                  ) : (
                    <FileText className="h-4 w-4 text-edu-primary mr-2" />
                  )}
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {resource.type}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600">{resource.subject} • Grade {resource.gradeLevel}</p>
                  <p className="text-xs text-gray-500">By {resource.author}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {resource.downloads} downloads
                  </span>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Resources;
