import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with your API key
// In production, use environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Token counting helper (rough estimate)
const countTokens = (text: string): number => {
  // A very simple approximation: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
};

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: content is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Count input tokens
    const inputTokens = countTokens(content);
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to local analysis if no API key
      return NextResponse.json({
        analysis: generateLocalAnalysis(content),
        tokenUsage: {
          inputTokens,
          outputTokens: 50, // Estimate for local analysis
          totalTokens: inputTokens + 50
        }
      });
    }
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create prompt for tone analysis
    const prompt = `
    Analyze the tone of the following email text. Provide a structured analysis with the following elements:
    1. Overall tone (e.g., formal, casual, friendly, urgent, etc.)
    2. Formality level (formal, neutral, or casual)
    3. Sentiment (positive, neutral, or negative)
    4. Clarity (clear, somewhat clear, or unclear)
    5. 2-3 specific suggestions for improving the tone if needed
    
    Respond in JSON format with the following structure:
    {
      "tone": "string",
      "formality": "formal|neutral|casual",
      "sentiment": "positive|neutral|negative",
      "clarity": "clear|somewhat clear|unclear",
      "confidence": number between 0 and 1,
      "suggestions": [array of strings]
    }
    
    Email text to analyze:
    ${content}
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let analysis;
    
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, fall back to local analysis
        analysis = generateLocalAnalysis(content);
      }
    } else {
      // If no JSON found, fall back to local analysis
      analysis = generateLocalAnalysis(content);
    }
    
    // Count output tokens (rough estimate)
    const outputTokens = countTokens(JSON.stringify(analysis));
    
    return NextResponse.json({
      analysis,
      tokenUsage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    });
    
  } catch (error) {
    console.error('Error analyzing tone:', error);
    return NextResponse.json(
      { error: 'Failed to analyze tone' },
      { status: 500 }
    );
  }
}

// Fallback local analysis function
function generateLocalAnalysis(content: string) {
  // Simple word-based analysis
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
  let formality = 'neutral';
  if (formalCount > casualCount) formality = 'formal';
  else if (casualCount > formalCount) formality = 'casual';
  
  // Determine sentiment
  let sentiment = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Determine clarity based on average sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length 
    : 0;
  
  let clarity = 'somewhat clear';
  if (avgSentenceLength < 15) clarity = 'clear';
  else if (avgSentenceLength > 25) clarity = 'unclear';
  
  // Generate suggestions
  const suggestions = [];
  
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
    clarity
  };
}
