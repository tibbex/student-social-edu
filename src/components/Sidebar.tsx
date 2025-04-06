
import { NavLink } from "react-router-dom";
import { Home, PlayCircle, MessageCircle, BookOpen, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0 border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {userData?.role === "student" ? "Student Dashboard" : 
           userData?.role === "teacher" ? "Teacher Dashboard" : "School Dashboard"}
        </h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-edu-primary text-white" 
                    : "hover:bg-gray-100 text-gray-700"
                )}
                end={item.path === "/dashboard"}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2025 EduHub</p>
          <p>All rights reserved</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
