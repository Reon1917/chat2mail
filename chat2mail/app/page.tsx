import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Mail, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <SiteHeader />
      
      <main className="container mx-auto px-4 relative flex flex-col items-center justify-center py-12 md:py-24">
        {/* Hero Section */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 px-4 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            <span>Powered by Gemini AI</span>
          </div>
          
          <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Write Professional Emails
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">
              in Seconds with AI
            </span>
          </h1>
          
          <p className="mb-8 max-w-[42rem] text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Chat2Mail helps you craft perfect emails for any situation. 
            Save time and communicate more effectively with our AI-powered email assistant.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              <Link href="/dashboard">
                <Mail className="mr-2 h-4 w-4" />
                Try Chat2Mail Now
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-indigo-200 hover:border-indigo-400 dark:border-indigo-800 dark:hover:border-indigo-600">
              <Link href="/register">
                <ArrowRight className="mr-2 h-4 w-4" />
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-16 md:mt-24 w-full max-w-4xl">
          <h2 className="mb-8 md:mb-12 text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Chat2Mail</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-6 shadow-lg backdrop-blur-sm border-0">
              <div className="mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 p-2 w-fit">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Leverages Gemini AI to generate professional, context-aware emails in seconds.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-6 shadow-lg backdrop-blur-sm border-0">
              <div className="mb-4 rounded-full bg-purple-100 dark:bg-purple-900/50 p-2 w-fit">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Time-Saving</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reduce email writing time by up to 80% with our intuitive interface and smart suggestions.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-6 shadow-lg backdrop-blur-sm border-0">
              <div className="mb-4 rounded-full bg-pink-100 dark:bg-pink-900/50 p-2 w-fit">
                <Mail className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Professional</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ensure your emails are always well-structured, error-free, and professionally formatted.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-indigo-100 dark:border-indigo-900 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Chat2Mail</span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} Chat2Mail. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
