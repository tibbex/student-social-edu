
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

const Dashboard = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const { currentUser, userData, demoMode, isEmailVerified } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (demoMode) {
      toast({
        title: "Demo Mode",
        description: "You're exploring EduHub in demo mode. Some features are limited.",
      });
    }
  }, [demoMode, toast]);

  useEffect(() => {
    // If we have no user data (even in demo mode), redirect to home
    if (!demoMode && !currentUser) {
      navigate("/");
    }
  }, [currentUser, demoMode, navigate]);

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

  if (!userData && !demoMode) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-2xl text-edu-primary">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-edu-background flex">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
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
        
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
      </div>
      
      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm onClose={() => setShowPostForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;
