import { motion } from "framer-motion";
import { Users, ShieldCheck, AlertTriangle } from "lucide-react";
import type { TeamPairing } from "@/lib/types";

interface Props {
  pairings: TeamPairing[];
}

const TeamCompatibility = ({ pairings }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Users className="w-3 h-3" />
          Team Compatibility Analysis
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">C-Suite Team Fit</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          How each candidate pairs with the existing leadership team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pairings.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 border-l-4 ${
              p.compatibility === "strong" ? "border-l-emerald-400" : "border-l-amber-400"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                p.compatibility === "strong" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {p.compatibility === "strong" ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{p.candidate}</span>
                  <span className="text-xs text-muted-foreground">+</span>
                  <span className="text-sm font-medium text-muted-foreground">{p.cSuiteMember}</span>
                  <span className={`ml-auto text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    p.compatibility === "strong"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {p.compatibility === "strong" ? "Strong" : "Risk"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.reasoning}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamCompatibility;
