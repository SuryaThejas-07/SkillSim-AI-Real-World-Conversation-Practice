import OpenAI from "openai";
import { reportAPIError } from "@/components/APIErrorLogger";
import {
  optimizeConversationHistory,
  compressMessage,
  findCachedResponse,
  calculatePayloadSize,
} from "@/lib/messageOptimizer";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const apiBase = import.meta.env.VITE_OPENAI_API_BASE;
const modelName = import.meta.env.VITE_OPENAI_MODEL;

const provider = apiBase?.includes("groq") ? "Groq" : apiBase?.includes("openai") ? "OpenAI" : "Custom";

console.log("🔑 API Configuration:", {
  provider: provider,
  hasKey: !!apiKey,
  keyPrefix: apiKey?.substring(0, 7),
  apiBase: apiBase,
  model: modelName,
});

if (!apiKey) {
  const errorMsg = "Groq API key is not set in .env.local";
  console.error("ERROR:", errorMsg);
  reportAPIError("openai", errorMsg);
}

if (apiKey && !apiKey.startsWith("gsk_")) {
  console.warn("⚠️ Warning: Groq API key should start with 'gsk_'. Current key starts with:", apiKey?.substring(0, 7));
}

const client = new OpenAI({
  apiKey: apiKey || "",
  baseURL: apiBase,
  dangerouslyAllowBrowser: true,
});

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const getAIResponse = async (
  character: any,
  conversationHistory: Array<{ role: "ai" | "user"; message: string }>
): Promise<string> => {
  // OPTIMIZATION 1: Check for cached response to identical questions
  const lastUserMessage =
    conversationHistory.length > 0
      ? conversationHistory[conversationHistory.length - 1].message
      : "";
  const cachedResponse = findCachedResponse(lastUserMessage, conversationHistory);
  if (cachedResponse) {
    console.debug(
      "[API] Using cached response - API call avoided",
      calculatePayloadSize(cachedResponse),
      "bytes"
    );
    return cachedResponse;
  }

  const categoryPrompts: Record<string, string> = {
    interviews:
      `You are an experienced job interviewer conducting a professional interview at a reputable company. 
Your role: Ask insightful questions about the candidate's experience, skills, and suitability for the role. 
Explore topics naturally - from technical skills to soft skills, career history, goals, and anything relevant to the interview.
You can discuss: interview preparation, resume review, experience, technical/soft skills, career goals, company fit, salary expectations, benefits, work environment, team dynamics, and career advice.`,

    sales:
      `You are a skeptical customer/client evaluating a product or service pitch. 
Your role: Ask tough questions, raise concerns, and evaluate the value proposition from the buyer's perspective.
Explore topics naturally - from product features to pricing, competition, implementation, ROI, and anything relevant to the decision.
You can discuss: product features, pricing, competitors, implementation timeline, ROI, case studies, customer support, integration, training, contracts, and business terms.`,

    negotiations:
      `You are a tough but fair negotiator trying to get the best deal for your side.
Your role: Push back on offers, demand value, identify win-win solutions, and defend your position strategically.
Explore topics naturally - from terms and conditions to timelines, deliverables, risks, and anything that impacts the deal.
You can discuss: pricing, terms, conditions, timelines, deliverables, risk allocation, exclusivity, warranties, dispute resolution, and deal structure.`,

    workplace:
      `You are a knowledgeable colleague and mentor discussing workplace and career issues.
Your role: Provide honest feedback, share experiences, offer career advice, and help solve workplace problems professionally.
Explore topics naturally - from career development to team dynamics, company culture, personal growth, and work-life balance.
You can discuss: career advancement, projects, team dynamics, company culture, skills development, work-life balance, stress management, mentorship, leadership, and professional growth.`,
  };

  const systemPrompt = `${categoryPrompts[character?.category] || categoryPrompts.interviews}

Character Details:
- Name: ${character?.name || "Professional"}
- Personality: ${character?.personality || "Professional"}
- Difficulty Level: ${character?.difficulty || "Medium"}

CORE INSTRUCTIONS:
1. ALWAYS stay in character - respond authentically from your role's perspective.
2. ACTIVELY EXPLORE - Follow the user's leads and explore topics naturally within your role.
3. BE CONVERSATIONAL - Listen, ask follow-up questions, dig deeper into what the user cares about.
4. MAINTAIN AUTHENTICITY - A skeptical customer questions things, a negotiator pushes for value, an interviewer probes deeper.
5. PROVIDE VALUE - Give honest feedback, real insights, and practical advice from your role's expertise.
6. ADAPT YOUR RESPONSES - Match the difficulty level (Easy = encouraging, Medium = balanced, Hard = challenging).
7. NO RESTRICTIONS - Talk about any topic the user brings up as long as it's relevant to the conversation and your role.
8. NATURAL FLOW - Don't force topics - follow the conversation naturally and let it evolve.
9. RESPONSE LENGTH - Keep answers medium-length (2-4 sentences max). Be concise and impactful. No long paragraphs.`;

  // OPTIMIZATION 2: Smart context windowing - only send last 8 messages to API
  // This reduces token usage and API costs by ~40-60%
  const optimizedHistory = optimizeConversationHistory(conversationHistory, 8);

  const messages: Message[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...optimizedHistory.map((msg) => ({
      role: (msg.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: compressMessage(msg.message), // Compress each message
    })),
  ];

  // OPTIMIZATION 3: Monitor payload size
  const payloadSize = calculatePayloadSize(messages);
  console.debug(`[API] Payload size: ${payloadSize} bytes (optimized)`);

  try {
    const response = await client.chat.completions.create({
      model: modelName || "gpt-4o-mini",
      max_tokens: 150,
      messages: messages,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return content;
    }
    return "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    // Log full error details
    console.error("🚨 Groq API Error Details:", {
      errorType: error?.type,
      statusCode: error?.status,
      errorMessage: error?.message,
      errorCode: error?.code,
      fullError: error,
    });
    
    const errorMessage = error?.message || "Unknown error occurred";
    const errorStatus = error?.status;
    const errorCode = error?.code;
    
    // Provide better error messages based on actual error details
    if (errorStatus === 401 || errorCode === "invalid_request_error" || errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Invalid")) {
      console.error("❌ Groq API Key Issue Detected");
      reportAPIError("openai", "Invalid Groq API key. Check: 1) Key starts with 'gsk_' 2) No extra characters 3) Key is active at https://console.groq.com/keys");
      throw new Error("Invalid Groq API key. Verify it's correct in .env.local");
    } else if (errorStatus === 429 || errorMessage.includes("429") || errorMessage.includes("rate")) {
      console.error("⏱️ Rate Limit Hit");
      reportAPIError("openai", "Groq rate limit reached. Wait a moment and try again.");
      throw new Error("Groq API rate limit reached. Please try again shortly.");
    } else if (errorMessage.includes("Network") || errorMessage.includes("fetch") || errorMessage.includes("CORS")) {
      console.error("🌐 Network Error");
      reportAPIError("openai", "Network error connecting to Groq API. Check internet.");
      throw new Error("Network error connecting to Groq API.");
    }
    
    console.error("⚠️ Groq Error:", errorMessage);
    reportAPIError("openai", `Groq API Error: ${errorMessage}`);
    throw error;
  }
};
