
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
  forceRedirectToDashboard: () => void;
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

  // Check for demo mode in localStorage on initial load
  useEffect(() => {
    const storedDemoMode = localStorage.getItem('demoMode');
    const storedDemoRole = localStorage.getItem('demoRole') as UserRole | null;
    
    if (storedDemoMode === 'true' && storedDemoRole) {
      setDemoMode(true);
      
      // Recreate demo user data
      const demoUserData: UserData = {
        id: 'demo-user',
        email: 'demo@example.com',
        role: storedDemoRole,
        name: storedDemoRole === 'student' ? 'Demo Student' : 
              storedDemoRole === 'teacher' ? 'Demo Teacher' : 'Demo School',
      };
      
      setUserDataState(demoUserData);
      setIsEmailVerified(true);
      
      // Reset the timeout
      const timeout = setTimeout(() => {
        endDemoMode();
        toast({
          title: "Demo mode ended",
          description: "Your 10-minute demo period has expired.",
          variant: "destructive",
        });
      }, 10 * 60 * 1000); // 10 minutes
      
      setDemoTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Force refresh the user to get the latest emailVerified status
        await refreshUserState();
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
      // Check verification status more frequently (every 5 seconds)
      const checkVerificationInterval = setInterval(async () => {
        const verified = await refreshUserState();
        if (verified) {
          setIsEmailVerified(true);
          clearInterval(checkVerificationInterval);
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully.",
          });
          
          // Auto-redirect to dashboard once verified
          window.location.href = "/dashboard";
        }
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(checkVerificationInterval);
    }
  }, [currentUser, demoMode, isEmailVerified, toast]);

  const setUserData = (data: UserData) => {
    setUserDataState(data);
  };

  const startDemoMode = (role: UserRole) => {
    // Create demo user
    setDemoMode(true);
    
    // Store demo mode in localStorage
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoRole', role);
    
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
    
    // Use window.location.href for reliable redirection in demo mode
    window.location.href = "/dashboard";
  };

  const endDemoMode = () => {
    if (demoTimeout) {
      clearTimeout(demoTimeout);
    }
    
    // Remove from localStorage
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    
    setDemoMode(false);
    setUserDataState(null);
    setIsEmailVerified(false);
    
    // Redirect to login page
    window.location.href = "/";
  };

  const forceRedirectToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const value = {
    currentUser,
    userData,
    loading,
    demoMode,
    isEmailVerified,
    setUserData,
    startDemoMode,
    endDemoMode,
    forceRedirectToDashboard
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
