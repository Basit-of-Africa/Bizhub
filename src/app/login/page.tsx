"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to help with debugging multiple accounts
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        toast({
          title: "Welcome to BizHub",
          description: `Successfully signed in as ${result.user.displayName || result.user.email}`,
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Authentication failed:", error);
      
      let errorMessage = "An unexpected error occurred during sign-in.";
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase project is not configured correctly. Check your API key.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "The sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase Authentication. Add it to the Firebase Console.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorMessage,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isConfigPlaceholder = process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined || 
                             process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder-api-key";

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {isConfigPlaceholder && (
          <Alert variant="destructive" className="bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription>
              Firebase placeholders detected. Please update <code>src/firebase/config.ts</code> with your real project credentials to enable sign-in.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Logo className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to BizHub</CardTitle>
            <CardDescription>Your Business Operating System. Sign in to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full py-6 text-lg" 
              onClick={handleSignIn} 
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Sign in with Google
            </Button>
            <p className="mt-6 text-center text-xs text-muted-foreground px-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
