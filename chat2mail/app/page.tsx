import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f4] dark:bg-[#1c1c1c] flex flex-col items-center justify-center p-4">
      {/* Envelope Card */}
      <Card className="relative w-full max-w-2xl aspect-[1.4/1] bg-white dark:bg-zinc-900 shadow-lg transform hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
        {/* Envelope Flap */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50 to-white dark:from-zinc-800 dark:to-zinc-900 transform origin-bottom" 
             style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center pt-28 px-6 text-center z-10">
          <Mail className="w-16 h-16 text-blue-500 mb-6 animate-bounce" />
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Chat2Mail
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
            Transform your conversations into perfectly crafted emails with AI-powered assistance
          </p>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button asChild variant="default" size="lg" className="min-w-[140px]">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[140px]">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNmMGYwZjAiIG9wYWNpdHk9IjAuMyI+PC9wYXRoPgo8L3N2Zz4=')]" />
    </div>
  );
}
