import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db, formatTimestamp } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp, 
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  role?: string;
}

const Messages = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userData, currentUser } = useAuth();
  const { toast } = useToast();
  
  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        // Get all users
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        
        const contactsList: Contact[] = [];
        querySnapshot.forEach(doc => {
          // Don't include current user as a contact
          if (doc.id !== currentUser.uid) {
            const data = doc.data();
            contactsList.push({
              id: doc.id,
              name: data.name || "Unknown User",
              avatar: data.avatar || "",
              role: data.role || "user",
              unreadCount: 0, // Will be updated later
            });
          }
        });

        // Get message threads for unread counts and last messages
        const messagesRef = collection(db, "messages");
        
        // Get messages where current user is receiver
        const receiverQuery = query(
          messagesRef, 
          where("receiverId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        // Get messages where current user is sender
        const senderQuery = query(
          messagesRef, 
          where("senderId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const receiverSnapshot = await getDocs(receiverQuery);
        const senderSnapshot = await getDocs(senderQuery);
        
        // Process messages to get unread counts and last messages
        const processedContacts = new Map<string, Contact>();
        
        // First add all contacts to the map
        contactsList.forEach(contact => {
          processedContacts.set(contact.id, contact);
        });
        
        // Process received messages
        receiverSnapshot.forEach(doc => {
          const message = doc.data();
          const contactId = message.senderId;
          
          if (processedContacts.has(contactId)) {
            const contact = processedContacts.get(contactId)!;
            
            // Update unread count
            if (!message.read) {
              contact.unreadCount += 1;
            }
            
            // Update last message if this is more recent
            if (!contact.lastMessageTime || message.timestamp.toDate() > contact.lastMessageTime) {
              contact.lastMessage = message.content;
              contact.lastMessageTime = message.timestamp.toDate();
            }
            
            processedContacts.set(contactId, contact);
          }
        });
        
        // Process sent messages for last message information
        senderSnapshot.forEach(doc => {
          const message = doc.data();
          const contactId = message.receiverId;
          
          if (processedContacts.has(contactId)) {
            const contact = processedContacts.get(contactId)!;
            
            // Update last message if this is more recent
            if (!contact.lastMessageTime || message.timestamp.toDate() > contact.lastMessageTime) {
              contact.lastMessage = message.content;
              contact.lastMessageTime = message.timestamp.toDate();
            }
            
            processedContacts.set(contactId, contact);
          }
        });
        
        // Sort contacts by last message time
        const sortedContacts = Array.from(processedContacts.values())
          .sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
          });
        
        setContacts(sortedContacts);
        
        // Select first contact if available
        if (sortedContacts.length > 0 && !selectedContact) {
          setSelectedContact(sortedContacts[0]);
        }
        
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser, toast]);
  
  // Fetch messages when selected contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser?.uid || !selectedContact) return;
      
      try {
        const messagesRef = collection(db, "messages");
        
        // Create query for messages between current user and selected contact
        const q = query(
          messagesRef,
          where("senderId", "in", [currentUser.uid, selectedContact.id]),
          where("receiverId", "in", [currentUser.uid, selectedContact.id]),
          orderBy("timestamp", "asc")
        );
        
        // Use onSnapshot to get real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedMessages: Message[] = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            // Only include messages that are between these two users
            if (
              (data.senderId === currentUser.uid && data.receiverId === selectedContact.id) ||
              (data.senderId === selectedContact.id && data.receiverId === currentUser.uid)
            ) {
              fetchedMessages.push({
                id: doc.id,
                senderId: data.senderId,
                receiverId: data.receiverId,
                content: data.content,
                timestamp: data.timestamp.toDate(),
                read: data.read,
              });
            }
          });
          
          // Sort messages by timestamp
          fetchedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          setMessages(fetchedMessages);
          
          // Scroll to bottom of messages
          scrollToBottom();
        });
        
        // Clean up subscription on unmount
        return () => unsubscribe();
        
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchMessages();
  }, [currentUser, selectedContact, toast]);
  
  // Scroll to bottom of messages when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Update contact unread count to 0
    setContacts(contacts.map(c => {
      if (c.id === contact.id) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser?.uid || !selectedContact) return;
    
    try {
      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        receiverId: selectedContact.id,
        content: newMessage.trim(),
        timestamp: Timestamp.now(),
        read: false
      });
      
      // Clear input
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If message is from today, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from this week, show day
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[70vh]">
          {/* Contacts list */}
          <div className="bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10 bg-gray-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(70vh-81px)]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No contacts found
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id
                        ? "bg-edu-primary/10"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className={`${
                          contact.role === "teacher" ? "bg-edu-secondary" : 
                          contact.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                        } text-white`}>
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-edu-accent text-white flex items-center justify-center text-xs">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(contact.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      
                      {contact.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {contact.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="col-span-2 flex flex-col h-full bg-gray-50">
            {selectedContact ? (
              <>
                {/* Contact header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback className={`${
                        selectedContact.role === "teacher" ? "bg-edu-secondary" : 
                        selectedContact.role === "school" ? "bg-edu-primary" : "bg-edu-accent"
                      } text-white`}>
                        {getInitials(selectedContact.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">{selectedContact.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{selectedContact.role || "User"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUser?.uid ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg max-w-[80%] ${
                            message.senderId === currentUser?.uid
                              ? "bg-edu-primary text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === currentUser?.uid
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-edu-primary hover:bg-edu-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">Your Messages</h3>
                  <p className="text-gray-500 mt-2">Select a contact to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Messages;
