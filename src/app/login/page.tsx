
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
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
          <Button className="w-full py-6 text-lg" onClick={handleSignIn}>
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="mt-6 text-center text-xs text-muted-foreground px-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
