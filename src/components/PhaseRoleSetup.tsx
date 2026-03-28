import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ROLES, TRANSITION_CONTEXTS, type Role, type TimeHorizon, type TransitionContext } from "@/lib/types";
import { ArrowRight, Crosshair } from "lucide-react";

interface Props {
  role: Role;
  timeHorizon: TimeHorizon;
  transitionContext: TransitionContext;
  customContext: string;
  onRoleChange: (r: Role) => void;
  onHorizonChange: (h: TimeHorizon) => void;
  onContextChange: (c: TransitionContext) => void;
  onCustomContextChange: (c: string) => void;
  onNext: () => void;
}

const PhaseRoleSetup = ({
  role, timeHorizon, transitionContext, customContext,
  onRoleChange, onHorizonChange, onContextChange, onCustomContextChange, onNext
}: Props) => {
  const horizonLabels: Record<number, string> = { 1: "1 Year — Short Term", 3: "3 Years — Medium Term", 5: "5 Years — Long Term" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Crosshair className="w-3 h-3" />
          Phase 1 — Define Parameters
        </div>
        <h2 className="text-3xl font-display font-bold">Define the Role & Time Horizon</h2>
        <p className="text-muted-foreground">Configure the strategic parameters for the trajectory analysis.</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Role</label>
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

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Strategic Time Horizon</label>
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={timeHorizon === 1 ? "text-primary font-medium" : ""}>1 Year</span>
            <span className={timeHorizon === 3 ? "text-primary font-medium" : ""}>3 Years</span>
            <span className={timeHorizon === 5 ? "text-primary font-medium" : ""}>5 Years</span>
          </div>
          <p className="text-sm text-primary font-medium text-center">{horizonLabels[timeHorizon]}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Industry Transition Context</label>
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
            <label className="text-sm font-medium text-foreground">Custom Context</label>
            <Textarea
              value={customContext}
              onChange={e => onCustomContextChange(e.target.value)}
              placeholder="Describe the industry transition context..."
              className="bg-muted border-border min-h-[100px]"
            />
          </motion.div>
        )}
      </div>

      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" className="gap-2 font-display">
          Begin Analysis <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PhaseRoleSetup;
