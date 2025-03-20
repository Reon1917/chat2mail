'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 mt-16">
        {/* Hero Section */}
        <section className="space-y-8 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
          <div className="max-w-[64rem] mx-auto flex flex-col items-center gap-4 text-center">
            <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-2.5 shadow-sm">
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Write Professional Emails in Seconds with{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Chat2Mail
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-gray-600 dark:text-gray-300 sm:text-xl sm:leading-8">
              Save time and communicate more effectively with our AI-powered email assistant.
              Perfect for professionals, teams, and anyone who wants to write better emails.
            </p>
            <div className="space-x-4 mt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 text-base">
                <Link href="/dashboard">
                  <Mail className="mr-2 h-4 w-4" />
                  Try Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="max-w-[58rem] mx-auto flex flex-col items-center space-y-4 text-center mb-12">
            <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-2.5 shadow-sm">
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-7">
              Everything you need to write better emails, faster.
            </p>
          </div>
          <div className="grid justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Sparkles className="h-12 w-12 text-indigo-500" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">AI-Powered</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Leverages Gemini AI to generate professional, context-aware emails in seconds.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <CheckCircle className="h-12 w-12 text-purple-500" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Time-Saving</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reduce email writing time by up to 80% with smart suggestions.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Mail className="h-12 w-12 text-pink-500" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Professional</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ensure your emails are always well-structured and error-free.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="max-w-[58rem] mx-auto flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-2.5 shadow-sm">
              <Mail className="h-5 w-5 text-indigo-500" />
            </div>
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="max-w-[85%] leading-normal text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-7">
              Join thousands of professionals who trust Chat2Mail
            </p>
            <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 text-base">
              <Link href="/register">
                Try Chat2Mail Free
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-500" />
            <p className="text-center text-sm leading-loose text-gray-600 dark:text-gray-300 md:text-left">
              Built with ❤️ by Chat2Mail Team
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-300 underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
