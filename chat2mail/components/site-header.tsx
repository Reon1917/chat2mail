"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Mail, LogOut, LogIn, Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";
  
  // Simplified display name function
  const getDisplayName = () => {
    if (!session?.user?.name) {
      return session?.user?.email?.split('@')[0] || "User";
    }
    
    // Just return the full name with proper capitalization
    return session.user.name.split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };
  
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-indigo-100 dark:border-indigo-900">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-indigo-500" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Chat2Mail</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 ${pathname === "/" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          {session && (
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 ${pathname === "/dashboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
          
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              <span className="h-4 w-4 animate-pulse rounded-full bg-indigo-200 dark:bg-indigo-700"></span>
            </Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {getDisplayName()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 border-indigo-100 dark:border-indigo-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                <DropdownMenuItem
                  className="cursor-pointer flex items-center text-red-500 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-600 dark:focus:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                <Link href="/register">
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
