
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Laptop, Smartphone } from "lucide-react";
import Logo from "@/components/Logo";

type UserRole = "student" | "teacher" | "school";

const Register = () => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  // Student specific fields
  const [studentSchool, setStudentSchool] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  
  // Teacher specific fields
  const [teacherSchool, setTeacherSchool] = useState("");
  const [teachingGrades, setTeachingGrades] = useState("");
  
  // School specific fields
  const [ceo, setCeo] = useState("");

  const { setUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    // Basic validation
    if (!email || !password || !confirmPassword || !name || !phone || !location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Your passwords do not match.",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    // Role-specific validation
    if (activeTab === "student") {
      if (!studentSchool || !age || !grade) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all student details.",
        });
        return false;
      }
    } else if (activeTab === "teacher") {
      if (!teacherSchool || !teachingGrades) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all teacher details.",
        });
        return false;
      }
    } else if (activeTab === "school") {
      if (!ceo) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all school details.",
        });
        return false;
      }
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Register user with Firebase
      const userCredential = await createUser(email, password);
      
      // Prepare user data based on role
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        role: activeTab,
        name,
        phone,
        location,
        ...(activeTab === "student" && {
          schoolName: studentSchool,
          age: parseInt(age),
          grade
        }),
        ...(activeTab === "teacher" && {
          schoolName: teacherSchool,
          teachingGrades: teachingGrades.split(",").map(g => g.trim())
        }),
        ...(activeTab === "school" && {
          ceo
        })
      };
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      // Update context
      setUserData(userData);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      
      toast({
        title: "Registration successful",
        description: "Welcome to EduHub!",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-edu-light via-white to-edu-primary/20 animate-fade-in ${
      viewMode === "mobile" ? "max-w-md mx-auto" : ""
    }`}>
      <div className="w-full max-w-md mb-6">
        <Logo />
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="text-edu-primary hover:underline">
            ← Back to login
          </Link>
          
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
            <CardTitle className="text-2xl text-center text-edu-dark">Create Your Account</CardTitle>
            <CardDescription className="text-center">Join EduHub as a student, teacher, or school</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)} className="w-full mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="school">School</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleRegister}>
              <div className="grid gap-4">
                {/* Common fields for all roles */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Your phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location/Address</Label>
                  <Input 
                    id="location" 
                    placeholder="Your address" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                {/* Role-specific fields */}
                {activeTab === "student" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="studentSchool">School Name</Label>
                      <Input 
                        id="studentSchool" 
                        placeholder="Your school name" 
                        value={studentSchool}
                        onChange={(e) => setStudentSchool(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        placeholder="Your age" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="input-field"
                        min="5"
                        max="30"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="grade">Grade/Class</Label>
                      <Input 
                        id="grade" 
                        placeholder="Your grade or class" 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </>
                )}
                
                {activeTab === "teacher" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="teacherSchool">School Name</Label>
                      <Input 
                        id="teacherSchool" 
                        placeholder="School where you teach" 
                        value={teacherSchool}
                        onChange={(e) => setTeacherSchool(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="teachingGrades">Grades You Teach</Label>
                      <Input 
                        id="teachingGrades" 
                        placeholder="e.g. 9, 10, 11" 
                        value={teachingGrades}
                        onChange={(e) => setTeachingGrades(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </>
                )}
                
                {activeTab === "school" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="ceo">Principal/CEO Name</Label>
                      <Input 
                        id="ceo" 
                        placeholder="Principal or CEO name" 
                        value={ceo}
                        onChange={(e) => setCeo(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Password fields */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create a strong password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {isLoading ? "Signing up..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
