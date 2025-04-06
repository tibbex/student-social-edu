
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, FileText, Video, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PostFormProps {
  onClose: () => void;
}

const PostForm = ({ onClose }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { userData } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && attachments.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty post",
        description: "Please add some content or attachments to your post.",
      });
      return;
    }
    
    // Here you would post to Firebase
    toast({
      title: "Post created",
      description: "Your post has been published successfully.",
    });
    
    onClose();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getInitials = () => {
    if (!userData?.name) return "U";
    
    const nameParts = userData.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="flex gap-3 mb-4">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className={`${
                  userData?.role === "teacher" ? "bg-edu-secondary" : 
                  userData?.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                } text-white`}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userData?.name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <Textarea
                placeholder="What would you like to share?"
                className="min-h-[120px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            
            {attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                <Label>Attachments</Label>
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="relative bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith("image/") ? (
                          <Image className="h-5 w-5 text-edu-primary" />
                        ) : file.type.startsWith("video/") ? (
                          <Video className="h-5 w-5 text-edu-accent" />
                        ) : (
                          <FileText className="h-5 w-5 text-edu-secondary" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full border border-gray-200 shadow-sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={handleAttachmentChange}
                accept="image/*"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <Image className="h-4 w-4" />
                  <span>Image</span>
                </Button>
              </Label>
              
              <input
                type="file"
                id="video-upload"
                className="hidden"
                onChange={handleAttachmentChange}
                accept="video/*"
              />
              <Label htmlFor="video-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </Button>
              </Label>
              
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleAttachmentChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-600"
                >
                  <FileText className="h-4 w-4" />
                  <span>File</span>
                </Button>
              </Label>
            </div>
            
            <Button 
              type="submit"
              className="flex items-center gap-1 bg-edu-primary hover:bg-edu-primary/90"
              disabled={!content.trim() && attachments.length === 0}
            >
              <Send className="h-4 w-4" />
              <span>Post</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
