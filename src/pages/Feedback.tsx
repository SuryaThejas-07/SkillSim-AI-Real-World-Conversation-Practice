import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "sonner";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { generateFeedback, calculateMetrics } from "@/lib/feedbackAnalyzer";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackData } from "@/types/conversation";

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addConversation, checkAndUnlockBadges } = useProgress();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const hasStartedGeneration = useRef(false);

  const { character, messages, docId, responseTimes = [] } = location.state || {};

  console.log("📄 Feedback page loaded with state:", {
    hasCharacter: !!character,
    hasMessages: !!messages,
    docId,
    messageCount: messages?.length,
  });

  // Validate we have required data
  if (!character || !messages || !docId) {
    console.error("❌ CRITICAL: Missing required data for feedback:", {
      hasCharacter: !!character,
      hasMessages: !!messages,
      docId: docId || "MISSING",
    });
  }

  // Timer for loading state
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Generate feedback on mount if not already generated
  const generateFeedbackIfNeeded = async () => {
    if (feedback || !messages) return;

    setLoading(true);
    setLoadingSeconds(0);
    try {
      const metrics = calculateMetrics(messages, responseTimes);
      const analysis = await generateFeedback(
        character.category,
        character.name,
        messages,
        metrics
      );

      setFeedback(analysis);

      // Save to database
      if (!docId) {
        console.error("❌ CRITICAL: Missing docId - cannot save conversation");
        toast.error("❌ Error: Session ID missing. Please go back and try again.");
        return;
      }

      if (!user) {
        console.error("❌ CRITICAL: No user logged in - cannot save conversation");
        toast.error("❌ Error: Not logged in. Please sign in again.");
        return;
      }

      console.log("💾 Saving feedback for docId:", docId, "for user:", user.uid);
      const score =
        (analysis.overallScore + metrics.averageUserMessageLength / 10) / 2;
      
      try {
        console.log("📝 About to call addConversation with:", {
          id: docId,
          userId: user.uid,
          characterId: character?.id,
          messageCount: messages?.length,
          hasAnalysis: !!analysis,
        });

        await addConversation({
          id: docId,
          userId: user.uid,
          characterId: character.id,
          characterName: character.name,
          category: character.category,
          messages,
          feedback: analysis,
          metrics,
          score,
          duration: responseTimes.reduce((a, b) => a + b, 0) || 0,
          createdAt: new Date(),
        });
        
        console.log("✅ Conversation saved successfully and progress updated!");
        toast.success("✨ Feedback saved successfully!");
      } catch (saveError) {
        console.error("❌ CRITICAL ERROR saving conversation:", saveError);
        console.error("Error details:", {
          errorMessage: saveError instanceof Error ? saveError.message : String(saveError),
          docId,
          userId: user.uid,
        });
        toast.error("❌ Failed to save feedback: " + (saveError instanceof Error ? saveError.message : String(saveError)));
      }
    } catch (error) {
      console.error("❌ Error generating feedback:", error);
      toast.error("Failed to generate feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!messages || feedback || loading || hasStartedGeneration.current) return;

    hasStartedGeneration.current = true;
    void generateFeedbackIfNeeded();
  }, [messages, feedback, loading]);

  if (!character || !messages) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">No Feedback Available</h1>
          <p className="text-muted-foreground mb-6">
            Complete a conversation to receive feedback.
          </p>
          <Button onClick={() => navigate("/characters")}>
            Back to Characters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/categories")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="space-y-2 mb-8">
            <p className="text-sm text-primary font-medium">Practice Complete</p>
            <h1 className="text-4xl font-bold text-foreground">
              Great Job on Your {character.category} Practice!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Here's your detailed AI-generated feedback on your session with {character.name}.
            </p>
          </div>

          {/* New Badges */}
          {unlockedBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8"
            >
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-4">
                🎉 New Badges Unlocked!
              </p>
              <div className="flex flex-wrap gap-4">
                {unlockedBadges.map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Feedback or Loading */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <RotateCw className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">
                🤖 AI is analyzing your performance...
              </p>
              {loadingSeconds > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {loadingSeconds}s elapsed
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto">
                This usually takes 3-10 seconds. Generating detailed metrics and feedback...
              </p>
            </div>
          </motion.div>
        ) : feedback ? (
          <>
            <FeedbackDisplay feedback={feedback} />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex gap-4 justify-center"
            >
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/characters")}
              >
                Practice Again
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                View Progress
              </Button>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Feedback;
