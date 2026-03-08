/**
 * Topic Guard - Minimal filtering for truly off-topic/inappropriate content
 * Allows user-driven conversations while staying aligned with professional context
 */

interface TopicCheckResult {
  isTopicRelevant: boolean;
  confidence: number;
  reason?: string;
}

// Only block truly inappropriate content (explicit, spam, etc.)
// Professional and educational topics are all allowed
const HARD_BLOCK_PATTERNS = [
  /explicit|pornograph|sexual content|adult content/i,
  /hate speech|discriminat|racist|sexist|bigot/i,
  /spam|scam|fraud|phishing|malware/i,
  /violence|gore|harm yourself|suicide|self-harm/i,
];

/**
 * Check if a message contains inappropriate content
 * Allows user-driven exploration of professional and educational topics
 */
export const isTopicRelevant = (message: string): TopicCheckResult => {
  const lowerMessage = message.toLowerCase().trim();

  // Only block truly inappropriate content
  for (const pattern of HARD_BLOCK_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return {
        isTopicRelevant: false,
        confidence: 0.95,
        reason: "I can't help with that topic. Let's focus on professional development, careers, and skills instead.",
      };
    }
  }

  // Everything else is allowed - let the user explore topics naturally
  return {
    isTopicRelevant: true,
    confidence: 1.0,
  };
};

/**
 * Generate an off-topic response (rarely used now)
 */
export const getOffTopicResponse = (): string => {
  const responses = [
    "That's outside what I can help with. Let's get back to professional development and career topics!",
    "I can't assist with that. What else can I help you with regarding your career?",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Guard middleware for chat messages
 * Only blocks truly inappropriate content, allows user-driven exploration
 */
export const guardTopicRelevance = (
  message: string
): { allowed: boolean; response?: string } => {
  const check = isTopicRelevant(message);

  if (!check.isTopicRelevant) {
    return {
      allowed: false,
      response: check.reason || getOffTopicResponse(),
    };
  }

  return { allowed: true };
};
