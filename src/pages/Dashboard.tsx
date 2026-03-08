import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useProgress } from "@/contexts/ProgressContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { analytics } from "@/lib/analytics";
import { ArrowLeft, Flame, Award, TrendingUp, BarChart3, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { progress, loading, getConversationHistory } = useProgress();
  const [performanceTrendData, setPerformanceTrendData] = useState<
    Array<{ name: string; score: number }>
  >([]);

  useEffect(() => {
    if (progress?.totalPractices) {
      console.log("📊 Dashboard loaded with", progress.totalPractices, "practices");
    }
  }, [progress]);

  useEffect(() => {
    const loadPerformanceTrend = async () => {
      try {
        const conversations = await getConversationHistory();

        const toDate = (value: unknown): Date => {
          if (value instanceof Date) return value;
          if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
            return (value as { toDate: () => Date }).toDate();
          }
          const parsed = new Date(value as string | number | Date);
          return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
        };

        const recentScores = [...conversations]
          .sort((a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime())
          .slice(-10)
          .map((conversation, index) => ({
            name: `P${index + 1}`,
            score: Math.round(conversation.score || 0),
          }));

        setPerformanceTrendData(recentScores);
      } catch (error) {
        console.error("Failed to load performance trend data", error);
        setPerformanceTrendData([]);
      }
    };

    if (progress?.totalPractices) {
      void loadPerformanceTrend();
    } else {
      setPerformanceTrendData([]);
    }
  }, [progress?.totalPractices, getConversationHistory]);

  useEffect(() => {
    analytics.viewedDashboard();
  }, []);

  // Calculate stats
  const totalPractices = progress?.totalPractices || 0;
  const averageScore = Math.round(progress?.averageScore || 0);
  const currentStreak = progress?.currentStreak || 0;
  const longestStreak = progress?.longestStreak || 0;
  const totalTime = progress?.totalTime || 0;
  const unlockedBadges = progress?.badges || [];

  // Get category stats from progress
  const categoryStats = progress?.categoryStats || {};
  const categoryChartData = [
    { 
      name: "Interviews", 
      value: categoryStats.interviews?.attempts || 0, 
      fill: "#3b82f6" 
    },
    { 
      name: "Sales", 
      value: categoryStats.sales?.attempts || 0, 
      fill: "#10b981" 
    },
    { 
      name: "Negotiations", 
      value: categoryStats.negotiations?.attempts || 0, 
      fill: "#f59e0b" 
    },
    { 
      name: "Workplace", 
      value: categoryStats.workplace?.attempts || 0, 
      fill: "#8b5cf6" 
    },
  ];

  // Theme-aware colors
  const isDark = theme === "dark";
  const chartColors = {
    gridStroke: isDark ? "#404040" : "#e5e7eb",
    textColor: isDark ? "#d4d4d8" : "#374151",
    lineColor: isDark ? "#60a5fa" : "#3b82f6",
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
  };

  const categoryChartColors = {
    interviews: "#3b82f6",
    sales: "#10b981",
    negotiations: "#f59e0b",
    workplace: "#8b5cf6",
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Your Progress Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your improvement and achievements across all categories.
            </p>
          </div>
        </motion.div>

        {/* Empty State */}
        {totalPractices === 0 && (
          <EmptyState
            icon={<Zap className="h-8 w-8" />}
            title="No Practice Sessions Yet"
            description="Start practicing conversations to see your progress, statistics, and achievements here."
            action={{
              label: "Start Your First Practice",
              onClick: () => navigate("/categories"),
            }}
          />
        )}

        {totalPractices > 0 && (
          <>
        {/* Key Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-4 mb-8"
        >
          {/* Total Practices */}
          <motion.div variants={item}>
            <Card className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Total Practices</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {totalPractices}
              </p>
            </Card>
          </motion.div>

          {/* Average Score */}
          <motion.div variants={item}>
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {averageScore}%
              </p>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={item}>
            <Card className="p-6 text-center">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {currentStreak}
              </p>
            </Card>
          </motion.div>

          {/* Longest Streak */}
          <motion.div variants={item}>
            <Card className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {longestStreak}
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 lg:grid-cols-2 mb-8"
        >
          {/* Category Distribution */}
          <motion.div variants={item}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Category Distribution
              </h3>
              {categoryChartData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.backgroundColor,
                        border: `1px solid ${chartColors.gridStroke}`,
                        borderRadius: "8px",
                        color: chartColors.textColor,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No practice data yet
                </div>
              )}
            </Card>
          </motion.div>

          {/* Performance by Category */}
          <motion.div variants={item}>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Practices by Category
              </h3>
              {totalPractices > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Category",
                        interviews: categoryStats.interviews?.attempts || 0,
                        sales: categoryStats.sales?.attempts || 0,
                        negotiations: categoryStats.negotiations?.attempts || 0,
                        workplace: categoryStats.workplace?.attempts || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                    <XAxis dataKey="name" stroke={chartColors.textColor} />
                    <YAxis stroke={chartColors.textColor} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.backgroundColor,
                        border: `1px solid ${chartColors.gridStroke}`,
                        borderRadius: "8px",
                        color: chartColors.textColor,
                      }}
                    />
                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                    <Bar dataKey="interviews" stackId="a" fill={categoryChartColors.interviews} />
                    <Bar dataKey="sales" stackId="a" fill={categoryChartColors.sales} />
                    <Bar dataKey="negotiations" stackId="a" fill={categoryChartColors.negotiations} />
                    <Bar dataKey="workplace" stackId="a" fill={categoryChartColors.workplace} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No practice data yet
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>

        {/* Performance Trend */}
        {performanceTrendData.length > 0 && !loading && (
          <motion.div variants={item}>
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold text-foreground mb-6">
                Performance Trend (Last 10 Practices)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
                  <XAxis dataKey="name" stroke={chartColors.textColor} />
                  <YAxis domain={[0, 100]} stroke={chartColors.textColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.backgroundColor,
                      border: `1px solid ${chartColors.gridStroke}`,
                      borderRadius: "8px",
                      color: chartColors.textColor,
                    }}
                  />
                  <Legend wrapperStyle={{ color: chartColors.textColor }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={chartColors.lineColor}
                    strokeWidth={2}
                    dot={{ fill: chartColors.lineColor }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Badges Section */}
        <motion.div variants={item}>
          <Card className="p-8">
            <h3 className="text-lg font-bold text-foreground mb-6">
              🏆 Achievements ({unlockedBadges.length})
            </h3>
            {unlockedBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlockedBadges.map((badge: any) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <p className="text-4xl mb-2">{badge.icon}</p>
                    <p className="font-semibold text-sm text-foreground">
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {badge.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Keep practicing to unlock badges! 🎯
              </p>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex gap-4 justify-center"
        >
          <Button size="lg" onClick={() => navigate("/categories")}>
            Continue Practicing
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/characters")}
          >
            Choose Character
          </Button>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
