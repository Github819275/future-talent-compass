import { Check, Loader2, Circle, AlertCircle } from "lucide-react";

interface AgentPipelineProps {
  status: Record<string, "idle" | "active" | "complete" | "error">;
}

const AGENTS = [
  { key: "foresight", label: "Foresight" },
  { key: "profile", label: "Profile ×3" },
  { key: "trajectory", label: "Trajectory ×3" },
  { key: "risk", label: "Risk ×3" },
  { key: "decision", label: "Decision" },
];

const AgentPipeline = ({ status }: AgentPipelineProps) => {
  return (
    <div className="flex items-center gap-1">
      {AGENTS.map((agent, i) => (
        <div key={agent.key} className="flex items-center gap-1 flex-1">
          <div className="flex items-center gap-1.5 flex-1">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
              ${status[agent.key] === "complete" ? "bg-teal/20 border border-teal" : ""}
              ${status[agent.key] === "active" ? "bg-primary/20 border border-primary animate-pulse" : ""}
              ${status[agent.key] === "idle" ? "bg-muted/50 border border-border/50" : ""}
              ${status[agent.key] === "error" ? "bg-danger/20 border border-danger" : ""}
            `}>
              {status[agent.key] === "complete" && <Check className="w-3 h-3 text-teal" />}
              {status[agent.key] === "active" && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
              {status[agent.key] === "idle" && <Circle className="w-2 h-2 text-muted-foreground/40" />}
              {status[agent.key] === "error" && <AlertCircle className="w-3 h-3 text-danger" />}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${
              status[agent.key] === "active" ? "text-primary" :
              status[agent.key] === "complete" ? "text-teal" : "text-muted-foreground/60"
            }`}>
              {agent.label}
            </span>
          </div>
          {i < AGENTS.length - 1 && (
            <div className={`h-px flex-shrink-0 w-4 transition-colors duration-500 ${
              status[agent.key] === "complete" ? "bg-teal/40" : "bg-border/30"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentPipeline;
