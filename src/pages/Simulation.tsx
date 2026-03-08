import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { getAIResponse } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Send, StopCircle, ArrowLeft, MessageCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { analytics } from "@/lib/analytics";
import { logger } from "@/lib/logger";
import { guardTopicRelevance } from "@/lib/topicGuard";
import { useAPIOptimization } from "@/hooks/useAPIOptimization";
import avatarInterviewer from "@/assets/avatar-interviewer.png";
import avatarCustomer from "@/assets/avatar-customer.png";
import avatarNegotiator from "@/assets/avatar-negotiator.png";
import avatarColleague from "@/assets/avatar-colleague.png";

const avatarMap: Record<string, string> = {
  interviews: avatarInterviewer,
  sales: avatarCustomer,
  negotiations: avatarNegotiator,
  workplace: avatarColleague,
};

interface Message {
  role: "ai" | "user";
  message: string;
  timestamp?: number;
}



const Simulation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rateLimitedAPICall } = useAPIOptimization(); // OPTIMIZATION: API rate limiting
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null); // OPTIMIZATION: Debounce

  const character = location.state?.character || {
    id,
    name: "AI Character",
    personality: "Professional",
    difficulty: "Medium",
    category: "interviews",
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messageStartTime, setMessageStartTime] = useState<number>(0);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // OPTIMIZATION: Debounced send message to prevent rapid successive calls
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    // Clear any pending debounced call
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    const userMsg: Message = {
      role: "user",
      message: input.trim(),
      timestamp: Date.now(),
    };

    // Check if message is on-topic
    const topicCheck = guardTopicRelevance(input.trim());
    if (!topicCheck.allowed) {
      setMessages((prev) => [...prev, userMsg]);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          message:
            topicCheck.response || "Please ask questions related to your practice.",
        },
      ]);
      setInput("");
      return;
    }

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsTyping(true);
    setMessageStartTime(Date.now());

    try {
      // OPTIMIZATION: Use rate-limited + deduplicated API calls
      const apiKey = `${character.id}-msg-${Date.now()}`;
      const aiResponse = await rateLimitedAPICall(
        apiKey,
        () => getAIResponse(character, updated),
        300 // Minimum 300ms between requests
      );

      const responseTime = Date.now() - messageStartTime;
      setMessages((prev) => [
        ...prev,
        { role: "ai", message: aiResponse, timestamp: responseTime },
      ]);
      setResponseTimes((prev) => [...prev, responseTime]);

      logger.debug("API call completed", {
        responseTime,
        messageCount: updated.length,
      });
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", message: "I encountered an error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, character, rateLimitedAPICall]);

  const startSession = async () => {
    setSessionStarted(true);
    logger.info("Session started", {
      characterId: id,
      characterName: character.name,
      category: character.category,
    });
    analytics.practiceStart(character.category);
    setIsTyping(true);
    setMessageStartTime(Date.now());
    try {
      // OPTIMIZATION: Rate-limited API call for greeting
      const greeting = await rateLimitedAPICall(
        `${character.id}-greeting`,
        () => getAIResponse(character, []),
        300
      );
      const responseTime = Date.now() - messageStartTime;
      setMessages([
        { role: "ai", message: greeting, timestamp: responseTime },
      ]);
      setResponseTimes([responseTime]);
    } catch (error) {
      console.error("Failed to start session:", error);
      setMessages([
        {
          role: "ai",
          message:
            "Sorry, I encountered an error. Please check your API key and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const endSession = async () => {
    if (!user) {
      console.error("❌ No user logged in - cannot save session");
      alert("Error: Please sign in to save your progress");
      return;
    }

    const sessionDuration = messages.length > 0 
      ? (messages[messages.length - 1].timestamp || 0) / 1000 
      : 0;
    
    let docId = "";
    let saveSuccess = false;

    try {
      console.log("💾 Creating Firestore doc for simulation...");
      const docRef = await addDoc(collection(db, "simulations"), {
        userId: user.uid,
        characterId: character.id,
        characterName: character.name,
        category: character.category,
        conversation: messages,
        createdAt: Timestamp.now(),
        status: "in-progress",
        duration: sessionDuration,
      });
      
      if (!docRef || !docRef.id) {
        throw new Error("Failed to get document ID from Firestore");
      }

      docId = docRef.id;
      saveSuccess = true;
      console.log("✅ Simulation doc created:", docId);
      console.log("✅ Document successfully saved to Firestore");
      
      logger.info("Session saved", { 
        docId,
        characterId: character.id, 
        messageCount: messages.length,
        duration: sessionDuration,
        category: character.category 
      });
      
      analytics.practiceComplete(character.category, 0, sessionDuration);
    } catch (e) {
      console.error("❌ CRITICAL ERROR saving simulation:", e);
      logger.error("Error saving simulation", { 
        error: e instanceof Error ? e.message : String(e)
      });
      
      // Alert user that save failed
      alert("⚠️ Warning: Failed to save session. Your progress may not be recorded. Error: " + 
            (e instanceof Error ? e.message : String(e)));
    }

    if (!docId) {
      console.error("❌ CRITICAL: docId is empty - cannot proceed to feedback");
      alert("❌ CRITICAL ERROR: Could not save your session. Please check your internet connection and try again.");
      return;
    }

    console.log("✅ Proceeding to feedback with docId:", docId);
    navigate("/feedback", { state: { character, messages, docId, responseTimes, saveSuccess } });
  };

  const avatar = avatarMap[character.category] || avatarInterviewer;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img 
            src={avatar} 
            alt={`${character.name} AI character`}
            className="h-10 w-10 rounded-full bg-secondary object-cover" 
          />
          <div>
            <h2 className="text-sm font-bold text-foreground">{character.name}</h2>
            <p className="text-xs text-muted-foreground">{character.personality}</p>
          </div>
          {sessionStarted && messages.length > 2 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="ml-auto" 
              onClick={() => setShowEndConfirmation(true)}
              aria-label="End conversation and get feedback"
            >
              <StopCircle className="mr-1 h-4 w-4" /> End & Get Feedback
            </Button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-2xl">
          {!sessionStarted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-20 text-center"
            >
              <img src={avatar} alt={character.name} className="mb-6 h-24 w-24 rounded-full bg-secondary object-cover shadow-elevated" />
              <h2 className="mb-2 text-2xl font-bold text-foreground">{character.name}</h2>
              <p className="mb-1 text-muted-foreground">{character.personality}</p>
              <p className="mb-6 text-sm text-muted-foreground">Difficulty: {character.difficulty}</p>
              <Button 
                variant="hero" 
                size="lg" 
                onClick={startSession}
                aria-label={`Start conversation with ${character.name}`}
              >
                Start Conversation
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4" aria-live="polite" aria-label="Conversation messages" role="log">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-[80%] gap-2">
                    {msg.role === "ai" && (
                      <img src={avatar} alt="AI" className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-secondary object-cover" />
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "gradient-primary text-primary-foreground rounded-br-md"
                          : "bg-card text-card-foreground shadow-card rounded-bl-md"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <img src={avatar} alt="AI" className="h-8 w-8 rounded-full bg-secondary object-cover" />
                  <div className="flex gap-1 rounded-2xl bg-card px-4 py-3 shadow-card">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {sessionStarted && (
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="container mx-auto flex max-w-2xl gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              aria-label="Message input for conversation"
              aria-describedby="input-helper"
              role="textbox"
              aria-multiline="false"
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button 
              size="icon" 
              onClick={sendMessage} 
              disabled={!input.trim() || isTyping} 
              className="h-12 w-12 rounded-xl"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p id="input-helper" className="text-xs text-muted-foreground mt-2">
            Press Enter or click Send to send your message
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {messages.filter((m) => m.role === "user").length} responses given. 
              Are you sure you want to end and get feedback? You can't undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Continue Practicing</AlertDialogCancel>
            <AlertDialogAction onClick={endSession} className="bg-destructive hover:bg-destructive/90">
              <StopCircle className="mr-2 h-4 w-4" />
              End & Get Feedback
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Simulation;
