/**
 * Message Optimizer - Reduce API payload size and improve efficiency
 * Only send relevant context to OpenAI, not entire history
 */

interface Message {
  role: "ai" | "user";
  message: string;
  timestamp?: number;
}

/**
 * Optimize conversation history for API calls
 * - Only send last N messages (context window)
 * - Compress older messages
 * - Remove unnecessary data
 */
export const optimizeConversationHistory = (
  messages: Message[],
  maxContextMessages: number = 8
): Message[] => {
  if (messages.length <= maxContextMessages) {
    return messages.map(msg => ({
      role: msg.role,
      message: msg.message,
      // Remove timestamp from API payload to reduce size
    }));
  }

  // Keep first message (for context) + last N messages (for recent context)
  const keep = [messages[0], ...messages.slice(-maxContextMessages + 1)];
  return keep.map(msg => ({
    role: msg.role,
    message: msg.message,
  }));
};

/**
 * Compress a message to reduce JSON payload
 * Removes whitespace, shortens if too long
 */
export const compressMessage = (message: string): string => {
  return message
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 500); // Cap at 500 chars
};

/**
 * Check if response is cached/similar to previous
 * Avoid redundant API calls for repeated questions
 */
export const getSimilarityScore = (msg1: string, msg2: string): number => {
  const clean1 = msg1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const clean2 = msg2.toLowerCase().replace(/[^a-z0-9]/g, "");

  let matches = 0;
  const minLength = Math.min(clean1.length, clean2.length);

  for (let i = 0; i < minLength; i++) {
    if (clean1[i] === clean2[i]) matches++;
  }

  return matches / Math.max(clean1.length, clean2.length);
};

/**
 * Find potentially cached response from history
 * Reuse response if user asks similar question (>80% similar)
 */
export const findCachedResponse = (
  userMessage: string,
  messageHistory: Message[],
  similarityThreshold: number = 0.8
): string | null => {
  for (let i = messageHistory.length - 1; i >= 0; i--) {
    if (messageHistory[i].role === "user") {
      const similarity = getSimilarityScore(
        userMessage,
        messageHistory[i].message
      );

      if (similarity > similarityThreshold && i + 1 < messageHistory.length) {
        const nextMessage = messageHistory[i + 1];
        if (nextMessage?.role === "ai") {
          return nextMessage.message;
        }
      }
    }
  }

  return null;
};

/**
 * Batch API calls - debounce rapid consecutive calls
 */
export const createDebouncedAPICall = (
  callback: () => Promise<string>,
  delayMs: number = 300
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  return async (): Promise<string> => {
    return new Promise((resolve) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      clearTimeout(timeoutId!);

      const executeCall = async () => {
        lastCallTime = Date.now();
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          console.error("Debounced API call failed:", error);
          resolve("I encountered an error. Please try again.");
        }
      };

      if (timeSinceLastCall < delayMs) {
        // Debounce
        timeoutId = setTimeout(executeCall, delayMs - timeSinceLastCall);
      } else {
        // Execute immediately
        executeCall();
      }
    });
  };
};

/**
 * Extract keywords from message for smarter caching
 */
export const extractKeywords = (message: string): string[] => {
  return message
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3) // Only words > 3 chars
    .slice(0, 5); // Limit to 5 keywords
};

/**
 * Calculate payload size (for monitoring)
 */
export const calculatePayloadSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size; // bytes
};
