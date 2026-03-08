import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare, Users, BarChart3, Zap, Target, Award } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const steps = [
  { icon: Target, title: "Choose a Scenario", desc: "Pick from job interviews, sales calls, negotiations, and more." },
  { icon: Users, title: "Meet Your AI Character", desc: "Each character has a unique personality and difficulty level." },
  { icon: MessageSquare, title: "Practice the Conversation", desc: "Chat in real-time and experience realistic dialogue." },
  { icon: BarChart3, title: "Get AI Feedback", desc: "Receive scores and detailed tips to improve your skills." },
];

const categories = [
  { icon: "💼", label: "Job Interviews" },
  { icon: "📞", label: "Sales Calls" },
  { icon: "🤝", label: "Negotiations" },
  { icon: "🏢", label: "Workplace Comm." },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 dark:from-primary/10 dark:via-transparent dark:to-secondary/10" />
        <div className="relative">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                AI-Powered Practice
              </span>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground lg:text-5xl xl:text-6xl">
                Practice Real Conversations with{" "}
                <span className="text-primary">AI Humans</span>
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                Improve your communication skills by practicing with AI characters
                that simulate real-world scenarios — from interviews to negotiations.
              </p>
              <div className="mb-8 max-w-2xl rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground backdrop-blur-sm">
                <p className="font-semibold text-foreground">What this page does</p>
                <p className="mt-1">
                  This is your starting point. It introduces how SkillSim works,
                  what skills you can train, and guides you into practice.
                </p>
                <p className="mt-1">
                  Start with <span className="font-semibold text-foreground">Skill Categories</span>,
                  then pick a character, practice a conversation, and review your AI feedback.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/categories">Start Practicing</Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/characters">Explore Scenarios</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <img
                src={heroIllustration}
                alt="People practicing conversations with AI avatars"
                className="w-full max-w-xl rounded-2xl shadow-elevated"
              />
            </motion.div>
          </div>
        </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background py-20 dark:from-secondary/10 dark:to-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground">Four simple steps to level up your communication skills</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-card-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="relative bg-gradient-to-b from-background to-primary/5 py-20 dark:from-background dark:to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Skill Categories</h2>
            <p className="text-muted-foreground">Choose from a variety of real-world conversation scenarios</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link
                  to="/categories"
                  className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02]"
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="font-semibold text-card-foreground">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background py-20 dark:from-secondary/10 dark:to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="rounded-2xl gradient-primary p-12 text-center shadow-elevated"
          >
            <Zap className="mx-auto mb-4 h-10 w-10 text-primary-foreground/80" />
            <h2 className="mb-3 text-3xl font-bold text-primary-foreground">Ready to Level Up?</h2>
            <p className="mx-auto mb-8 max-w-md text-primary-foreground/80">
              Start practicing today and watch your communication skills transform.
            </p>
            <Button variant="outline" size="xl" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 SkillSim AI. Practice smarter, communicate better.
        </div>
      </footer>
    </div>
  );
};

export default Home;
