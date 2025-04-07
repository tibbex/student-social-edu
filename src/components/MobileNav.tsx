
import { NavLink } from "react-router-dom";
import { Home, PlayCircle, MessageCircle, BookOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MobileNav = () => {
  const { isEmailVerified, demoMode } = useAuth();
  const { toast } = useToast();
  
  const handlePostClick = () => {
    if (!isEmailVerified && !demoMode) {
      toast({
        title: "Email verification required",
        description: "Please verify your email before posting content.",
        variant: "destructive",
      });
      return;
    }
    
    // Trigger the post form visibility in Dashboard
    const event = new CustomEvent('openPostForm');
    window.dispatchEvent(event);
  };
  
  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: PlayCircle, label: "Videos", path: "/dashboard/videos" },
    { icon: Plus, label: "Post", action: handlePostClick },
    { icon: MessageCircle, label: "Messages", path: "/dashboard/messages" },
    { icon: BookOpen, label: "Resources", path: "/dashboard/resources" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <ul className="flex justify-around items-center">
        {menuItems.map((item, index) => (
          <li key={item.path || index} className="w-full">
            {item.action ? (
              <button 
                className="w-full flex flex-col items-center justify-center py-3"
                onClick={item.action}
              >
                <div className="h-12 w-12 rounded-full bg-edu-accent flex items-center justify-center text-white shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 py-3",
                  isActive ? "text-edu-primary" : "text-gray-500"
                )}
                end={item.path === "/dashboard"}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNav;
