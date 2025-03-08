import { Mail } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Mail className="h-12 w-12 text-blue-500 animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
