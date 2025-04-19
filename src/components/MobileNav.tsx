
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <ul className="flex justify-around items-center px-2">
        {menuItems.map((item, index) => (
          <li key={item.path || index} className="relative">
            {item.action ? (
              <button 
                onClick={item.action}
                className="w-16 -mt-5 flex flex-col items-center justify-center"
              >
                <div className="h-12 w-12 rounded-full bg-edu-accent flex items-center justify-center text-white shadow-lg shadow-edu-accent/25">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="mt-1 text-xs font-medium text-gray-600">{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 py-3 w-16",
                  isActive ? "text-edu-primary" : "text-gray-500"
                )}
                end={item.path === "/dashboard"}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNav;
