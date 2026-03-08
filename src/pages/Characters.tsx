import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCharacterCard } from "@/components/Skeleton";
import { analytics } from "@/lib/analytics";
import { logger } from "@/lib/logger";
import { Users } from "lucide-react";
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

interface Character {
  id: string;
  name: string;
  personality: string;
  difficulty: string;
  category: string;
}

const allowedCategories = new Set(["interviews", "sales", "negotiations", "workplace"]);
const allowedDifficulties = new Set(["Easy", "Medium", "Hard"]);

const defaultCharacters: Character[] = [
  { id: "strict-hm", name: "Strict Hiring Manager", personality: "Serious, analytical, impatient", difficulty: "Hard", category: "interviews" },
  { id: "friendly-hm", name: "Friendly Recruiter", personality: "Warm, supportive, encouraging", difficulty: "Easy", category: "interviews" },
  { id: "tough-customer", name: "Tough Customer", personality: "Skeptical, price-focused, demanding", difficulty: "Hard", category: "sales" },
  { id: "curious-buyer", name: "Curious Buyer", personality: "Open-minded, asks many questions", difficulty: "Medium", category: "sales" },
  { id: "hardball-negotiator", name: "Hardball Negotiator", personality: "Aggressive, competitive, strategic", difficulty: "Hard", category: "negotiations" },
  { id: "fair-dealer", name: "Fair Dealer", personality: "Balanced, seeks win-win, reasonable", difficulty: "Medium", category: "negotiations" },
  { id: "upset-colleague", name: "Upset Colleague", personality: "Frustrated, emotional, conflict-prone", difficulty: "Medium", category: "workplace" },
  { id: "passive-manager", name: "Passive Manager", personality: "Avoids conflict, vague, indirect", difficulty: "Hard", category: "workplace" },
];

const isValidCharacter = (value: Partial<Character>): value is Character => {
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.personality === "string" &&
    typeof value.difficulty === "string" &&
    typeof value.category === "string" &&
    allowedCategories.has(value.category) &&
    allowedDifficulties.has(value.difficulty)
  );
};

const buildCharacters = (remoteCharacters: Character[], category: string | null): Character[] => {
  const filteredDefaults = category
    ? defaultCharacters.filter((c) => c.category === category)
    : defaultCharacters;

  const filteredRemote = category
    ? remoteCharacters.filter((c) => c.category === category)
    : remoteCharacters;

  // Deduplicate by semantic identity so same character from defaults + Firestore appears once.
  const getIdentityKey = (character: Character): string =>
    `${character.category}::${character.name.trim().toLowerCase()}`;

  const byIdentity = new Map<string, Character>();
  filteredDefaults.forEach((character) => byIdentity.set(getIdentityKey(character), character));
  filteredRemote.forEach((character) => byIdentity.set(getIdentityKey(character), character));

  return [...byIdentity.values()];
};

const difficultyColor: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const Characters = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const ref = collection(db, "characters");
        const snap = await getDocs(ref);

        const remoteCharacters = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Partial<Character>))
          .filter(isValidCharacter);

        setCharacters(buildCharacters(remoteCharacters, category));
      } catch {
        setCharacters(buildCharacters([], category));
      }
      setLoading(false);
    };
    fetchCharacters();
  }, [category]);

  const startSim = (char: Character) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    logger.info("User started practice session", { characterId: char.id, category: char.category });
    analytics.practiceStart(char.category);
    navigate(`/simulation/${char.id}`, { state: { character: char } });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground">AI Characters</h1>
          <p className="text-muted-foreground">Select a character to start your practice session</p>
        </motion.div>

        {loading ? (
          <SkeletonCharacterCard count={3} />
        ) : characters.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No Characters Found"
            description="No AI characters available in this category. Try a different category or come back later."
            action={{
              label: "Explore All Categories",
              onClick: () => navigate("/categories"),
            }}
          />
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((char, i) => (
              <motion.div
                key={char.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 1}
                className="flex flex-col rounded-xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all"
              >
                <img
                  src={avatarMap[char.category] || avatarInterviewer}
                  alt={`${char.name} AI character avatar`}
                  className="mx-auto mb-4 h-20 w-20 rounded-full bg-secondary object-cover"
                />
                <h3 className="mb-1 text-center text-lg font-bold text-card-foreground">{char.name}</h3>
                <p className="mb-3 text-center text-sm text-muted-foreground">{char.personality}</p>
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Badge variant="secondary" className={difficultyColor[char.difficulty]}>
                    {char.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {char.category}
                  </Badge>
                </div>
                <Button 
                  className="mt-auto" 
                  onClick={() => startSim(char)}
                  aria-label={`Start practice with ${char.name}`}
                >
                  Start Practice
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Characters;
