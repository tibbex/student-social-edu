
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VerifyCode from "./pages/VerifyCode";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Protected route component to handle authentication
const AppRoutes = () => {
  const { loading, isEmailVerified, currentUser, demoMode } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Check for localStorage demo mode
    const storedDemoMode = localStorage.getItem('demoMode') === 'true';
    
    // When user is verified and on verify page, redirect to dashboard
    if ((currentUser && isEmailVerified && location.pathname === "/verify") || 
        (demoMode && location.pathname === "/verify") || 
        (storedDemoMode && location.pathname === "/verify")) {
      window.location.href = "/dashboard";
    }
    
    // Add direct redirection for demo mode from root or login page
    if ((demoMode || storedDemoMode) && (location.pathname === "/" || location.pathname === "/login")) {
      window.location.href = "/dashboard";
    }
  }, [isEmailVerified, currentUser, demoMode, location.pathname]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-2xl text-edu-primary">Loading...</div>
    </div>;
  }
  
  // Check for localStorage demo mode
  const storedDemoMode = localStorage.getItem('demoMode') === 'true';
  
  return (
    <Routes>
      <Route path="/" element={
        demoMode || storedDemoMode ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/login" element={
        demoMode || storedDemoMode ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyCode />} />
      <Route path="/dashboard/*" element={
        demoMode || storedDemoMode ? <Dashboard /> : 
        (currentUser && isEmailVerified ? <Dashboard /> : <Navigate to="/" />)
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
