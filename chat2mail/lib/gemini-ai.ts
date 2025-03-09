/**
 * Gemini AI Utilities
 * This file provides utilities for working with Google's Generative AI (Gemini) API
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

/**
 * Example of how to use the Gemini Chat API
 */
export async function exampleGeminiChatUsage(apiKey: string) {
  // Initialize the Google Generative AI with your API key
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

  // Start a chat session with history
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Generate an Email for me \nStyle : Business Professional \nSender : John Doe\nTitle : Marketing Manager\nReceiver : Jane Smith\nTitle : CEO\nSubject : Quarterly Marketing Results\nLength: medium"
          },
        ],
      },
    ],
  });

  // Send a message to continue the chat and get the response
  const result = await chatSession.sendMessage("Please format the email as plain text, not JSON. Start with the greeting and end with the signature.");
  return result.response.text();
}

/**
 * Email Style Guide for Gemini AI
 * 
 * This guide provides information on the different styles and lengths available
 * when generating emails with Gemini AI.
 */
export const emailStyleGuide = {
  styles: {
    "Business Professional": "Formal business communication style with proper structure and professional language",
    "Formal": "Very structured and respectful, using full titles and formal language",
    "Casual": "Relaxed and conversational while maintaining professionalism",
    "Friendly": "Warm and personable with a focus on relationship building"
  },
  lengths: {
    "short": "Brief and concise, approximately 3-4 sentences",
    "medium": "Balanced length with adequate detail, approximately 5-7 sentences",
    "long": "Comprehensive with detailed explanations, 8+ sentences"
  }
};

/**
 * Clean up the email response to remove any JSON formatting, code blocks, etc.
 */
export function cleanEmailResponse(text: string): string {
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
 * Generate an email using Gemini AI
 * 
 * @param params Object containing email parameters
 * @returns Generated email content
 */
export async function generateEmail(params: {
  sender: string;
  senderTitle: string;
  receiver: string;
  receiverTitle: string;
  subject: string;
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  length?: 'short' | 'medium' | 'long';
}) {
  try {
    const { sender, senderTitle, receiver, receiverTitle, subject, tone = 'professional', length = 'medium' } = params;
    
    // Initialize the Google Generative AI with your API key
    const apiKey = process.env.GEMINI_API_KEY || '';
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

    // Start a chat session with history
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Generate an Email for me \nStyle : ${tone} \nSender : ${sender}\nTitle : ${senderTitle}\nReceiver : ${receiver}\nTitle : ${receiverTitle}\nSubject : ${subject}\nLength: ${length}`
            },
          ],
        },
      ],
    });

    // Send a message to continue the chat and get the response
    const result = await chatSession.sendMessage("Please format the email as plain text, not JSON. Start with the greeting and end with the signature.");
    return cleanEmailResponse(result.response.text());
  } catch (error) {
    console.error('Error generating email with Gemini AI:', error);
    return `Dear ${params.receiver},

I hope this email finds you well. I am writing to discuss ${params.subject}.

As ${params.senderTitle} at our organization, I wanted to reach out to you in your capacity as ${params.receiverTitle} to explore potential collaboration opportunities.

Our team has been working on innovative solutions that I believe would align perfectly with your objectives. I would appreciate the opportunity to discuss this further at your convenience.

Please let me know if you would be interested in scheduling a call or meeting to explore this topic in more detail.

Best regards,
${params.sender}`;
  }
}
