
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  
  useEffect(() => {
    // When user is verified and on verify page, redirect to dashboard
    if ((currentUser && isEmailVerified && window.location.pathname === "/verify") || 
        (demoMode && window.location.pathname === "/verify")) {
      window.location.href = "/dashboard";
    }
    
    // Add direct redirection for demo mode from root or login page
    if (demoMode && (window.location.pathname === "/" || window.location.pathname === "/login")) {
      window.location.href = "/dashboard";
    }
  }, [isEmailVerified, currentUser, demoMode]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-2xl text-edu-primary">Loading...</div>
    </div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyCode />} />
      <Route path="/dashboard/*" element={
        demoMode ? <Dashboard /> : 
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
