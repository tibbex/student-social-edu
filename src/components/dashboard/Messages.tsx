
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isOutgoing: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    status?: "online" | "offline";
    lastSeen?: string;
    role: "student" | "teacher" | "school";
  };
  lastMessage: {
    text: string;
    timestamp: string;
    read: boolean;
  };
  messages: Message[];
}

const sampleConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "user1",
      name: "Mrs. Smith",
      role: "teacher",
      status: "online"
    },
    lastMessage: {
      text: "Don't forget about tomorrow's quiz!",
      timestamp: "10:32 AM",
      read: false
    },
    messages: [
      {
        id: "msg1",
        text: "Hello, I wanted to remind you about tomorrow's test.",
        sender: "user1",
        timestamp: "Yesterday, 4:30 PM",
        isOutgoing: false
      },
      {
        id: "msg2",
        text: "Thanks for the reminder! I'm preparing for it.",
        sender: "currentUser",
        timestamp: "Yesterday, 5:15 PM",
        isOutgoing: true
      },
      {
        id: "msg3",
        text: "Don't forget to review chapter 5 thoroughly.",
        sender: "user1",
        timestamp: "Yesterday, 5:20 PM",
        isOutgoing: false
      },
      {
        id: "msg4",
        text: "Will do. Any specific sections I should focus on?",
        sender: "currentUser",
        timestamp: "Yesterday, 5:45 PM",
        isOutgoing: true
      },
      {
        id: "msg5",
        text: "Don't forget about tomorrow's quiz!",
        sender: "user1",
        timestamp: "10:32 AM",
        isOutgoing: false
      }
    ]
  },
  {
    id: "2",
    participant: {
      id: "user2",
      name: "Jason Miller",
      role: "student",
      status: "offline",
      lastSeen: "30 minutes ago"
    },
    lastMessage: {
      text: "Did you finish the group project?",
      timestamp: "Yesterday",
      read: true
    },
    messages: []
  },
  {
    id: "3",
    participant: {
      id: "user3",
      name: "Central High School",
      role: "school",
      status: "online"
    },
    lastMessage: {
      text: "School will be closed on Monday due to maintenance",
      timestamp: "2 days ago",
      read: true
    },
    messages: []
  }
];

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
  const [newMessage, setNewMessage] = useState("");
  
  const { userData } = useAuth();
  const { toast } = useToast();

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      text: newMessage,
      sender: "currentUser",
      timestamp: "Just now",
      isOutgoing: true
    };
    
    // Update the selected conversation
    const updatedConversation: Conversation = {
      ...selectedConversation,
      lastMessage: {
        text: newMessage,
        timestamp: "Just now",
        read: true
      },
      messages: [...selectedConversation.messages, newMsg]
    };
    
    // Update the conversations list
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    
    setSelectedConversation(updatedConversation);
    setNewMessage("");
  };

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedConversation?.id === conversation.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.participant.avatar} />
                    <AvatarFallback className={`${
                      conversation.participant.role === "teacher" ? "bg-edu-secondary" : 
                      conversation.participant.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                    } text-white`}>
                      {getInitials(conversation.participant.name)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participant.status === "online" && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{conversation.participant.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${
                    !conversation.lastMessage.read ? "font-medium text-gray-800" : "text-gray-500"
                  }`}>
                    {conversation.lastMessage.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Conversation View */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.participant.avatar} />
                  <AvatarFallback className={`${
                    selectedConversation.participant.role === "teacher" ? "bg-edu-secondary" : 
                    selectedConversation.participant.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                  } text-white`}>
                    {getInitials(selectedConversation.participant.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.participant.status === "online" 
                      ? "Online" 
                      : `Last seen ${selectedConversation.participant.lastSeen || "recently"}`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isOutgoing 
                          ? "bg-edu-primary text-white rounded-br-none" 
                          : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isOutgoing ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>No messages yet</p>
                    <p>Start the conversation</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "File attachment will be available in the next update."
                  })}
                >
                  <PlusCircle className="h-5 w-5 text-gray-500" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  variant="ghost"
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-edu-primary text-white hover:bg-edu-primary/90 disabled:bg-gray-300"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a contact from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
