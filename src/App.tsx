
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
import Home from "./pages/Home";  // Renamed from PublicFeed to Home
import PublicResources from "./pages/PublicResources";  // New component for public resources
import PublicVideos from "./pages/PublicVideos";  // New component for public videos

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, demoMode } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-2xl text-edu-primary">Loading...</div>
    </div>;
  }
  
  // Allow access if user is logged in or in demo mode
  if (currentUser || demoMode) {
    return <>{children}</>;
  }
  
  // Redirect to login if not authorized
  return <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyCode />} />
      <Route path="/resources" element={<PublicResources />} />
      <Route path="/videos" element={<PublicVideos />} />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
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
