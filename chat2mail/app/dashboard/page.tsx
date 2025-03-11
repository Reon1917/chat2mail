"use client"
import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Sparkles, Copy, RefreshCw, ArrowRight, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { TokenUsageDisplay } from "@/components/token-usage-display";

type FormData = {
  sender: string;
  senderTitle: string;
  receiver: string;
  receiverTitle: string;
  subject: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  length: 'short' | 'medium' | 'long';
  additionalContext: string;
};

type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    sender: "",
    senderTitle: "",
    receiver: "",
    receiverTitle: "",
    subject: "",
    tone: "professional",
    length: "medium",
    additionalContext: ""
  });
  
  const [emailContent, setEmailContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
  const [showTokenMetrics, setShowTokenMetrics] = useState(true); // Can be toggled if needed

  // Loading and error states handled by loading.tsx and error.tsx
  if (!session) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateEmail = async () => {
    // Reset states
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call our Gemini AI API route
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log to see what's coming back
      
      if (!response.ok) {
        // Handle API errors
        if (data.fallbackEmail) {
          // Use fallback email if available
          setEmailContent(data.fallbackEmail);
          // Reset token usage when using fallback
          setTokenUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
          toast({
            title: "Using fallback email template",
            description: data.error || "Could not connect to AI service",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          throw new Error(data.error || 'Failed to generate email');
        }
      } else {
        // Set the generated email content
        setEmailContent(data.email);
        // Update token usage metrics
        if (data.tokenUsage) {
          console.log('Token usage data:', data.tokenUsage); // Debug log for token usage
          setTokenUsage(data.tokenUsage);
        } else {
          console.warn('No token usage data in response');
        }
        toast({
          title: "Email generated successfully",
          description: "Your AI-powered email is ready to use!",
        });
      }
    } catch (err) {
      console.error('Error generating email:', err);
      setError('Failed to generate email. Please try again.');
      // Reset token usage on error
      setTokenUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(emailContent);
    toast({
      title: "Copied to clipboard",
      description: "Email content has been copied to your clipboard.",
    });
  };

  // Toggle token metrics display (optional feature for future use)
  const toggleTokenMetrics = () => {
    setShowTokenMetrics(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <SiteHeader />
      
      {/* Main Content */}
      <main className="container mx-auto p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Email Writer
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Generate professional emails in seconds with our AI assistant
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Form */}
            <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender" className="text-indigo-700 dark:text-indigo-300 font-medium">
                      Sender Name
                    </Label>
                    <Input 
                      id="sender" 
                      name="sender" 
                      placeholder="Your name"
                      value={formData.sender}
                      onChange={handleInputChange}
                      className="border-indigo-200 focus:border-indigo-400 dark:border-indigo-800 dark:focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderTitle" className="text-indigo-700 dark:text-indigo-300 font-medium">
                      Sender Title
                    </Label>
                    <Input 
                      id="senderTitle" 
                      name="senderTitle" 
                      placeholder="Your position/title"
                      value={formData.senderTitle}
                      onChange={handleInputChange}
                      className="border-indigo-200 focus:border-indigo-400 dark:border-indigo-800 dark:focus:border-indigo-600"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver" className="text-purple-700 dark:text-purple-300 font-medium">
                      Receiver Name
                    </Label>
                    <Input 
                      id="receiver" 
                      name="receiver" 
                      placeholder="Recipient's name"
                      value={formData.receiver}
                      onChange={handleInputChange}
                      className="border-purple-200 focus:border-purple-400 dark:border-purple-800 dark:focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiverTitle" className="text-purple-700 dark:text-purple-300 font-medium">
                      Receiver Title
                    </Label>
                    <Input 
                      id="receiverTitle" 
                      name="receiverTitle" 
                      placeholder="Recipient's position/title"
                      value={formData.receiverTitle}
                      onChange={handleInputChange}
                      className="border-purple-200 focus:border-purple-400 dark:border-purple-800 dark:focus:border-purple-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-pink-700 dark:text-pink-300 font-medium">
                    Email Subject
                  </Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    placeholder="Tell us about the email..."
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="border-pink-200 focus:border-pink-400 dark:border-pink-800 dark:focus:border-pink-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalContext" className="text-pink-700 dark:text-pink-300 font-medium">
                    Additional Context
                  </Label>
                  <Textarea 
                    id="additionalContext" 
                    name="additionalContext" 
                    placeholder="Add any additional details or context for the email..."
                    value={formData.additionalContext}
                    onChange={handleInputChange}
                    className="min-h-[80px] border-pink-200 focus:border-pink-400 dark:border-pink-800 dark:focus:border-pink-600"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-indigo-700 dark:text-indigo-300 font-medium">
                      Tone
                    </Label>
                    <select
                      id="tone"
                      name="tone"
                      value={formData.tone}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-indigo-600"
                    >
                      <option value="professional">Professional</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length" className="text-purple-700 dark:text-purple-300 font-medium">
                      Length
                    </Label>
                    <select
                      id="length"
                      name="length"
                      value={formData.length}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-purple-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-purple-600"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateEmail} 
                  disabled={isGenerating || !formData.subject || !formData.sender || !formData.receiver}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Email with Gemini AI
                    </>
                  )}
                </Button>
                
                {/* Token Usage Display - Only show when there's data and showTokenMetrics is true */}
                {showTokenMetrics && tokenUsage.totalTokens > 0 && (
                  <TokenUsageDisplay 
                    inputTokens={tokenUsage.inputTokens}
                    outputTokens={tokenUsage.outputTokens}
                    totalTokens={tokenUsage.totalTokens}
                    className="mt-4"
                  />
                )}
              </div>
            </Card>
            
            {/* Email Preview */}
            <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Generated Email
                </h3>
                {emailContent && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyToClipboard}
                    className="border-purple-200 hover:border-purple-400 dark:border-purple-800 dark:hover:border-purple-600"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[500px] rounded-md border border-purple-100 dark:border-purple-900 p-4 bg-white dark:bg-gray-900">
                {emailContent ? (
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                    {emailContent}
                  </pre>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <AlertCircle className="h-16 w-16 text-red-300 dark:text-red-700 mb-4" />
                    <p className="text-red-500 dark:text-red-400 font-medium">
                      {error}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="mt-4 border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600"
                    >
                      Dismiss
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <Mail className="h-16 w-16 text-purple-300 dark:text-purple-700 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Fill in the form and click "Generate Email" to create your AI-powered email
                    </p>
                    <div className="mt-4 flex items-center text-sm text-purple-500 dark:text-purple-400">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      <span>Your email will appear here</span>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}