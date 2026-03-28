import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Clock, Rocket, GitBranch } from "lucide-react";
import type { Recommendation } from "@/lib/types";

interface Props {
  recommendations: Recommendation[];
  devilsAdvocate: string | null;
  keyInsight: string | null;
}

const cardIcons = [Clock, Rocket, GitBranch];
const cardAccents = ["border-l-primary", "border-l-teal", "border-l-amber"];

const Recommendations = ({ recommendations, devilsAdvocate, keyInsight }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Lightbulb className="w-3 h-3" />
          Conditional Recommendations
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Decision Intelligence</h2>
      </div>

      {/* Key Insight Card */}
      {keyInsight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border-primary/20 glow-blue text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Key Insight</span>
          </div>
          <p className="text-lg font-display font-semibold text-foreground leading-relaxed max-w-3xl mx-auto">
            {keyInsight}
          </p>
        </motion.div>
      )}

      {/* Three recommendation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => {
          const Icon = cardIcons[i] || Clock;
          return (
            <motion.div
              key={rec.horizon}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 space-y-3 border-l-4 ${cardAccents[i]}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-display font-semibold text-foreground">{rec.horizon}</h3>
              </div>
              <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm font-semibold text-primary">{rec.candidate}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.rationale}</p>
              <div className="pt-2 border-t border-border">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber font-medium">{rec.risk}</p>
                </div>
              </div>
              {rec.developmentPlan && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Development Plan</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.developmentPlan}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Devil's Advocate */}
      {devilsAdvocate && (
        <div className="glass-card p-5 border-l-4 border-l-danger bg-red-50/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <h3 className="text-sm font-display font-semibold text-foreground">Devil's Advocate</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{devilsAdvocate}</p>
        </div>
      )}
    </motion.div>
  );
};

export default Recommendations;
