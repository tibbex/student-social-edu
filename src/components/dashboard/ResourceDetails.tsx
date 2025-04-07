
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, Calendar, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Resource } from "./Resources";

interface ResourceDetailsProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

const ResourceDetails = ({ resource, isOpen, onClose }: ResourceDetailsProps) => {
  const { toast } = useToast();

  if (!resource) return null;

  const handleDownload = () => {
    // Simulate download start
    toast({
      title: "Download started",
      description: `Your download of "${resource.title}" has started.`,
    });
    
    // Close the dialog
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {resource.type === "book" ? (
              <BookOpen className="h-5 w-5 text-edu-secondary" />
            ) : (
              <FileText className="h-5 w-5 text-edu-primary" />
            )}
            <span className="text-sm font-medium text-gray-600 uppercase">
              {resource.type}
            </span>
          </div>
          
          <DialogTitle className="text-xl">{resource.title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {resource.subject} • Grade {resource.gradeLevel}
          </DialogDescription>
        </DialogHeader>

        {resource.thumbnail && (
          <div className="w-full h-48 overflow-hidden rounded-md mb-4">
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-gray-600">
              {resource.description || 
                `This ${resource.type} covers essential ${resource.subject} concepts 
                for students in grades ${resource.gradeLevel}. Created by ${resource.author} 
                to enhance learning outcomes and provide quality educational materials.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{resource.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{resource.uploadDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{resource.downloads} downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{resource.pages || '10-20'} pages</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2 flex-col sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download {resource.type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetails;
