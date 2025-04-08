
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Book, Video } from "lucide-react";

const PublicHeader = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="w-36">
            <Logo />
          </Link>
          
          <nav className="hidden md:flex items-center ml-8 space-x-1">
            <Button 
              variant={location.pathname === '/' ? "secondary" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            
            <Button 
              variant={location.pathname === '/videos' ? "secondary" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/videos" className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                <span>Videos</span>
              </Link>
            </Button>
            
            <Button 
              variant={location.pathname === '/resources' ? "secondary" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link to="/resources" className="flex items-center gap-1">
                <Book className="h-4 w-4" />
                <span>Resources</span>
              </Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex gap-3">
          {currentUser ? (
            <Button asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden flex justify-center mt-4 border-t pt-2">
        <Button 
          variant={location.pathname === '/' ? "secondary" : "ghost"} 
          size="sm" 
          asChild
        >
          <Link to="/" className="flex-1 flex items-center justify-center">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button 
          variant={location.pathname === '/videos' ? "secondary" : "ghost"} 
          size="sm" 
          asChild
        >
          <Link to="/videos" className="flex-1 flex items-center justify-center">
            <Video className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button 
          variant={location.pathname === '/resources' ? "secondary" : "ghost"} 
          size="sm" 
          asChild
        >
          <Link to="/resources" className="flex-1 flex items-center justify-center">
            <Book className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default PublicHeader;
