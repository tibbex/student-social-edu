import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, refreshUserState } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if email is verified
        const isVerified = user.emailVerified;
        setIsEmailVerified(isVerified);
        
        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = {
              id: user.uid,
              email: user.email,
              role: userDoc.data().role as UserRole,
              name: userDoc.data().name,
              phone: userDoc.data().phone,
              location: userDoc.data().location,
              ...(userDoc.data().schoolName && { schoolName: userDoc.data().schoolName }),
              ...(userDoc.data().grade && { grade: userDoc.data().grade }),
              ...(userDoc.data().age && { age: userDoc.data().age }),
              ...(userDoc.data().teachingGrades && { teachingGrades: userDoc.data().teachingGrades }),
              ...(userDoc.data().ceo && { ceo: userDoc.data().ceo }),
            };
            
            setUserDataState(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserDataState(null);
        setIsEmailVerified(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!demoMode && currentUser && !isEmailVerified) {
      const checkVerificationInterval = setInterval(async () => {
        const verified = await refreshUserState();
        if (verified) {
          setIsEmailVerified(true);
          clearInterval(checkVerificationInterval);
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully.",
          });
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(checkVerificationInterval);
    }
  }, [currentUser, demoMode, isEmailVerified, toast]);

  const setUserData = (data: UserData) => {
    setUserDataState(data);
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
