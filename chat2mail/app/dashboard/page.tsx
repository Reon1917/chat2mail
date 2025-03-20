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
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Sparkles, Copy, RefreshCw, AlertCircle, FileText, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { TokenUsageDisplay } from "@/components/token-usage-display";
import { TemplateSelector } from "@/components/email/template-selector";
import { ToneAnalyzer } from "@/components/email/tone-analyzer";
import { FollowUpReminder } from "@/components/email/follow-up-reminder";

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
  const { data: session } = useSession({
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
  
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
  const [showTokenMetrics, setShowTokenMetrics] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

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
    navigator.clipboard.writeText(emailContent as string);
    toast({
      title: "Copied to clipboard",
      description: "Email content has been copied to your clipboard.",
    });
  };

  // Handle template application
  const handleApplyTemplate = (content: string, subject?: string, recipient?: string) => {
    setEmailContent(content);
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subject: subject
      }));
    }
    if (recipient) {
      setFormData(prev => ({
        ...prev,
        receiver: recipient
      }));
    }
    setShowTemplates(false);
  };

  // Handle tone suggestion application
  const handleApplySuggestion = (suggestion: string) => {
    if (!emailContent) return;
    
    // This is a simplified implementation
    // In a real app, this would use more sophisticated logic to apply the suggestion
    if (suggestion.includes('shorter sentences')) {
      // Example: break long sentences by adding periods
      const sentences = emailContent.split('. ');
      if (sentences.length > 1) {
        const longestSentenceIndex = sentences.reduce(
          (maxIndex, sentence, index, arr) => 
            sentence.length > arr[maxIndex].length ? index : maxIndex, 
          0
        );
        
        if (sentences[longestSentenceIndex].length > 100) {
          const longSentence = sentences[longestSentenceIndex];
          const midpoint = Math.floor(longSentence.length / 2);
          const breakPoint = longSentence.indexOf(' ', midpoint);
          
          if (breakPoint !== -1) {
            const firstHalf = longSentence.substring(0, breakPoint);
            const secondHalf = longSentence.substring(breakPoint + 1);
            sentences[longestSentenceIndex] = firstHalf + '. ' + secondHalf;
            setEmailContent(sentences.join('. '));
          }
        }
      }
    } else {
      // For other suggestions, just append a note to the email for demonstration
      toast({
        title: "Suggestion Applied",
        description: `Applied: ${suggestion}`,
      });
    }
  };

  // Handle token usage updates from tone analyzer
  const handleTokenUsageUpdate = (inputTokens: number, outputTokens: number) => {
    setTokenUsage(prev => ({
      inputTokens: prev.inputTokens + inputTokens,
      outputTokens: prev.outputTokens + outputTokens,
      totalTokens: prev.totalTokens + inputTokens + outputTokens
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      <SiteHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 p-2.5 shadow-sm">
              <Mail className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Email Writer
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Craft the perfect email in seconds
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Card */}
            <Card className="border border-gray-100 dark:border-gray-800 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <div className="p-6 md:p-8 space-y-6">
                {/* Sender Info */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    <Mail className="h-4 w-4" />
                    From
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="sender">Your Name</Label>
                      <Input 
                        id="sender" 
                        name="sender" 
                        placeholder="Enter your name"
                        value={formData.sender}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="senderTitle">Your Role</Label>
                      <Input 
                        id="senderTitle" 
                        name="senderTitle" 
                        placeholder="e.g. Marketing Manager"
                        value={formData.senderTitle}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Receiver Info */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                    <Send className="h-4 w-4" />
                    To
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="receiver">Recipient Name</Label>
                      <Input 
                        id="receiver" 
                        name="receiver" 
                        placeholder="Enter recipient's name"
                        value={formData.receiver}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="receiverTitle">Recipient Role</Label>
                      <Input 
                        id="receiverTitle" 
                        name="receiverTitle" 
                        placeholder="e.g. Project Lead"
                        value={formData.receiverTitle}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Email Content */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="What's your email about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="additionalContext">Key Points</Label>
                    <Textarea 
                      id="additionalContext" 
                      name="additionalContext" 
                      placeholder="Add the main points you want to convey..."
                      value={formData.additionalContext}
                      onChange={handleInputChange}
                      className="min-h-[120px] resize-y"
                    />
                  </div>
                </div>

                {/* Email Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="tone">Writing Style</Label>
                    <select
                      id="tone"
                      name="tone"
                      value={formData.tone}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="professional">Professional</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="length">Email Length</Label>
                    <select
                      id="length"
                      name="length"
                      value={formData.length}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="short">Brief (1-2 paragraphs)</option>
                      <option value="medium">Standard (2-3 paragraphs)</option>
                      <option value="long">Detailed (3+ paragraphs)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateEmail} 
                    disabled={isGenerating || !formData.subject || !formData.sender || !formData.receiver}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 text-base"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Writing your email...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Write Email
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="h-11"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </div>

                {tokenUsage.totalTokens > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowTokenMetrics(prev => !prev)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showTokenMetrics ? "Hide Usage Stats" : "Show Usage Stats"}
                      </Button>
                    </div>
                    {showTokenMetrics && (
                      <TokenUsageDisplay 
                        inputTokens={tokenUsage.inputTokens}
                        outputTokens={tokenUsage.outputTokens}
                        totalTokens={tokenUsage.totalTokens}
                      />
                    )}
                  </div>
                )}
                
                {/* Template Selector */}
                {showTemplates && (
                  <Card className="p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <TemplateSelector 
                      onApplyTemplate={handleApplyTemplate}
                      onClose={() => setShowTemplates(false)}
                    />
                  </Card>
                )}
              </div>
            </Card>

            {/* Generated Email Card */}
            <Card className="border border-gray-100 dark:border-gray-800 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      Your Email
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Preview and copy your email
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {emailContent && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCopyToClipboard}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                    {emailContent && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowReminders(!showReminders)}
                        className="shrink-0"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Reminder
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[500px] w-full rounded-md border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-5">
                  {error ? (
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <p>{error}</p>
                    </div>
                  ) : emailContent ? (
                    <div className="prose prose-indigo dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-base leading-relaxed">{emailContent}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                      <Mail className="h-12 w-12 mb-4 text-indigo-300 dark:text-indigo-700" />
                      <p className="text-base">Fill in the details and click &quot;Write Email&quot; to create your message</p>
                      <p className="text-sm mt-2 text-gray-400">Our AI will help you craft the perfect email</p>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Tone Analyzer */}
                {emailContent && (
                  <ToneAnalyzer 
                    content={emailContent} 
                    onSuggestionApply={handleApplySuggestion}
                    onTokenUsage={handleTokenUsageUpdate}
                  />
                )}
                
                {/* Follow-up Reminder */}
                {showReminders && (
                  <Card className="p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <FollowUpReminder 
                      emailSubject={formData.subject}
                      recipient={formData.receiver}
                      onReminderSet={(reminder) => {
                        // Handle reminder setting
                        console.log('Reminder set:', reminder);
                        setShowReminders(false);
                      }}
                    />
                  </Card>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}