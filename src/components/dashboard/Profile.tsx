
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, UserCircle, BookOpen, MessageSquare, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { userData, demoMode } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    location: userData?.location || "",
    schoolName: userData?.schoolName || "",
    role: userData?.role || "student"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (demoMode) {
      toast({
        title: "Demo mode",
        description: "Profile updates are disabled in demo mode.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would update the user profile in Firebase
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!formData.name) return "U";
    
    const nameParts = formData.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="edu-card">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src="" />
                <AvatarFallback className={`text-3xl ${
                  formData.role === "teacher" ? "bg-edu-secondary" : 
                  formData.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                } text-white`}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold">{formData.name || "User"}</h2>
              <p className="text-sm text-gray-500 capitalize">{formData.role}</p>
              
              <div className="w-full mt-6">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "Profile picture upload will be available in the next update.",
                  })}
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Change Photo</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="edu-card mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-edu-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-edu-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Resources</p>
                    <p className="font-medium">{demoMode ? 12 : 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-edu-secondary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-edu-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Messages</p>
                    <p className="font-medium">{demoMode ? 3 : 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-edu-accent/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-edu-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Notifications</p>
                    <p className="font-medium">{demoMode ? 5 : 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="edu-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? "bg-green-500 text-white hover:bg-green-600" : ""}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="information">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="information">Basic Information</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="information" className="mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        disabled={!isEditing || demoMode}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="schoolName">School/Institution</Label>
                      <Input 
                        id="schoolName" 
                        name="schoolName" 
                        value={formData.schoolName} 
                        onChange={handleInputChange}
                        disabled={!isEditing || formData.role === "school"}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-gray-500">Account settings will be available in the next update.</p>
                    
                    <Button 
                      className="w-full"
                      onClick={() => toast({
                        title: "Feature coming soon",
                        description: "Account settings will be available in the next update.",
                      })}
                    >
                      Update Settings
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
