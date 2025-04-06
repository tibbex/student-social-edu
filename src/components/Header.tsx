
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, MessageCircle, User, FileText } from "lucide-react";
import { logout } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  openPostForm: () => void;
}

const Header = ({ openPostForm }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { userData, demoMode, endDemoMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      if (demoMode) {
        endDemoMode();
      } else {
        await logout();
      }
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred during logout.",
      });
    }
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
    <header className="bg-white shadow-sm py-3 px-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {!isMobile && <Logo />}
      </div>
      
      <div className="flex-1 mx-6 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for posts, resources, or users..."
            className="pl-10 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isMobile && (
          <Button 
            onClick={openPostForm} 
            className="bg-edu-accent hover:bg-edu-accent/90"
          >
            Create Post
          </Button>
        )}
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-edu-accent rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative" size="icon">
              <Avatar className="h-8 w-8 border-2 border-edu-primary">
                <AvatarFallback className="bg-edu-primary text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/messages")} className="cursor-pointer">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/resources")} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              {demoMode ? "End Demo" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
