import { FeedbackData } from "@/types/conversation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackDisplayProps {
  feedback: FeedbackData;
}

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

export const FeedbackDisplay = ({ feedback }: FeedbackDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Overall Score */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Your Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-6xl font-bold">
                <span className={getScoreColor(feedback.overallScore)}>
                  {feedback.overallScore}
                </span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <Progress value={feedback.overallScore} className="flex-1 h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Speech Quality */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speech Quality Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">{feedback.speechQuality.reasoning}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Clarity</span>
                <span className={getScoreColor(feedback.speechQuality.clarity)}>
                  {feedback.speechQuality.clarity}%
                </span>
              </div>
              <Progress value={feedback.speechQuality.clarity} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Pace</span>
                <span className={getScoreColor(feedback.speechQuality.pace)}>
                  {feedback.speechQuality.pace}%
                </span>
              </div>
              <Progress value={feedback.speechQuality.pace} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Confidence</span>
                <span className={getScoreColor(feedback.speechQuality.confidence)}>
                  {feedback.speechQuality.confidence}%
                </span>
              </div>
              <Progress value={feedback.speechQuality.confidence} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Analysis */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">{feedback.contentAnalysis.reasoning}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Relevance</span>
                <span className={getScoreColor(feedback.contentAnalysis.relevance)}>
                  {feedback.contentAnalysis.relevance}%
                </span>
              </div>
              <Progress value={feedback.contentAnalysis.relevance} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Completeness</span>
                <span className={getScoreColor(feedback.contentAnalysis.completeness)}>
                  {feedback.contentAnalysis.completeness}%
                </span>
              </div>
              <Progress value={feedback.contentAnalysis.completeness} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Professionalism</span>
                <span className={getScoreColor(feedback.contentAnalysis.professionalism)}>
                  {feedback.contentAnalysis.professionalism}%
                </span>
              </div>
              <Progress value={feedback.contentAnalysis.professionalism} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vocabulary */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vocabulary & Language</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">{feedback.vocabulary.reasoning}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Vocabulary Richness</span>
                <span className={getScoreColor(feedback.vocabulary.richness)}>
                  {feedback.vocabulary.richness}%
                </span>
              </div>
              <Progress value={feedback.vocabulary.richness} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Appropriateness</span>
                <span className={getScoreColor(feedback.vocabulary.appropriateness)}>
                  {feedback.vocabulary.appropriateness}%
                </span>
              </div>
              <Progress value={feedback.vocabulary.appropriateness} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths and Improvements */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.keyStrengths.map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-yellow-500">→</span>
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actionable Advice */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Actionable Tips for Next Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              {feedback.actionableAdvice.map((advice, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {advice}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Next Practice Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{feedback.nextStepsRecommendation}</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackDisplay;
