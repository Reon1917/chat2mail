"use client"
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="relative h-40 w-40">
          <Mail className="h-20 w-20 text-blue-500 animate-bounce" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative h-40 w-40 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mail className="h-20 w-20 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Chat2Mail
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Transform your email experience with AI-powered chat interface.
                Simple, intuitive, and efficient communication.
              </p>
              <div className="space-x-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                >
                  {session ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                  <Mail className="h-6 w-6 text-blue-500 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold">Smart Inbox</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  AI-powered email organization and prioritization
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-purple-100 p-4 dark:bg-purple-900">
                  <Mail className="h-6 w-6 text-purple-500 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-bold">Chat Interface</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Natural conversation-style email management
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-pink-100 p-4 dark:bg-pink-900">
                  <Mail className="h-6 w-6 text-pink-500 dark:text-pink-300" />
                </div>
                <h3 className="text-xl font-bold">Quick Actions</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Efficient email handling with smart suggestions
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
