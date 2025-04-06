import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import { Laptop, Smartphone, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const { startDemoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter both email and password",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const userCredential = await signIn(email, password);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Navigate to verification page if email is not verified
        navigate("/verify", { 
          state: { 
            email: userCredential.user.email,
            userData: {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              // Other user data would need to be fetched from Firestore here
              role: "student" // Default role, should be fetched from Firestore
            }
          } 
        });
      } else {
        // Email already verified, navigate directly to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startDemo = (role: "student" | "teacher" | "school") => {
    startDemoMode(role);
    navigate("/dashboard");
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-edu-light via-white to-edu-primary/20 animate-fade-in ${
      viewMode === "mobile" ? "max-w-md mx-auto" : ""
    }`}>
      <div className="w-full max-w-md mb-6">
        <Logo />
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <div className="bg-white rounded-full p-1 flex space-x-1 shadow-md">
            <button 
              className={`rounded-full p-1 ${viewMode === "desktop" ? "bg-edu-primary text-white" : "bg-transparent text-gray-500"}`}
              onClick={() => setViewMode("desktop")}
            >
              <Laptop size={16} />
            </button>
            <button 
              className={`rounded-full p-1 ${viewMode === "mobile" ? "bg-edu-primary text-white" : "bg-transparent text-gray-500"}`}
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-edu-dark">Welcome to EduHub</CardTitle>
            <CardDescription className="text-center">Login to continue to your educational journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-edu-primary hover:underline">
                Sign up
              </Link>
            </div>
            
            <div className="w-full">
              <p className="text-xs text-center text-gray-500 mb-2">Try before signing up</p>
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="school">School</TabsTrigger>
                </TabsList>
                <TabsContent value="student" className="mt-0">
                  <Button 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => startDemo("student")}
                  >
                    Try as Student (10 min)
                  </Button>
                </TabsContent>
                <TabsContent value="teacher" className="mt-0">
                  <Button 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => startDemo("teacher")}
                  >
                    Try as Teacher (10 min)
                  </Button>
                </TabsContent>
                <TabsContent value="school" className="mt-0">
                  <Button 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => startDemo("school")}
                  >
                    Try as School (10 min)
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
