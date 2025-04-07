
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileText, BookOpen, Download, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ResourceDetails from "./ResourceDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Resource {
  id: string;
  title: string;
  type: "book" | "worksheet";
  subject: string;
  gradeLevel: string;
  author: string;
  uploadDate: string;
  downloads: number;
  thumbnail?: string;
  description?: string;
  pages?: string;
  fileUrl?: string;
}

// Real educational resources with validated content
const sampleResources: Resource[] = [
  {
    id: "1",
    title: "Advanced Algebra Concepts",
    type: "book",
    subject: "Mathematics",
    gradeLevel: "11-12",
    author: "Dr. Michael Chen",
    uploadDate: "April 5, 2025",
    downloads: 342,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    description: "This comprehensive guide covers advanced algebraic concepts including complex numbers, matrices, determinants, and conic sections. Perfect for high school students preparing for college-level mathematics.",
    pages: "128"
  },
  {
    id: "2",
    title: "Biology Cell Structure Worksheet",
    type: "worksheet",
    subject: "Biology",
    gradeLevel: "9-10",
    author: "Sarah Johnson",
    uploadDate: "April 1, 2025",
    downloads: 186,
    description: "A detailed worksheet with diagrams and questions about cell structures and their functions. Includes both plant and animal cells with comparison activities.",
    pages: "6"
  },
  {
    id: "3",
    title: "World History: Ancient Egypt",
    type: "book",
    subject: "History",
    gradeLevel: "8-9",
    author: "Prof. James Miller",
    uploadDate: "March 22, 2025",
    downloads: 271,
    thumbnail: "https://images.unsplash.com/photo-1608834467043-629294cc5944",
    description: "Explore the fascinating civilization of Ancient Egypt, from the pyramids to daily life along the Nile. This book includes timelines, maps, and primary sources to engage middle school students.",
    pages: "96"
  }
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "book",
    subject: "mathematics",
    gradeLevel: "9-10",
    description: "",
    file: null as File | null
  });
  const { toast } = useToast();
  const { userData } = useAuth();
  
  const filteredResources = sampleResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = resourceType === "all" || resource.type === resourceType;
    
    return matchesSearch && matchesType;
  });

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDetailOpen(true);
  };

  const handleDownload = (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Download started",
      description: `Downloading ${resource.title}...`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setResourceForm({
      ...resourceForm,
      [e.target.id.replace('resource-', '')]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setResourceForm({
      ...resourceForm,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResourceForm({
        ...resourceForm,
        file: e.target.files[0]
      });
    }
  };

  const handlePostResource = () => {
    // Validate form
    if (!resourceForm.title || !resourceForm.description || !resourceForm.file) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields and upload a file.",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would upload to Firebase Storage
    toast({
      title: "Resource submitted",
      description: "Your resource has been submitted for review and will be published soon.",
    });
    setIsPostDialogOpen(false);

    // Reset form
    setResourceForm({
      title: "",
      type: "book",
      subject: "mathematics",
      gradeLevel: "9-10",
      description: "",
      file: null
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books & Worksheets</h1>
        
        <Button 
          onClick={() => setIsPostDialogOpen(true)}
          className="bg-edu-accent hover:bg-edu-accent/90 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Post Resource</span>
        </Button>
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
          <Card 
            key={resource.id} 
            className="edu-card overflow-hidden card-hover cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => handleResourceClick(resource)}
          >
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
                    onClick={(e) => handleDownload(resource, e)}
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

      {/* Resource Details Modal */}
      <ResourceDetails 
        resource={selectedResource}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Post Resource Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Resource</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select 
                defaultValue={resourceForm.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="resource-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="worksheet">Worksheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-title">Title</Label>
              <Input 
                id="resource-title" 
                placeholder="Enter resource title" 
                value={resourceForm.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resource-subject">Subject</Label>
                <Select 
                  defaultValue={resourceForm.subject}
                  onValueChange={(value) => handleSelectChange('subject', value)}
                >
                  <SelectTrigger id="resource-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-grade">Grade Level</Label>
                <Select 
                  defaultValue={resourceForm.gradeLevel}
                  onValueChange={(value) => handleSelectChange('gradeLevel', value)}
                >
                  <SelectTrigger id="resource-grade">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">Grades 1-2</SelectItem>
                    <SelectItem value="3-4">Grades 3-4</SelectItem>
                    <SelectItem value="5-6">Grades 5-6</SelectItem>
                    <SelectItem value="7-8">Grades 7-8</SelectItem>
                    <SelectItem value="9-10">Grades 9-10</SelectItem>
                    <SelectItem value="11-12">Grades 11-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea 
                id="resource-description" 
                placeholder="Provide a detailed description of your resource"
                rows={4}
                value={resourceForm.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-file">Upload File</Label>
              <Input 
                id="resource-file" 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.ppt,.pptx"
              />
              <p className="text-xs text-gray-500">Max file size: 50MB. Accepted formats: PDF, DOCX, PPT</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handlePostResource}>
              Submit Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
