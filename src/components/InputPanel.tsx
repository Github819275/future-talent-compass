import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ROLES, TRANSITION_CONTEXTS, CANDIDATES, type Role, type TimeHorizon, type TransitionContext } from "@/lib/types";
import { ArrowRight, Loader2, Upload, User, Settings, FileText } from "lucide-react";

interface Props {
  role: Role;
  timeHorizon: TimeHorizon;
  transitionContext: TransitionContext;
  customContext: string;
  onRoleChange: (r: Role) => void;
  onHorizonChange: (h: TimeHorizon) => void;
  onContextChange: (c: TransitionContext) => void;
  onCustomContextChange: (c: string) => void;
  onRun: () => void;
  isRunning: boolean;
  compact: boolean;
}

const horizonLabels: Record<number, string> = {
  1: "1Y — Short Term",
  3: "3Y — Medium Term",
  5: "5Y — Long Term",
};

const InputPanel = ({
  role, timeHorizon, transitionContext, customContext,
  onRoleChange, onHorizonChange, onContextChange, onCustomContextChange,
  onRun, isRunning, compact,
}: Props) => {
  if (compact) {
    return (
      <div className="p-4 space-y-4">
        {/* Section: Configuration */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Input Parameters</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Role</label>
              <p className="text-sm font-medium text-foreground mt-0.5">{role}</p>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Time Horizon</label>
              <p className="text-sm font-medium text-foreground mt-0.5">{horizonLabels[timeHorizon]}</p>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Transition Context</label>
              <p className="text-sm font-medium text-foreground mt-0.5">{transitionContext}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Candidate Inputs</span>
          </div>
          <div className="space-y-3">
            {CANDIDATES.map((c, i) => (
              <div key={c.name} className="rounded-md border border-border/40 bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: c.color + "20", color: c.color, border: `1px solid ${c.color}40` }}
                  >
                    {c.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{c.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4">
                  {c.referenceText.slice(0, 180)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full input view (Phase 1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-10 space-y-10"
    >
      {/* Hero */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-display font-bold">
          Who should you hire for <span className="text-gradient-blue">where you're going</span>?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure the role, time horizon, and industry context. FutureProof's multi-agent system will analyze candidate trajectories against projected industry shifts.
        </p>
      </div>

      {/* Two-column: Config + Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Config */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Parameters</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <Select value={role} onValueChange={(v) => onRoleChange(v as Role)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Strategic Time Horizon</label>
            <Slider
              value={[timeHorizon]}
              onValueChange={([v]) => {
                const mapped = v <= 2 ? 1 : v <= 4 ? 3 : 5;
                onHorizonChange(mapped as TimeHorizon);
              }}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className={timeHorizon === 1 ? "text-primary font-medium" : ""}>1 Year</span>
              <span className={timeHorizon === 3 ? "text-primary font-medium" : ""}>3 Years</span>
              <span className={timeHorizon === 5 ? "text-primary font-medium" : ""}>5 Years</span>
            </div>
            <p className="text-xs text-primary font-medium text-center">{horizonLabels[timeHorizon]}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Industry Transition Context</label>
            <Select value={transitionContext} onValueChange={(v) => onContextChange(v as TransitionContext)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSITION_CONTEXTS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {transitionContext === "Custom" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Custom Context</label>
              <Textarea
                value={customContext}
                onChange={e => onCustomContextChange(e.target.value)}
                placeholder="Describe the industry transition context..."
                className="bg-muted border-border min-h-[80px] text-xs"
              />
            </motion.div>
          )}
        </div>

        {/* Candidate Reference Texts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Candidate Reference Texts</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">These are the raw inputs fed to the Profile Agent</span>
          </div>

          {CANDIDATES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: c.color + "20", color: c.color, border: `1px solid ${c.color}40` }}
                >
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-sm font-display font-semibold text-foreground">{c.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{c.title}</p>
                </div>
                <div className="ml-auto px-2 py-0.5 rounded bg-muted text-[9px] text-muted-foreground font-mono">
                  REF TEXT
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-border/50 pl-3 ml-1">
                {c.referenceText}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onRun}
          disabled={isRunning}
          size="lg"
          className="gap-2 font-display text-base px-8 py-6 glow-blue"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Running Agents…
            </>
          ) : (
            <>
              Run FutureProof Analysis <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default InputPanel;
