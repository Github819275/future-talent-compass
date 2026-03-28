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
    <div className="flex items-center gap-1.5">
      {AGENTS.map((agent, i) => (
        <div key={agent.key} className="flex items-center gap-1.5 flex-1">
          <div className="flex items-center gap-1.5 flex-1">
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
              ${status[agent.key] === "complete" ? "bg-emerald-100 border border-emerald-300" : ""}
              ${status[agent.key] === "active" ? "bg-primary/10 border border-primary/30 animate-pulse" : ""}
              ${status[agent.key] === "idle" ? "bg-muted border border-border" : ""}
              ${status[agent.key] === "error" ? "bg-red-100 border border-red-300" : ""}
            `}>
              {status[agent.key] === "complete" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              {status[agent.key] === "active" && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
              {status[agent.key] === "idle" && <Circle className="w-2 h-2 text-muted-foreground/40" />}
              {status[agent.key] === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
            </div>
            <span className={`text-[11px] font-medium whitespace-nowrap ${
              status[agent.key] === "active" ? "text-primary" :
              status[agent.key] === "complete" ? "text-emerald-600" : "text-muted-foreground"
            }`}>
              {agent.label}
            </span>
          </div>
          {i < AGENTS.length - 1 && (
            <div className={`h-px flex-shrink-0 w-6 transition-colors duration-500 ${
              status[agent.key] === "complete" ? "bg-emerald-300" : "bg-border"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentPipeline;
