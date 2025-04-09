
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
import { LogIn } from "lucide-react";

const Dashboard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const { currentUser, userData, demoMode, isEmailVerified } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if the user is authenticated
  const isAuthenticated = Boolean(currentUser || demoMode);

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
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in or sign up to post content.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
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
  }, [isEmailVerified, demoMode, toast, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-edu-background flex">
      {/* Sidebar for desktop - only show for authenticated users */}
      {!isMobile && isAuthenticated && <Sidebar />}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header
          openPostForm={() => {
            if (!isAuthenticated) {
              toast({
                title: "Authentication required",
                description: "Please log in or sign up to post content.",
                variant: "destructive",
              });
              navigate("/");
              return;
            }
            
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
        
        <main className="flex-1 p-4">
          {!isAuthenticated && (
            <div className="bg-edu-light/50 rounded-lg p-4 mb-4 flex justify-between items-center">
              <p className="text-sm">Sign in to post content and interact with the community</p>
              <Button onClick={() => navigate("/")} className="bg-edu-primary flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/messages" element={
              isAuthenticated ? <Messages /> : <Navigate to="/" />
            } />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={
              isAuthenticated ? <Profile /> : <Navigate to="/" />
            } />
          </Routes>
        </main>
        
        {/* Mobile Navigation - only show for authenticated users */}
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
