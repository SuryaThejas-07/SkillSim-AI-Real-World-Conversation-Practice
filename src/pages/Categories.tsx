import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Phone, Handshake, Building2 } from "lucide-react";

const categories = [
  {
    id: "interviews",
    title: "Job Interviews",
    desc: "Practice behavioral, technical, and stress interviews with AI hiring managers.",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
    emoji: "💼",
  },
  {
    id: "sales",
    title: "Sales Calls",
    desc: "Sharpen your pitch, handle objections, and close deals with AI customers.",
    icon: Phone,
    color: "bg-accent/10 text-accent",
    emoji: "📞",
  },
  {
    id: "negotiations",
    title: "Negotiations",
    desc: "Learn negotiation tactics and practice high-stakes conversations.",
    icon: Handshake,
    color: "bg-warning/10 text-warning",
    emoji: "🤝",
  },
  {
    id: "workplace",
    title: "Workplace Communication",
    desc: "Navigate difficult conversations with colleagues, managers, and reports.",
    icon: Building2,
    color: "bg-success/10 text-success",
    emoji: "🏢",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Categories = () => (
  <div className="min-h-screen py-20">
    <div className="container mx-auto px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Skill Categories</h1>
        <p className="text-lg text-muted-foreground">Choose a category to explore AI characters and scenarios</p>
        <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-border/60 bg-card/40 p-4 text-left text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">What this page does</p>
          <p className="mt-1">
            This page helps you choose the communication skill you want to train.
            Each category opens a set of AI characters designed for that scenario.
          </p>
          <p className="mt-1">
            After selecting a category, you will move to characters and start a live practice conversation.
          </p>
        </div>
      </motion.div>
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Link
              to={`/characters?category=${cat.id}`}
              className="group flex min-h-[280px] flex-col rounded-xl bg-card p-10 shadow-card hover:shadow-card-hover transition-all hover:scale-[1.01]"
            >
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl ${cat.color}`}>
                <cat.icon className="h-8 w-8" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {cat.title}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">{cat.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Categories;
