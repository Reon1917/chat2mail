"use client"
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Search, Inbox, Send, Archive, Star, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  // Loading and error states handled by loading.tsx and error.tsx
  if (!session) return null;

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-500" />
            <span className="font-semibold">Chat2Mail</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <span className="font-medium">
                    {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                  </span>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-500 focus:text-red-500"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Send className="h-4 w-4" />
              Sent
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Star className="h-4 w-4" />
              Starred
            </Button>
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Welcome back, {session.user?.name || session.user?.email}
            </h1>
          </div>

          {/* Search and Tabs */}
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search emails..."
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="important">Important</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card 
                        key={i} 
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-8 w-8">
                            <span className="font-medium">
                              {String.fromCharCode(64 + i)}
                            </span>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">Example Sender {i}</p>
                              <span className="text-sm text-gray-500">1h ago</span>
                            </div>
                            <p className="text-sm font-medium">Email Subject {i}</p>
                            <p className="text-sm text-gray-500 truncate">
                              This is a placeholder email content that will be replaced with actual email data...
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="unread" className="mt-6">
                <p className="text-center text-gray-500">No unread emails</p>
              </TabsContent>
              <TabsContent value="important" className="mt-6">
                <p className="text-center text-gray-500">No important emails</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}