import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, UserProgress, Badge, badges } from "@/types/conversation";

interface ProgressContextType {
  progress: UserProgress | null;
  loading: boolean;
  addConversation: (conversation: Conversation) => Promise<void>;
  getConversationHistory: () => Promise<Conversation[]>;
  checkAndUnlockBadges: (conversation: Conversation) => Promise<Badge[]>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const normalizeConversation = (raw: Conversation): Conversation => {
  const docWithLegacy = raw as Conversation & {
    conversation?: Array<{ role: "ai" | "user"; message: string }>;
    status?: string;
  };

  return {
    ...raw,
    messages: Array.isArray(raw.messages)
      ? raw.messages
      : Array.isArray(docWithLegacy.conversation)
      ? docWithLegacy.conversation
      : [],
    createdAt: toDate(raw.createdAt),
    completedAt: raw.completedAt ? toDate(raw.completedAt) : undefined,
  };
};

const isCompletedConversation = (conversation: Conversation): boolean => {
  const docWithStatus = conversation as Conversation & { status?: string };
  return docWithStatus.status === "completed" || typeof conversation.score === "number";
};

const calculateProgressStats = (
  userId: string,
  conversations: Conversation[],
  existingBadges: Badge[] = []
): UserProgress => {
  const completedConversations = conversations.filter(isCompletedConversation);

  const stats: UserProgress = {
    userId,
    totalPractices: completedConversations.length,
    totalTime:
      completedConversations.reduce((sum, conv) => sum + (conv.duration || 0), 0) /
      60,
    averageScore:
      completedConversations.length > 0
        ? completedConversations.reduce((sum, conv) => sum + (conv.score || 0), 0) /
          completedConversations.length
        : 0,
    categoryStats: {},
    badges: existingBadges,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: new Date(),
  };

  completedConversations.forEach((conv) => {
    if (!stats.categoryStats[conv.category]) {
      stats.categoryStats[conv.category] = {
        attempts: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }

    stats.categoryStats[conv.category].attempts += 1;
    stats.categoryStats[conv.category].averageScore =
      (stats.categoryStats[conv.category].averageScore *
        (stats.categoryStats[conv.category].attempts - 1) +
        (conv.score || 0)) /
      stats.categoryStats[conv.category].attempts;
    stats.categoryStats[conv.category].bestScore = Math.max(
      stats.categoryStats[conv.category].bestScore,
      conv.score || 0
    );
  });

  const sortedConvs = [...completedConversations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  if (sortedConvs.length > 0) {
    stats.lastPracticeDate = sortedConvs[0].createdAt;
    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 0;
    let lastDate: Date | null = null;

    for (const conv of sortedConvs) {
      const convDate = new Date(conv.createdAt);
      if (
        !lastDate ||
        (lastDate.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24) <= 1
      ) {
        streakCount++;
      } else {
        longestStreak = Math.max(longestStreak, streakCount);
        streakCount = 1;
      }
      lastDate = convDate;
    }

    longestStreak = Math.max(longestStreak, streakCount);
    const todayMinusOne = new Date();
    todayMinusOne.setDate(todayMinusOne.getDate() - 1);
    if (sortedConvs[0].createdAt > todayMinusOne) {
      currentStreak = streakCount;
    }

    stats.currentStreak = currentStreak;
    stats.longestStreak = longestStreak;
  }

  return stats;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        const q = query(collection(db, "simulations"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const conversations = snapshot.docs.map((doc) =>
          normalizeConversation({
            id: doc.id,
            ...doc.data(),
          } as Conversation)
        );

        const stats = calculateProgressStats(user.uid, conversations, progress?.badges || []);

        setProgress(stats);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const addConversation = async (conversation: Conversation) => {
    console.log("📝 addConversation called with:", {
      hasUser: !!user,
      hasId: !!conversation.id,
      id: conversation.id,
      userId: conversation.userId,
      characterId: conversation.characterId,
      messageCount: conversation.messages?.length,
    });

    if (!user) {
      console.error("❌ CRITICAL: No user logged in in ProgressContext");
      throw new Error("No user logged in");
    }
    
    if (!conversation.id) {
      console.error("❌ CRITICAL: No conversation ID provided");
      console.error("Conversation object:", conversation);
      throw new Error("No conversation ID provided");
    }

    console.log("✅ Validation passed, proceeding to save...");

    try {
      console.log("💾 Updating Firestore doc with ID:", conversation.id);
      
      const updateData = {
        feedback: conversation.feedback,
        metrics: conversation.metrics,
        score: conversation.score,
        status: "completed",
        completedAt: new Date(),
      };

      console.log("📝 Update data prepared:", {
        hasFeedback: !!conversation.feedback,
        hasMetrics: !!conversation.metrics,
        score: conversation.score,
      });

      await updateDoc(doc(db, "simulations", conversation.id), updateData);
      
      console.log("✅ Firestore doc updated successfully");
      console.log("✅ Conversation saved successfully to Firestore");
      
      // Reload progress after saving
      const q = query(collection(db, "simulations"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map((doc) =>
        normalizeConversation({
          id: doc.id,
          ...doc.data(),
        } as Conversation)
      );
      
      console.log("🔄 Reloaded progress, total conversations from Firestore:", conversations.length);

      const stats = calculateProgressStats(user.uid, conversations, progress?.badges || []);

      setProgress(stats);
      console.log("✅ Progress state updated successfully");
      console.log("📊 Updated progress stats:", {
        totalPractices: stats.totalPractices,
        averageScore: stats.averageScore,
        currentStreak: stats.currentStreak,
      });
    } catch (error) {
      console.error("❌ CRITICAL ERROR saving conversation:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      throw new Error(`Failed to save conversation: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getConversationHistory = async (): Promise<Conversation[]> => {
    if (!user) return [];
    try {
      console.log("📚 Fetching conversation history for user:", user.uid);
      const q = query(collection(db, "simulations"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs
        .map((doc) =>
          normalizeConversation({
            id: doc.id,
            ...doc.data(),
          } as Conversation)
        )
        .filter(isCompletedConversation);
      console.log("📚 Loaded", conversations.length, "conversations from Firestore");
      return conversations;
    } catch (error) {
      console.error("❌ Error fetching history:", error);
      return [];
    }
  };

  const checkAndUnlockBadges = async (conversation: Conversation): Promise<Badge[]> => {
    if (!user || !progress) return [];

    const unlockedBadges: Badge[] = [];
    const newBadges = [...(progress.badges || [])];

    // First Step badge
    if (progress.totalPractices === 1) {
      newBadges.push({
        ...badges.firstStep,
        unlockedAt: new Date(),
      });
      unlockedBadges.push(newBadges[newBadges.length - 1]);
    }

    // Persistence badge (10 conversations)
    if (progress.totalPractices === 10) {
      newBadges.push({
        ...badges.persistence,
        unlockedAt: new Date(),
      });
      unlockedBadges.push(newBadges[newBadges.length - 1]);
    }

    // Dedication badge (50 conversations)
    if (progress.totalPractices === 50) {
      newBadges.push({
        ...badges.dedication,
        unlockedAt: new Date(),
      });
      unlockedBadges.push(newBadges[newBadges.length - 1]);
    }

    // Score-based badges
    if (conversation.score && conversation.score >= 90) {
      const categoryBadgeMap: Record<string, any> = {
        interviews: badges.masterInterviewer,
        sales: badges.salesExpert,
        negotiations: badges.negotiator,
      };

      const badgeToAdd = categoryBadgeMap[conversation.category];
      if (badgeToAdd && !newBadges.find((b) => b.id === badgeToAdd.id)) {
        newBadges.push({
          ...badgeToAdd,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(newBadges[newBadges.length - 1]);
      }
    }

    // Week Warrior badge (7-day streak)
    if (progress.currentStreak >= 7) {
      if (!newBadges.find((b) => b.id === badges.weekWarrior.id)) {
        newBadges.push({
          ...badges.weekWarrior,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(newBadges[newBadges.length - 1]);
      }
    }

    // Month Master badge (30-day streak)
    if (progress.currentStreak >= 30) {
      if (!newBadges.find((b) => b.id === badges.monthMaster.id)) {
        newBadges.push({
          ...badges.monthMaster,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(newBadges[newBadges.length - 1]);
      }
    }

    if (unlockedBadges.length > 0) {
      setProgress({ ...progress, badges: newBadges });
    }

    // Streak notifications
    if (progress.currentStreak === 7) {
      toast.success("🔥 7-Day Streak! Keep it up!", { duration: 4000 });
    } else if (progress.currentStreak === 14) {
      toast.success("🌟 14-Day Streak! Amazing dedication!", { duration: 4000 });
    } else if (progress.currentStreak === 30) {
      toast.success("👑 30-Day Streak! You're a legend!", { duration: 4000 });
    }

    return unlockedBadges;
  };

  return (
    <ProgressContext.Provider
      value={{ progress, loading, addConversation, getConversationHistory, checkAndUnlockBadges }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
