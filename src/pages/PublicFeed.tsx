
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Home from "@/components/dashboard/Home";
import Videos from "@/components/dashboard/Videos";
import Resources from "@/components/dashboard/Resources";

const PublicFeed = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update the URL without reloading
    switch(value) {
      case "posts":
        navigate('/', { replace: true });
        break;
      case "videos":
        navigate('/videos', { replace: true });
        break;
      case "resources":
        navigate('/resources', { replace: true });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-edu-background">
      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Educational Community</h1>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {activeTab === "posts" && <Home />}
        {activeTab === "videos" && <Videos />}
        {activeTab === "resources" && <Resources />}
      </main>
    </div>
  );
};

export default PublicFeed;
