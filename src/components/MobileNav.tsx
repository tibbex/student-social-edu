
import { NavLink } from "react-router-dom";
import { Home, PlayCircle, MessageCircle, BookOpen, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: PlayCircle, label: "Videos", path: "/dashboard/videos" },
    { icon: Plus, label: "Post", path: "#post" },
    { icon: BookOpen, label: "Resources", path: "/dashboard/resources" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <ul className="flex justify-around items-center">
        {menuItems.map((item) => (
          <li key={item.path} className="w-full">
            {item.path === "#post" ? (
              <button className="w-full flex flex-col items-center justify-center py-3">
                <div className="h-12 w-12 rounded-full bg-edu-accent flex items-center justify-center text-white shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
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
