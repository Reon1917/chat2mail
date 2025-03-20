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
import { Mail, Send, Copy, RefreshCw, AlertCircle, FileText, Clock, Settings, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { TokenUsageDisplay } from "@/components/token-usage-display";
import { TemplateSelector } from "@/components/email/template-selector";
import { ToneAnalyzer } from "@/components/email/tone-analyzer";
import { FollowUpReminder } from "@/components/email/follow-up-reminder";

// Define the TokenUsage type to match TokenUsageProps
type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

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
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0
  });
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
          setTokenUsage(data.tokenUsage);
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
    if (emailContent) {
      navigator.clipboard.writeText(emailContent);
      toast({
        title: "Copied to clipboard",
        description: "Email content has been copied to your clipboard.",
      });
    }
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
    
    toast({
      title: "Template applied",
      description: "The template has been applied to your email.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Email Composer</h2>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Form */}
          <div className="space-y-4">
            <Card className="p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Email Details</h3>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTemplates(!showTemplates)}
                    disabled={isGenerating}
                    className="text-xs"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender">Your Name</Label>
                    <Input 
                      id="sender" 
                      name="sender" 
                      value={formData.sender} 
                      onChange={handleInputChange} 
                      placeholder="John Doe"
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senderTitle">Your Title/Role</Label>
                    <Input 
                      id="senderTitle" 
                      name="senderTitle" 
                      value={formData.senderTitle} 
                      onChange={handleInputChange} 
                      placeholder="Marketing Manager"
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiver">Recipient Name</Label>
                    <Input 
                      id="receiver" 
                      name="receiver" 
                      value={formData.receiver} 
                      onChange={handleInputChange} 
                      placeholder="Jane Smith"
                      className="h-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receiverTitle">Recipient Title/Role</Label>
                    <Input 
                      id="receiverTitle" 
                      name="receiverTitle" 
                      value={formData.receiverTitle} 
                      onChange={handleInputChange} 
                      placeholder="CEO"
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleInputChange} 
                    placeholder="Meeting Request: Discuss Potential Partnership"
                    className="h-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <select 
                      id="tone" 
                      name="tone" 
                      value={formData.tone} 
                      onChange={handleInputChange}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="formal">Formal</option>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <select 
                      id="length" 
                      name="length" 
                      value={formData.length} 
                      onChange={handleInputChange}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Additional Context</Label>
                  <Textarea 
                    id="additionalContext" 
                    name="additionalContext" 
                    value={formData.additionalContext} 
                    onChange={handleInputChange} 
                    placeholder="Provide any additional context or specific points you want to include in the email..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateEmail} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Email
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                {showTemplates && (
                  <Card className="p-4 mt-4 border shadow-sm">
                    <TemplateSelector 
                      onApplyTemplate={handleApplyTemplate} 
                      onClose={() => setShowTemplates(false)}
                      currentSender={formData.sender}
                      currentSenderRole={formData.senderTitle}
                    />
                  </Card>
                )}
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTokenMetrics(!showTokenMetrics)}
                    className="text-xs"
                  >
                    {showTokenMetrics ? "Hide Token Usage" : "Show Token Usage"}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowReminders(!showReminders)}
                    className="text-xs"
                  >
                    <Clock className="mr-2 h-3 w-3" />
                    {showReminders ? "Hide Reminders" : "Set Reminder"}
                  </Button>
                </div>
                
                {showTokenMetrics && (
                  <div className="mt-2">
                    <TokenUsageDisplay 
                      inputTokens={tokenUsage.inputTokens}
                      outputTokens={tokenUsage.outputTokens}
                      totalTokens={tokenUsage.totalTokens}
                    />
                  </div>
                )}
                
                {showReminders && (
                  <div className="mt-2">
                    <FollowUpReminder
                      emailSubject={formData.subject}
                      recipient={formData.receiver}
                      onReminderSet={(reminder) => {
                        toast({
                          title: "Reminder Set",
                          description: `You'll be reminded to follow up on ${reminder.date.toLocaleDateString()} at ${reminder.time}`,
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Output Display */}
          <div className="space-y-4">
            <Card className="p-6 h-full flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Generated Email</h3>
                </div>
                
                {emailContent && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              
              <Separator className="mb-4" />
              
              <ScrollArea className="flex-1 rounded-md border p-4 bg-slate-50 dark:bg-slate-900">
                {emailContent ? (
                  <div className="whitespace-pre-wrap">
                    {emailContent}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Your generated email will appear here</p>
                    <p className="text-sm mt-2">Fill in the form and click &quot;Generate Email&quot;</p>
                  </div>
                )}
              </ScrollArea>
              
              {emailContent && (
                <div className="mt-4">
                  <ToneAnalyzer
                    content={emailContent || ""}
                    onSuggestionApply={(suggestion) => {
                      setEmailContent(suggestion);
                      toast({
                        title: "Suggestion Applied",
                        description: "The email has been updated with the suggested tone."
                      });
                    }}
                    onTokenUsage={(inputTokens, outputTokens) => {
                      setTokenUsage({
                        inputTokens,
                        outputTokens,
                        totalTokens: inputTokens + outputTokens
                      });
                    }}
                    disabled={!emailContent}
                  />
                </div>
              )}
              
              {emailContent && (
                <div className="flex justify-end mt-4">
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}