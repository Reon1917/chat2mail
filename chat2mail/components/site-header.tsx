"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Mail, User, LogOut, LogIn, Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === "loading";
  
  // Get first name only for display
  const getDisplayName = () => {
    if (!session?.user?.name) return null;
    // Only show first name for display in the button
    return session.user.name.split(' ')[0]; 
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
                  className="rounded-full px-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/60 dark:hover:to-purple-900/60 min-w-[40px] flex justify-start"
                >
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="h-6 w-6 rounded-full object-cover mr-2 flex-shrink-0"
                    />
                  ) : (
                    <User className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200 max-w-[120px] truncate overflow-hidden">
                    {getDisplayName() || session.user?.email?.split('@')[0] || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-indigo-100 dark:border-indigo-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user?.name && (
                      <p className="font-medium text-gray-900 dark:text-gray-100">{session.user.name}</p>
                    )}
                    {session.user?.email && (
                      <p className="w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-indigo-100 dark:bg-indigo-800" />
                <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-indigo-50 dark:focus:bg-indigo-900/50 focus:text-indigo-700 dark:focus:text-indigo-300">
                  <Link href="/profile" className="w-full cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 focus:bg-indigo-50 dark:focus:bg-indigo-900/50 focus:text-indigo-700 dark:focus:text-indigo-300">
                  <Link href="/settings" className="w-full cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-indigo-100 dark:bg-indigo-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-600 dark:focus:text-red-400"
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
