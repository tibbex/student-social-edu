
import { useState, useEffect } from "react";
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
import { db, storage, uploadResource } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

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
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userData } = useAuth();
  
  // Fetch resources from Firebase
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
            title: data.title,
            type: data.type,
            subject: data.subject,
            gradeLevel: data.gradeLevel,
            author: data.author || "Unknown",
            uploadDate: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : "Unknown date",
            downloads: data.downloads || 0,
            thumbnail: data.thumbnail,
            description: data.description,
            pages: data.pages,
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
    if (resource.fileUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.setAttribute('download', resource.title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count (would be done in a real implementation)
      toast({
        title: "Download started",
        description: `Downloading ${resource.title}...`,
      });
    } else {
      toast({
        title: "Download unavailable",
        description: "This resource doesn't have a downloadable file.",
        variant: "destructive"
      });
    }
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

  const handlePostResource = async () => {
    // Validate form
    if (!resourceForm.title || !resourceForm.description || !resourceForm.file) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields and upload a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload file to Firebase Storage
      const fileName = `${Date.now()}_${resourceForm.file.name}`;
      const filePath = `resources/${fileName}`;
      const fileUrl = await uploadResource(resourceForm.file, filePath);
      
      // Create resource document in Firestore
      const resourceData = {
        title: resourceForm.title,
        type: resourceForm.type,
        subject: resourceForm.subject,
        gradeLevel: resourceForm.gradeLevel,
        description: resourceForm.description,
        fileUrl: fileUrl,
        author: userData?.name || "Anonymous",
        createdAt: Timestamp.now(),
        downloads: 0,
        pages: resourceForm.file ? Math.ceil(resourceForm.file.size / 100000).toString() : "Unknown" // Estimate pages
      };
      
      await addDoc(collection(db, "resources"), resourceData);
      
      toast({
        title: "Resource submitted",
        description: "Your resource has been published successfully.",
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
      
      // Refresh resources list
      const resourcesRef = collection(db, "resources");
      const q = query(resourcesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const resourcesList: Resource[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        resourcesList.push({
          id: doc.id,
          title: data.title,
          type: data.type,
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          author: data.author || "Unknown",
          uploadDate: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : "Unknown date",
          downloads: data.downloads || 0,
          thumbnail: data.thumbnail,
          description: data.description,
          pages: data.pages,
          fileUrl: data.fileUrl
        });
      });
      
      setResources(resourcesList);
      
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resource. Please try again.",
        variant: "destructive"
      });
    }
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
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-20">
          <p className="text-gray-500 mb-4">No resources found</p>
          <Button onClick={() => setIsPostDialogOpen(true)}>
            Be the first to post a resource
          </Button>
        </div>
      ) : (
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
      )}

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
