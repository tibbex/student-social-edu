
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

type UserRole = 'student' | 'teacher' | 'school';

interface UserData {
  id: string;
  email: string | null;
  role: UserRole;
  name?: string;
  schoolName?: string;
  grade?: string;
  age?: number;
  location?: string;
  phone?: string;
  teachingGrades?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  demoMode: boolean;
  isEmailVerified: boolean;
  setUserData: (data: UserData) => void;
  startDemoMode: (role: UserRole) => void;
  endDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoTimeout, setDemoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsEmailVerified(user?.emailVerified || false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    // Here you would typically save this data to Firestore as well
  };

  const startDemoMode = (role: UserRole) => {
    // Create demo user
    setDemoMode(true);
    
    // Generate demo user data
    const demoUserData: UserData = {
      id: 'demo-user',
      email: 'demo@example.com',
      role: role,
      name: role === 'student' ? 'Demo Student' : 
            role === 'teacher' ? 'Demo Teacher' : 'Demo School',
    };
    
    setUserDataState(demoUserData);
    setIsEmailVerified(true); // Demo users are considered verified
    
    // Set a 10-minute timeout
    const timeout = setTimeout(() => {
      endDemoMode();
      toast({
        title: "Demo mode ended",
        description: "Your 10-minute demo period has expired.",
        variant: "destructive",
      });
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
    
    setDemoTimeout(timeout);
    
    toast({
      title: "Demo mode started",
      description: "You have 10 minutes to explore EduHub.",
    });
  };

  const endDemoMode = () => {
    if (demoTimeout) {
      clearTimeout(demoTimeout);
    }
    setDemoMode(false);
    setUserDataState(null);
    setIsEmailVerified(false);
  };

  const value = {
    currentUser,
    userData,
    loading,
    demoMode,
    isEmailVerified,
    setUserData,
    startDemoMode,
    endDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
