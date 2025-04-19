
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { auth, sendVerificationEmail, verifyEmail, checkVerificationCode, refreshUserState } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import Logo from "@/components/Logo";
import { ArrowLeft, Mail, AlertCircle, Loader2 } from "lucide-react";

const VerifyCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUserData, isEmailVerified, forceRedirectToDashboard } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Extract email and userData from location state
  const email = location.state?.email;
  const userData = location.state?.userData;

  // Check if we have an oobCode from the verification email link
  const oobCode = searchParams.get('oobCode');

  // Check automatic verification status - with immediate redirect
  useEffect(() => {
    if (isEmailVerified) {
      toast({
        title: "Email already verified",
        description: "Your account is verified. Redirecting to dashboard."
      });
      // Use immediate redirect for verified users
      forceRedirectToDashboard();
    }
  }, [isEmailVerified, forceRedirectToDashboard, toast]);

  useEffect(() => {
    // If oobCode is present in URL, verify it automatically
    if (oobCode) {
      verifyEmailWithCode(oobCode);
    }
  }, [oobCode]);

  useEffect(() => {
    // If there's no email or user data, redirect to login
    if (!email && !auth.currentUser?.email && !oobCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email provided for verification.",
      });
      navigate("/");
      return;
    }

    // If we have an email but no oobCode, send verification email automatically
    if ((email || auth.currentUser?.email) && !oobCode && !codeSent) {
      handleSendVerificationEmail();
    }
    
    // Countdown timer for resend
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [email, toast, navigate, oobCode, codeSent]);

  // Add an additional check to verify email status periodically - with faster checks
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (auth.currentUser && !isEmailVerified) {
        const verified = await refreshUserState();
        if (verified) {
          toast({
            title: "Email verified",
            description: "Your email has been successfully verified."
          });
          // Use immediate redirect for verified users
          forceRedirectToDashboard();
        }
      }
    };
    
    // Check every 3 seconds if email is verified
    const interval = setInterval(checkEmailVerification, 3000);
    return () => clearInterval(interval);
  }, [isEmailVerified, forceRedirectToDashboard, toast]);

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user found to send verification email.",
      });
      navigate("/");
      return;
    }
    
    try {
      setIsLoading(true);
      await sendVerificationEmail(auth.currentUser);
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and click the verification link.",
      });
      
      // Reset countdown for resend
      setCountdown(30);
      setResendDisabled(true);
      setCodeSent(true);
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        variant: "destructive",
        title: "Failed to send verification email",
        description: "Could not send verification email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailWithCode = async (code: string) => {
    try {
      setIsLoading(true);
      
      // Check if the code is valid
      await checkVerificationCode(code);
      
      // Verify the email with the action code
      await verifyEmail(code);
      
      if (userData) {
        setUserData(userData);
      }
      
      toast({
        title: "Verification successful",
        description: "Your email has been successfully verified. You can now post content on EduHub!",
      });
      
      // Use immediate force redirect instead of normal navigation
      forceRedirectToDashboard();
      
    } catch (error) {
      console.error("Error verifying email:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The verification link is invalid or has expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    handleSendVerificationEmail();
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-edu-light via-white to-edu-primary/20 animate-fade-in">
      <div className="w-full max-w-md mb-6">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader>
          <Button 
            variant="ghost" 
            className="w-fit -mt-2 -ml-2" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <CardTitle className="text-2xl text-center text-edu-dark">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              We've sent a verification link to {email || auth.currentUser?.email}. 
              Click the link to verify your account.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <Button 
                  variant="link" 
                  disabled={resendDisabled || isLoading} 
                  className="p-0 h-auto text-edu-primary"
                  onClick={handleResendCode}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : "Resend email"}
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full text-center mb-2 text-sm text-gray-500">
            {isLoading && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking verification status...</span>
              </div>
            )}
          </div>
          <Button 
            className="w-full"
            onClick={handleGoBack}
            variant="outline"
          >
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyCode;
