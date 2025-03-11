import { NextRequest, NextResponse } from 'next/server';

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Initialize the Google Generative AI with your API key
// You'll need to add GEMINI_API_KEY to your .env.local file
const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Configuration for the generation
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Token usage interface
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      sender, 
      senderTitle, 
      receiver, 
      receiverTitle, 
      subject, 
      tone = 'professional', 
      length = 'medium',
      additionalContext = ''
    } = body;
    
    // Validate required fields
    if (!sender || !receiver || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if API key is available
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { 
          error: 'API key not configured', 
          fallbackEmail: generateFallbackEmail(sender, senderTitle, receiver, receiverTitle, subject),
          tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        },
        { status: 500 }
      );
    }
    
    // Start a chat session with history
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Generate an Email for me 
Style : ${mapToneToStyle(tone)} 
Sender : ${sender}
Title : ${senderTitle || 'N/A'}
Receiver : ${receiver}
Title : ${receiverTitle || 'N/A'}
Subject : ${subject}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}
Length: ${length}`
            },
          ],
        },
      ],
    });

    // Send a message to continue the chat and get the response
    const result = await chatSession.sendMessage("Please format the email as plain text, not JSON. Start with the greeting and end with the signature. The email should be well-structured with proper paragraphs and formatting.");
    const emailText = result.response.text();
    
    // Log the full response for debugging
    console.log('Gemini API response structure:', JSON.stringify({
      promptFeedback: result.response.promptFeedback,
      candidates: result.response.candidates && result.response.candidates.length > 0 ? 
        { tokenCount: result.response.candidates[0].tokenCount } : 'No candidates'
    }, null, 2));
    
    // Get token usage from the response
    // For Gemini 2.0 Flash, the token count structure might be different than expected
    // Using hardcoded estimates if the API doesn't return token counts
    const estimatedInputTokens = Math.ceil((subject.length + sender.length + receiver.length + (additionalContext?.length || 0)) / 4);
    const estimatedOutputTokens = Math.ceil(emailText.length / 4);
    
    const tokenUsage: TokenUsage = {
      inputTokens: result.response.promptFeedback?.tokenCount?.totalTokens || estimatedInputTokens,
      outputTokens: result.response.candidates?.[0]?.tokenCount || estimatedOutputTokens,
      totalTokens: (result.response.promptFeedback?.tokenCount?.totalTokens || estimatedInputTokens) + 
                  (result.response.candidates?.[0]?.tokenCount || estimatedOutputTokens)
    };
    
    // Log token usage for debugging
    console.log('Token usage data:', tokenUsage);
    
    // Clean up the response if needed (remove any JSON formatting, code blocks, etc.)
    const cleanedEmail = cleanEmailResponse(emailText);
    
    return NextResponse.json({ 
      email: cleanedEmail,
      tokenUsage
    });
  } catch (error) {
    console.error('Error generating email with Gemini AI:', error);
    
    // Return a fallback email if there's an error
    const { sender, senderTitle, receiver, receiverTitle, subject } = await request.json();
    
    return NextResponse.json(
      { 
        error: 'Failed to generate email', 
        fallbackEmail: generateFallbackEmail(sender, senderTitle, receiver, receiverTitle, subject),
        tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
      },
      { status: 500 }
    );
  }
}

/**
 * Clean up the email response to remove any JSON formatting, code blocks, etc.
 */
function cleanEmailResponse(text: string): string {
  // Remove JSON formatting if present
  if (text.includes('```json') || text.includes('```')) {
    // Extract content between code blocks
    const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        // Try to parse as JSON
        const jsonContent = JSON.parse(codeBlockMatch[1]);
        if (jsonContent.email && jsonContent.email.body) {
          return jsonContent.email.body;
        }
      } catch (e) {
        // If JSON parsing fails, just remove the code block markers
        return text.replace(/```(?:json)?\n|\n```/g, '');
      }
    }
  }
  
  return text;
}

/**
 * Map tone to style for Gemini prompt
 */
function mapToneToStyle(tone: string): string {
  switch (tone) {
    case 'formal':
      return 'Formal';
    case 'casual':
      return 'Casual';
    case 'friendly':
      return 'Friendly';
    case 'professional':
    default:
      return 'Business Professional';
  }
}

/**
 * Generate a fallback email when the AI service is unavailable
 */
function generateFallbackEmail(
  sender: string, 
  senderTitle: string, 
  receiver: string, 
  receiverTitle: string, 
  subject: string
) {
  return `Dear ${receiver},

I hope this email finds you well. I am writing to discuss ${subject}.

As ${senderTitle || 'a representative'} at our organization, I wanted to reach out to you in your capacity as ${receiverTitle || 'a professional'} to explore potential collaboration opportunities.

Our team has been working on innovative solutions that I believe would align perfectly with your objectives. I would appreciate the opportunity to discuss this further at your convenience.

Please let me know if you would be interested in scheduling a call or meeting to explore this topic in more detail.

Best regards,
${sender}`;
}
