export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  characterName: string;
  category: string;
  messages: Array<{ role: "ai" | "user"; message: string }>;
  feedback?: FeedbackData;
  metrics?: MetricsData;
  score?: number;
  duration: number; // in seconds
  createdAt: Date;
  completedAt?: Date;
}

export interface FeedbackData {
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

export interface MetricsData {
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageResponseTime: number;
  longestUserMessage: number;
  shortestUserMessage: number;
  averageUserMessageLength: number;
}

export interface UserProgress {
  userId: string;
  totalPractices: number;
  totalTime: number; // in minutes
  averageScore: number;
  categoryStats: Record<
    string,
    {
      attempts: number;
      averageScore: number;
      bestScore: number;
    }
  >;
  badges: Badge[];
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export const badges = {
  firstStep: {
    id: "first-step",
    name: "First Step",
    description: "Complete your first conversation",
    icon: "🎯",
  },
  persistence: {
    id: "persistence",
    name: "Persistence",
    description: "Complete 10 conversations",
    icon: "💪",
  },
  dedication: {
    id: "dedication",
    name: "Dedication",
    description: "Complete 50 conversations",
    icon: "🔥",
  },
  masterInterviewer: {
    id: "master-interviewer",
    name: "Master Interviewer",
    description: "Get 90+ score in interviews",
    icon: "🎓",
  },
  salesExpert: {
    id: "sales-expert",
    name: "Sales Expert",
    description: "Get 90+ score in sales",
    icon: "📊",
  },
  negotiator: {
    id: "negotiator",
    name: "Negotiator",
    description: "Get 90+ score in negotiations",
    icon: "🤝",
  },
  weekWarrior: {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain 7-day streak",
    icon: "⭐",
  },
  monthMaster: {
    id: "month-master",
    name: "Month Master",
    description: "Maintain 30-day streak",
    icon: "👑",
  },
} as const;
