"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error");
  
  // Map error codes to user-friendly messages
  const getErrorMessage = () => {
    switch (errorType) {
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "OAuthAccountNotLinked":
        return "There was a problem with your Google sign-in. Please try again.";
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again.";
      case "SessionRequired":
        return "You need to be signed in to access this page.";
      case "Default":
      default:
        return error?.message || "An unexpected authentication error occurred.";
    }
  };

  useEffect(() => {
    // Log the error to the console for debugging
    console.error("Authentication error:", errorType, error);
  }, [error, errorType]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">
              Authentication Error
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {getErrorMessage()}
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              Back to Login
            </Button>
            
            <Button 
              onClick={() => reset()} 
              variant="outline" 
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
