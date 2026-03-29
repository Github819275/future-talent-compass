import { Check, Loader2, Circle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentPipelineProps {
  status: Record<string, "idle" | "active" | "complete" | "error">;
}

const AGENTS = [
  { key: "foresight", label: "Context Agent", description: "Analysing organisational mandate" },
  { key: "profile", label: "Candidate Agent", description: "Profiling leadership archetypes" },
  { key: "trajectory", label: "Foresight Agent", description: "Modelling trajectory over time" },
  { key: "risk", label: "Risk Agent", description: "Evaluating transition risks" },
  { key: "decision", label: "Decision Agent", description: "Generating conditional recommendation" },
];

const AgentPipeline = ({ status }: AgentPipelineProps) => {
  return (
    <div className="space-y-2">
      {AGENTS.map((agent, i) => {
        const s = status[agent.key];
        return (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
              s === "active" ? "bg-primary/8 border border-primary/20" :
              s === "complete" ? "bg-emerald-50 border border-emerald-200" :
              "bg-muted/40 border border-transparent"
            }`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
              ${s === "complete" ? "bg-emerald-100 border border-emerald-300" : ""}
              ${s === "active" ? "bg-primary/10 border border-primary/30" : ""}
              ${s === "idle" ? "bg-muted border border-border" : ""}
              ${s === "error" ? "bg-red-100 border border-red-300" : ""}
            `}>
              {s === "complete" && <Check className="w-4 h-4 text-emerald-600" />}
              {s === "active" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              {s === "idle" && <Circle className="w-2.5 h-2.5 text-muted-foreground/40" />}
              {s === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${
                s === "active" ? "text-primary" :
                s === "complete" ? "text-emerald-700" : "text-muted-foreground"
              }`}>
                {agent.label}
              </span>
              <AnimatePresence>
                {(s === "active" || s === "complete") && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`text-xs ${s === "complete" ? "text-emerald-600" : "text-muted-foreground"}`}
                  >
                    {s === "active" ? agent.description + "…" : "Complete ✓"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {i < AGENTS.length - 1 && s === "complete" && (
              <div className="w-px h-4 bg-emerald-300 absolute left-[1.25rem] bottom-0 translate-y-full" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentPipeline;
