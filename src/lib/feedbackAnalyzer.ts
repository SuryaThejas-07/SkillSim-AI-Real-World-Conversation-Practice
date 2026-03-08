import OpenAI from "openai";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const apiBase = import.meta.env.VITE_OPENAI_API_BASE;
const modelName = import.meta.env.VITE_OPENAI_MODEL;

const client = new OpenAI({
  apiKey: apiKey || "",
  baseURL: apiBase,
  dangerouslyAllowBrowser: true,
});

export interface ConversationMetrics {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageResponseTime: number;
  longestUserMessage: number;
  shortestUserMessage: number;
  averageUserMessageLength: number;
}

export interface FeedbackAnalysis {
  overallScore: number;
  speechQuality: {
    clarity: number;
    pace: number;
    confidence: number;
    reasoning: string;
  };
  contentAnalysis: {
    relevance: number;
    completeness: number;
    professionalism: number;
    reasoning: string;
  };
  vocabulary: {
    richness: number;
    appropriateness: number;
    reasoning: string;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  actionableAdvice: string[];
  nextStepsRecommendation: string;
}

export const generateFeedback = async (
  category: string,
  characterName: string,
  conversation: Array<{ role: "ai" | "user"; message: string }>,
  metrics: ConversationMetrics
): Promise<FeedbackAnalysis> => {
  const conversationText = conversation
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.message}`)
    .join("\n");

  const prompt = `You are an expert communication coach analyzing a practice conversation for ${category.toLowerCase()} skills with AI character "${characterName}".

CONVERSATION:
${conversationText}

METRICS:
- Total exchanges: ${metrics.totalMessages}
- Average message length: ${metrics.averageUserMessageLength.toFixed(0)} characters
- Longest message: ${metrics.longestUserMessage} characters
- Average response time: ${metrics.averageResponseTime.toFixed(1)} seconds

Please analyze this conversation and provide a JSON response with the following structure:
{
  "overallScore": <number 0-100>,
  "speechQuality": {
    "clarity": <number 0-100>,
    "pace": <number 0-100>,
    "confidence": <number 0-100>,
    "reasoning": "<brief explanation>"
  },
  "contentAnalysis": {
    "relevance": <number 0-100>,
    "completeness": <number 0-100>,
    "professionalism": <number 0-100>,
    "reasoning": "<brief explanation>"
  },
  "vocabulary": {
    "richness": <number 0-100>,
    "appropriateness": <number 0-100>,
    "reasoning": "<brief explanation>"
  },
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "areasForImprovement": ["<area1>", "<area2>", "<area3>"],
  "actionableAdvice": ["<tip1>", "<tip2>", "<tip3>"],
  "nextStepsRecommendation": "<specific recommendation for next practice session>"
}

Provide ONLY the JSON response, no additional text.`;

  try {
    console.log("📊 Analyzing conversation with Groq...", {
      model: modelName,
      conversationLength: conversation.length,
    });

    const response = await client.chat.completions.create({
      model: modelName || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("✅ Groq response received, parsing...");

    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    let feedback: FeedbackAnalysis;
    try {
      feedback = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("📝 Extracting JSON from markdown...");
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Invalid JSON response: ${content.substring(0, 200)}`);
      }
    }
    console.log("✅ Feedback analysis complete");
    return feedback;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Feedback generation failed:", {
      error: errorMsg,
      apiKey: apiKey ? "✓ Set" : "✗ Missing",
      apiBase: apiBase,
      model: modelName,
    });

    if (errorMsg.includes("401") || errorMsg.includes("authentication")) {
      throw new Error("Groq API key is invalid. Check your .env.local");
    } else if (errorMsg.includes("429")) {
      throw new Error("Rate limit reached. Please wait and try again.");
    } else if (errorMsg.includes("timeout")) {
      throw new Error("Analysis timed out. Try a shorter conversation.");
    } else {
      throw new Error("Failed to generate feedback. Check browser console for details.");
    }
  }
};

export const calculateMetrics = (
  conversation: Array<{ role: "ai" | "user"; message: string }>,
  responseTimes: number[]
): ConversationMetrics => {
  const userMessages = conversation.filter((m) => m.role === "user");
  const userMessageLengths = userMessages.map((m) => m.message.length);

  return {
    totalMessages: conversation.length,
    userMessages: userMessages.length,
    aiMessages: conversation.length - userMessages.length,
    averageResponseTime: responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0,
    longestUserMessage: Math.max(...userMessageLengths, 0),
    shortestUserMessage: Math.min(...userMessageLengths.filter(l => l > 0), 0),
    averageUserMessageLength: userMessageLengths.length > 0
      ? userMessageLengths.reduce((a, b) => a + b, 0) / userMessageLengths.length
      : 0,
  };
};
