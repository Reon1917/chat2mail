import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Search, Inbox, Send, Archive, Star } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex h-16 items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-700">
          <Mail className="h-6 w-6 text-blue-500" />
          <span className="font-semibold">Chat2Mail</span>
        </div>
        <nav className="p-4 space-y-2">
          {[Inbox, Send, Archive, Star].map((Icon, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Icon className="h-4 w-4 text-gray-500" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Email List */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
