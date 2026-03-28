import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

interface AgentPipelineProps {
  status: Record<string, "idle" | "active" | "complete" | "error">;
}

const AGENTS = [
  { key: "foresight", label: "Industry Foresight" },
  { key: "profile", label: "Profile Agent ×3" },
  { key: "trajectory", label: "Trajectory Agent ×3" },
  { key: "risk", label: "Risk Agent ×3" },
  { key: "decision", label: "Decision Agent" },
];

const AgentPipeline = ({ status }: AgentPipelineProps) => {
  return (
    <div className="glass-card p-4 mb-8">
      <div className="flex items-center justify-between gap-2">
        {AGENTS.map((agent, i) => (
          <div key={agent.key} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
                ${status[agent.key] === "complete" ? "bg-teal/20 border border-teal" : ""}
                ${status[agent.key] === "active" ? "bg-primary/20 border border-primary animate-pulse-glow" : ""}
                ${status[agent.key] === "idle" ? "bg-muted border border-border" : ""}
                ${status[agent.key] === "error" ? "bg-danger/20 border border-danger" : ""}
              `}>
                {status[agent.key] === "complete" && <Check className="w-4 h-4 text-teal" />}
                {status[agent.key] === "active" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {status[agent.key] === "idle" && <Circle className="w-3 h-3 text-muted-foreground" />}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                status[agent.key] === "active" ? "text-primary" :
                status[agent.key] === "complete" ? "text-teal" : "text-muted-foreground"
              }`}>
                {agent.label}
              </span>
            </div>
            {i < AGENTS.length - 1 && (
              <div className={`h-px flex-shrink-0 w-8 transition-colors duration-500 ${
                status[agent.key] === "complete" ? "bg-teal/40" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentPipeline;
