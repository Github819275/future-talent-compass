import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Brain, CheckCircle2 } from "lucide-react";
import type { AgentReasoning } from "@/lib/types";

interface Props {
  reasoning: AgentReasoning[];
}

const AgentReasoningPanel = ({ reasoning }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors"
      >
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-display font-semibold text-foreground">Show Agent Reasoning</span>
        <span className="text-[10px] text-muted-foreground ml-1">— see what each agent concluded and why</span>
        <div className="ml-auto">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-border/40">
              {reasoning.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="pt-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-sm font-display font-semibold text-foreground">{r.agentName}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{r.conclusion}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.keyFactors.map((f, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded-full bg-muted border border-border/40 text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentReasoningPanel;
