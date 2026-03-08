import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Calendar, Trophy } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/types/conversation";
import { toast } from "sonner";

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getConversationHistory } = useProgress();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getConversationHistory();
        setConversations(history.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        }));
        console.log("📜 History page loaded successfully with", history.length, "conversations");
      } catch (error) {
        console.error("Error loading history:", error);
        toast.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [getConversationHistory]);

  const filteredConversations = conversations.filter((conv) =>
    filter === "all" ? true : conv.category === filter
  );

  const categories = ["all", ...new Set(conversations.map((c) => c.category))];

  const formatDate = (date: any) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      interviews: "bg-blue-500/10 text-blue-400",
      sales: "bg-green-500/10 text-green-400",
      negotiations: "bg-purple-500/10 text-purple-400",
      workplace: "bg-orange-500/10 text-orange-400",
    };
    return colors[category] || "bg-gray-500/10 text-gray-400";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view chat history</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Chat History</h1>
            <p className="text-muted-foreground">Review your past practice sessions</p>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading chat history...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
              <p className="text-muted-foreground mb-6">
                Complete a practice session to see it here
              </p>
              <Button onClick={() => navigate("/characters")}>Start Practicing</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conv, idx) => (
                <motion.div
                  key={conv.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{conv.characterName}</h3>
                          <Badge className={getCategoryColor(conv.category)}>
                            {conv.category}
                          </Badge>
                          {conv.feedback?.overallScore && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {conv.feedback.overallScore.toFixed(0)}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(conv.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {conv.messages?.length || 0} messages
                          </div>
                          {conv.duration && (
                            <div>{Math.round(conv.duration)}s</div>
                          )}
                        </div>

                        {conv.feedback?.keyStrengths && (
                          <div className="text-sm">
                            <p className="text-green-400 font-medium">Strengths:</p>
                            <p className="text-muted-foreground">
                              {conv.feedback.keyStrengths.slice(0, 2).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;
