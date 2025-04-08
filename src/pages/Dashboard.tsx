
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Home from "@/components/dashboard/Home";
import Videos from "@/components/dashboard/Videos";
import Messages from "@/components/dashboard/Messages";
import Resources from "@/components/dashboard/Resources";
import Profile from "@/components/dashboard/Profile";
import PostForm from "@/components/dashboard/PostForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Dashboard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const { currentUser, userData, demoMode, isEmailVerified } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = currentUser || demoMode;

  useEffect(() => {
    if (demoMode) {
      toast({
        title: "Demo Mode",
        description: "You're exploring EduHub in demo mode. Some features are limited.",
      });
    }
  }, [demoMode, toast]);

  useEffect(() => {
    // Event listener for opening post form from anywhere in the app
    const handleOpenPostForm = () => {
      if (!isEmailVerified && !demoMode) {
        toast({
          title: "Email verification required",
          description: "Please verify your email before posting content.",
          variant: "destructive",
        });
        return;
      }
      setShowPostForm(true);
    };

    window.addEventListener('openPostForm', handleOpenPostForm);
    
    return () => {
      window.removeEventListener('openPostForm', handleOpenPostForm);
    };
  }, [isEmailVerified, demoMode, toast]);

  // Public header for non-authenticated users
  const PublicHeader = () => (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="w-48">
        <Logo />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/register">Sign Up</Link>
        </Button>
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-edu-background flex">
      {/* Sidebar for desktop authenticated users */}
      {!isMobile && isAuthenticated && <Sidebar />}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {isAuthenticated ? (
          <Header
            openPostForm={() => {
              if (!isEmailVerified && !demoMode) {
                toast({
                  title: "Email verification required",
                  description: "Please verify your email before posting content.",
                  variant: "destructive",
                });
                return;
              }
              setShowPostForm(true);
            }}
          />
        ) : (
          <PublicHeader />
        )}
        
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        
        {/* Mobile Navigation for authenticated users */}
        {isMobile && isAuthenticated && <MobileNav />}
      </div>
      
      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm onClose={() => setShowPostForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;
