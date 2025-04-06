
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, linkWithCredential } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";

import Logo from "@/components/Logo";
import { ArrowLeft, Loader2 } from "lucide-react";

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUserData } = useAuth();
  
  // Extract phone and userData from location state
  const phoneNumber = location.state?.phoneNumber;
  const userData = location.state?.userData;

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier && auth.app) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          setRecaptchaVerified(true);
          sendVerificationCode();
        },
        'expired-callback': () => {
          setRecaptchaVerified(false);
          toast({
            variant: "destructive",
            title: "reCAPTCHA expired",
            description: "Please verify the reCAPTCHA again.",
          });
        }
      }, auth);
      
      window.recaptchaVerifier.render();
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
      // Clean up recaptcha when component unmounts
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [phoneNumber, toast]);

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone number is required to send verification code.",
      });
      navigate("/");
      return;
    }
    
    try {
      setIsLoading(true);
      const formatPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formatPhone, 
        window.recaptchaVerifier
      );
      
      setVerificationId(confirmationResult.verificationId);
      
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
      
      // Reset countdown for resend
      setCountdown(60);
      setResendDisabled(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: "Could not send verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationId || !verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code.",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create credential from verification ID and code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Link the credential to the current user account
      if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential);
        
        if (userData) {
          setUserData(userData);
        }
        
        toast({
          title: "Verification successful",
          description: "Your account has been successfully verified.",
        });
        
        navigate("/dashboard");
      } else {
        throw new Error("No authenticated user found");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "The verification code is invalid or has expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (recaptchaVerified) {
      sendVerificationCode();
    } else {
      toast({
        variant: "default",
        title: "reCAPTCHA required",
        description: "Please complete the reCAPTCHA verification first.",
      });
    }
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
          <CardTitle className="text-2xl text-center text-edu-dark">Verify Your Account</CardTitle>
          <CardDescription className="text-center">
            Enter the verification code sent to your phone
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <InputOTP 
              maxLength={6}
              value={verificationCode}
              onChange={(value) => setVerificationCode(value)}
              className="gap-2"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div id="recaptcha-container" className="flex justify-center"></div>
          
          <Button 
            className="w-full"
            disabled={isLoading || verificationCode.length !== 6} 
            onClick={verifyCode}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : "Verify Code"}
          </Button>
          
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              <Button 
                variant="link" 
                disabled={resendDisabled || isLoading} 
                className="p-0 h-auto text-edu-primary"
                onClick={handleResendCode}
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend code"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCode;
