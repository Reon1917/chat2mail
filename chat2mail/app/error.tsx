"use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4 max-w-md px-4 text-center">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Something went wrong!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => reset()}
            variant="default"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
