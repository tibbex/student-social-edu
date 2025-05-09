import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, db, refreshUserState } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, getDoc } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const isMobile = useIsMobile();

  const { startDemoMode, setUserData, forceRedirectToDashboard, demoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedDemoMode = localStorage.getItem('demoMode');
    if (storedDemoMode === 'true' || demoMode) {
      navigate('/dashboard', { replace: true });
    }
  }, [demoMode, navigate]);

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    setRememberMe(remembered);
    
    if (remembered) {
      const savedEmail = localStorage.getItem("savedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

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
      
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedEmail");
      }
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          role: userDoc.data().role,
          name: userDoc.data().name,
          phone: userDoc.data().phone,
          location: userDoc.data().location,
          ...(userDoc.data().schoolName && { schoolName: userDoc.data().schoolName }),
          ...(userDoc.data().grade && { grade: userDoc.data().grade }),
          ...(userDoc.data().age && { age: userDoc.data().age }),
          ...(userDoc.data().teachingGrades && { teachingGrades: userDoc.data().teachingGrades }),
          ...(userDoc.data().ceo && { ceo: userDoc.data().ceo }),
        };
        
        setUserData(userData);
      }
      
      setVerifyingEmail(true);
      const isVerified = await refreshUserState();
      setVerifyingEmail(false);
      
      if (!isVerified) {
        navigate("/verify", { 
          state: { 
            email: userCredential.user.email,
          } 
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back to EduHub!",
        });
        forceRedirectToDashboard();
      }
    } catch (error) {
      console.error("Login error:", error);
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
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-edu-light via-white to-edu-primary/20 animate-fade-in">
      <div className="w-full max-w-md mb-6">
        <Logo />
      </div>
      
      <div className={`w-full ${isMobile ? "max-w-[95%]" : "max-w-md"}`}>
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
                <Button type="submit" className="btn-primary w-full" disabled={isLoading || verifyingEmail}>
                  {isLoading || verifyingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {verifyingEmail ? "Verifying..." : "Logging in..."}
                    </>
                  ) : (
                    "Login"
                  )}
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
