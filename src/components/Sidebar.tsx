
import { NavLink } from "react-router-dom";
import { Home, PlayCircle, MessageCircle, BookOpen, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const { userData } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: PlayCircle, label: "Videos", path: "/dashboard/videos" },
    { icon: MessageCircle, label: "Messaging", path: "/dashboard/messages" },
    { icon: BookOpen, label: "Books & Worksheets", path: "/dashboard/resources" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-edu-primary to-edu-accent bg-clip-text text-transparent">
          {userData?.role === "student" ? "Student View" : 
           userData?.role === "teacher" ? "Teacher Portal" : "School Dashboard"}
        </h2>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-edu-primary text-white shadow-md shadow-edu-primary/20" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  end={item.path === "/dashboard"}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-100">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Questions? Need help?
          </p>
          <Button className="w-full bg-edu-accent hover:bg-edu-accent/90">
            Contact Support
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
