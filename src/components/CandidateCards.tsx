import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CandidateProfile, SkillLevel } from "@/lib/types";

interface Props {
  profiles: CandidateProfile[] | null;
  loading: boolean;
}

const levelColor: Record<SkillLevel, string> = {
  Core: "bg-primary/10 text-primary border-primary/20",
  Developed: "bg-emerald-50 text-teal border-emerald-200",
  Emerging: "bg-amber-50 text-amber border-amber-200",
};

const levelWeight: Record<SkillLevel, number> = {
  Core: 1.0,
  Developed: 0.7,
  Emerging: 0.4,
};

function computeScore(profile: CandidateProfile): number {
  if (!profile.skills.length) return 0;
  const total = profile.skills.reduce(
    (sum, s) => sum + levelWeight[s.level] * s.confidence,
    0
  );
  return Math.round((total / profile.skills.length) * 100);
}

const VISIBLE_COUNT = 4;

const CandidateCards = ({ profiles, loading }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const raw = profiles || [];
  if (!profiles && !loading) return null;

  // Sort by computed score descending
  const sorted = [...raw].map(p => ({ profile: p, score: computeScore(p) }));
  sorted.sort((a, b) => b.score - a.score);

  const hasMore = sorted.length > VISIBLE_COUNT;
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hiddenCount = sorted.length - VISIBLE_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <User className="w-3 h-3" />
          Candidate Profiles
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Meet the Candidates
        </h2>
        {sorted.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Ranked by composite skill score · {sorted.length} candidate{sorted.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${sorted.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"} gap-4`}>
        {(loading && raw.length === 0
          ? [1, 2, 3].map((_, i) => <SkeletonCard key={i} index={i} />)
          : visible.map(({ profile: candidate, score }, i) => (
              <CandidateCard key={candidate.name} candidate={candidate} score={score} index={i} rank={i + 1} />
            ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(prev => !prev)}
            className="gap-2 text-xs"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show Top {VISIBLE_COUNT} Only
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show {hiddenCount} More Candidate{hiddenCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

function CandidateCard({ candidate, score, index, rank }: { candidate: CandidateProfile; score: number; index: number; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-5 space-y-4 relative"
    >
      {/* Rank badge */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-sm">
        {rank}
      </div>

      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: candidate.color + "15", color: candidate.color, border: `2px solid ${candidate.color}40` }}
        >
          {candidate.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground">{candidate.name}</h3>
          <p className="text-xs text-muted-foreground">{candidate.title}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-foreground">{score}</div>
          <div className="text-[10px] text-muted-foreground">Score</div>
        </div>
      </div>

      <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
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
    </motion.div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="h-8 bg-muted rounded-lg animate-pulse" />
      <div className="space-y-1.5">
        {[1, 2, 3, 4].map(j => (
          <div key={j} className="h-6 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </motion.div>
  );
}

export default CandidateCards;
