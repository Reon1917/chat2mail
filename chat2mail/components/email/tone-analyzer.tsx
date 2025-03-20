import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, MessageSquare } from "lucide-react";

type ToneAnalysisResult = {
  tone: string;
  confidence: number;
  suggestions: string[];
  formality: 'formal' | 'neutral' | 'casual';
  sentiment: 'positive' | 'neutral' | 'negative';
  clarity: 'clear' | 'somewhat clear' | 'unclear';
  inputTokens: number;
  outputTokens: number;
};

type ToneAnalyzerProps = {
  content: string;
  onSuggestionApply: (suggestion: string) => void;
  onTokenUsage: (inputTokens: number, outputTokens: number) => void;
  disabled?: boolean;
};

// Rate limiting for API calls
const MAX_CALLS_PER_EMAIL = 5;
let apiCallCount = 0;

// Reset API call count when component is unmounted or when email content changes significantly
const resetApiCallCount = () => {
  apiCallCount = 0;
};

// Analyze tone using Gemini API
const analyzeToneWithGemini = async (content: string): Promise<ToneAnalysisResult> => {
  try {
    // Check rate limit
    if (apiCallCount >= MAX_CALLS_PER_EMAIL) {
      throw new Error(`Rate limit reached (${MAX_CALLS_PER_EMAIL} calls per email)`);
    }
    
    apiCallCount++;
    
    // API endpoint would normally be an environment variable
    const response = await fetch('/api/analyze-tone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data.analysis,
      inputTokens: data.tokenUsage.inputTokens,
      outputTokens: data.tokenUsage.outputTokens
    };
  } catch (error) {
    console.error('Tone analysis error:', error);
    // Fallback to local analysis if API fails
    return analyzeToneLocally(content);
  }
};

// Fallback local analysis for when API fails or rate limit is reached
const analyzeToneLocally = (content: string): ToneAnalysisResult => {
  // Simple word-based analysis for demo purposes
  const formalWords = ['therefore', 'furthermore', 'consequently', 'regards', 'sincerely', 'request', 'inquire'];
  const casualWords = ['hey', 'thanks', 'cool', 'awesome', 'btw', 'yeah', 'sure'];
  const negativeWords = ['unfortunately', 'regret', 'sorry', 'issue', 'problem', 'concern', 'disappointed'];
  const positiveWords = ['pleased', 'happy', 'delighted', 'thank', 'appreciate', 'excited', 'opportunity'];
  
  const lowerContent = content.toLowerCase();
  
  // Count occurrences
  const formalCount = formalWords.filter(word => lowerContent.includes(word)).length;
  const casualCount = casualWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  
  // Determine formality
  let formality: 'formal' | 'neutral' | 'casual' = 'neutral';
  if (formalCount > casualCount) formality = 'formal';
  else if (casualCount > formalCount) formality = 'casual';
  
  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Determine clarity based on average sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length 
    : 0;
  
  let clarity: 'clear' | 'somewhat clear' | 'unclear' = 'somewhat clear';
  if (avgSentenceLength < 15) clarity = 'clear';
  else if (avgSentenceLength > 25) clarity = 'unclear';
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (formality === 'formal' && sentiment === 'negative') {
    suggestions.push('Consider softening the negative tone while maintaining formality');
  }
  
  if (formality === 'casual' && content.length > 500) {
    suggestions.push('Your casual email is quite long. Consider being more concise');
  }
  
  if (clarity === 'unclear') {
    suggestions.push('Try using shorter, clearer sentences to improve readability');
  }
  
  if (sentences.length > 0 && sentences.some(s => s.trim().split(/\s+/).length > 30)) {
    suggestions.push('Break up very long sentences to improve clarity');
  }
  
  // Determine overall tone
  let tone = 'neutral';
  if (formality === 'formal' && sentiment === 'positive') tone = 'professional positive';
  else if (formality === 'formal' && sentiment === 'negative') tone = 'formal critical';
  else if (formality === 'casual' && sentiment === 'positive') tone = 'friendly';
  else if (formality === 'casual' && sentiment === 'negative') tone = 'casual concerned';
  
  // If no suggestions were generated, add a default positive one
  if (suggestions.length === 0) {
    if (clarity === 'clear' && sentiment === 'positive') {
      suggestions.push('Your email has a good tone and clarity');
    } else {
      suggestions.push('Consider reviewing your email for clarity and tone');
    }
  }
  
  return {
    tone,
    confidence: 0.75, // Lower confidence for local analysis
    suggestions,
    formality,
    sentiment,
    clarity,
    inputTokens: Math.round(content.length / 4), // Rough estimate
    outputTokens: 50 // Rough estimate
  };
};

export function ToneAnalyzer({ content, onSuggestionApply, onTokenUsage, disabled = false }: ToneAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ToneAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiCallsRemaining, setApiCallsRemaining] = useState(MAX_CALLS_PER_EMAIL);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Extract content prefix for dependency array
  const contentPrefix = content.substring(0, 50);
  
  useEffect(() => {
    // If content changes substantially, reset the API call count
    resetApiCallCount();
    setApiCallsRemaining(MAX_CALLS_PER_EMAIL);
  }, [contentPrefix]); // Only depend on the first 50 chars to avoid too many resets
  
  const handleAnalyze = async () => {
    if (!content.trim() || isAnalyzing || disabled) return;
    
    setIsAnalyzing(true);
    setUsingFallback(false);
    
    try {
      const result = await analyzeToneWithGemini(content);
      setAnalysis(result);
      setApiCallsRemaining(MAX_CALLS_PER_EMAIL - apiCallCount);
      
      // Report token usage
      onTokenUsage(result.inputTokens, result.outputTokens);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to local analysis
      const fallbackResult = analyzeToneLocally(content);
      setAnalysis(fallbackResult);
      setUsingFallback(true);
      
      // Still report token usage (estimates)
      onTokenUsage(fallbackResult.inputTokens, fallbackResult.outputTokens);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const getFormalityIcon = (formality: string) => {
    switch (formality) {
      case 'formal': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Formal</Badge>;
      case 'casual': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Casual</Badge>;
      default: return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Neutral</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium">Tone Analysis</h3>
          {usingFallback && (
            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
              Local Analysis
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {apiCallsRemaining < MAX_CALLS_PER_EMAIL && (
            <span className="text-xs text-gray-500">{apiCallsRemaining} calls left</span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim() || disabled || apiCallsRemaining <= 0}
            className="text-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Analyze Tone</>
            )}
          </Button>
        </div>
      </div>
      
      {analysis && (
        <Card className="p-4 border border-gray-100 dark:border-gray-800 shadow-sm bg-white/95 dark:bg-gray-800/95">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Detected Tone:</span>
                <span className="text-sm capitalize">{analysis.tone}</span>
              </div>
              {getFormalityIcon(analysis.formality)}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                <span className="mb-1">Sentiment</span>
                <span className={`font-medium capitalize ${getSentimentColor(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                <span className="mb-1">Clarity</span>
                <span className="font-medium capitalize">
                  {analysis.clarity}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                <span className="mb-1">Confidence</span>
                <span className="font-medium">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <div className="mt-3">
              <span className="text-xs font-medium">Suggestions:</span>
              <ul className="mt-2 space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      {suggestion.includes('good') ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span>{suggestion}</span>
                      {!suggestion.includes('good') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onSuggestionApply(suggestion)}
                          className="text-xs text-purple-600 hover:text-purple-700 p-0 h-6 mt-1 justify-start"
                        >
                          Apply suggestion
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
