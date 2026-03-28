import { motion } from "framer-motion";
import { User, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CandidateProfile, SkillLevel } from "@/lib/types";
import { CANDIDATES } from "@/lib/types";

interface Props {
  profiles: CandidateProfile[] | null;
  loading: boolean;
}

const levelColor: Record<SkillLevel, string> = {
  Core: "bg-primary/20 text-primary border-primary/30",
  Developed: "bg-teal/20 text-teal border-teal/30",
  Emerging: "bg-amber/20 text-amber border-amber/30",
};

const CandidateCards = ({ profiles, loading }: Props) => {
  const data = profiles || [];

  if (!profiles && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <User className="w-3 h-3" />
          Phase 2 — Candidate Profiles
        </div>
        <h2 className="text-2xl font-display font-bold">Meet the Candidates</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((candidate, i) => (
          <motion.div
            key={candidate.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: candidate.color + "20", color: candidate.color, border: `1px solid ${candidate.color}40` }}
              >
                {candidate.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground">{candidate.name}</h3>
                <p className="text-xs text-muted-foreground">{candidate.title}</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="space-y-1.5 mt-3">
                  {[1,2,3,4].map(j => (
                    <div key={j} className="h-6 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : profiles ? (
              <>
                <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                  <p className="text-xs font-semibold text-primary">{candidate.archetype}</p>
                </div>
                {candidate.archetypeDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{candidate.archetypeDescription}</p>
                )}
                <div className="space-y-1.5">
                  {candidate.skills.slice(0, 6).map(skill => (
                    <div key={skill.competency} className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${levelColor[skill.level]}`}>
                        {skill.level}
                      </span>
                      <span className="text-xs text-foreground truncate">{skill.competency}</span>
                    </div>
                  ))}
                  {candidate.skills.length > 6 && (
                    <p className="text-[10px] text-muted-foreground">+{candidate.skills.length - 6} more</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">Reference text loaded. Awaiting analysis.</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CandidateCards;
