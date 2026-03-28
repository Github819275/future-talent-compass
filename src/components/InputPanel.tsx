import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ROLES, TRANSITION_CONTEXTS, SUGGESTED_QUESTIONS, CANDIDATE_COLORS,
  type Role, type TimeHorizon, type TransitionContext, type CandidateInput,
} from "@/lib/types";
import {
  ArrowRight, Loader2, Settings, FileText, Plus, Trash2,
  HelpCircle, ChevronDown, ChevronUp, Wand2, Upload,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  role: Role;
  timeHorizon: TimeHorizon;
  transitionContext: TransitionContext;
  customContext: string;
  candidates: CandidateInput[];
  onRoleChange: (r: Role) => void;
  onHorizonChange: (h: TimeHorizon) => void;
  onContextChange: (c: TransitionContext) => void;
  onCustomContextChange: (c: string) => void;
  onCandidatesChange: (c: CandidateInput[]) => void;
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
  role, timeHorizon, transitionContext, customContext, candidates,
  onRoleChange, onHorizonChange, onContextChange, onCustomContextChange,
  onCandidatesChange, onRun, isRunning, compact,
}: Props) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  const questions = SUGGESTED_QUESTIONS[role] || SUGGESTED_QUESTIONS.default;

  const updateCandidate = (index: number, field: keyof CandidateInput, value: string) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    onCandidatesChange(updated);
  };

  const addCandidate = () => {
    if (candidates.length >= 5) return;
    const color = CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length];
    onCandidatesChange([
      ...candidates,
      { name: "", title: `${role} Candidate`, color, referenceText: "" },
    ]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length <= 2) return;
    onCandidatesChange(candidates.filter((_, i) => i !== index));
  };

  const canRun = candidates.length >= 2 && candidates.every(c => c.name.trim() && c.referenceText.trim().length > 20);

  if (compact) {
    return (
      <div className="p-4 space-y-4">
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
            {candidates.map((c) => (
              <div key={c.name} className="rounded-md border border-border/40 bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: c.color + "20", color: c.color, border: `1px solid ${c.color}40` }}
                  >
                    {c.name.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{c.name || "Unnamed"}</span>
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
          Configure the role, provide candidate reference texts, and let FutureProof's multi-agent system analyze their trajectories against projected industry shifts.
        </p>
      </div>

      {/* Step 1: Config */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">1</div>
          <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Define Parameters</h3>
        </div>
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <span className={timeHorizon === 1 ? "text-primary font-medium" : ""}>1Y</span>
                <span className={timeHorizon === 3 ? "text-primary font-medium" : ""}>3Y</span>
                <span className={timeHorizon === 5 ? "text-primary font-medium" : ""}>5Y</span>
              </div>
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
          </div>

          {transitionContext === "Custom" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4">
              <Textarea
                value={customContext}
                onChange={e => onCustomContextChange(e.target.value)}
                placeholder="Describe the industry transition context in detail..."
                className="bg-muted border-border min-h-[80px] text-xs"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Suggested Questions */}
      <div>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
        >
          <Wand2 className="w-4 h-4" />
          <span className="font-display font-semibold">Suggested reference questions for {role}</span>
          {showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {showQuestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-5 mt-3 space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
                  Ask these questions to referees / interviewers to gather the right input for the analysis:
                </p>
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 2: Candidates */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">2</div>
          <h3 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Provide Candidate Inputs</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} · min 2, max 5</span>
        </div>

        <div className="space-y-4">
          {candidates.map((c, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card overflow-hidden"
            >
              {/* Candidate header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/30">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: c.color + "20", color: c.color, border: `1px solid ${c.color}40` }}
                >
                  {c.name ? c.name.split(" ").map(n => n[0]).join("") : (i + 1)}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    value={c.name}
                    onChange={e => updateCandidate(i, "name", e.target.value)}
                    placeholder="Candidate name"
                    className="bg-muted/50 border-border/50 h-8 text-sm"
                  />
                  <Input
                    value={c.title}
                    onChange={e => updateCandidate(i, "title", e.target.value)}
                    placeholder="Title / role"
                    className="bg-muted/50 border-border/50 h-8 text-sm"
                  />
                </div>
                <button
                  onClick={() => setExpandedCandidate(expandedCandidate === i ? null : i)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {expandedCandidate === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {candidates.length > 2 && (
                  <button
                    onClick={() => removeCandidate(i)}
                    className="text-muted-foreground hover:text-danger transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Reference text area — always visible but collapsible */}
              <div className={`p-4 ${expandedCandidate === i ? "" : "max-h-[120px] overflow-hidden relative"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Reference text / CV extract / interview notes
                  </label>
                </div>
                <Textarea
                  value={c.referenceText}
                  onChange={e => updateCandidate(i, "referenceText", e.target.value)}
                  placeholder="Paste reference letter, CV extract, or interview notes here. The more detail you provide, the better the analysis. Use the suggested questions above as a guide for what to include."
                  className="bg-muted/30 border-border/30 min-h-[100px] text-xs leading-relaxed resize-y"
                  rows={expandedCandidate === i ? 8 : 4}
                />
                {expandedCandidate !== i && c.referenceText.length > 200 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Word count */}
              <div className="px-4 pb-2 flex items-center gap-2">
                <span className={`text-[9px] font-mono ${c.referenceText.trim().split(/\s+/).filter(Boolean).length > 20 ? "text-teal" : "text-amber"}`}>
                  {c.referenceText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                {c.referenceText.trim().split(/\s+/).filter(Boolean).length < 20 && (
                  <span className="text-[9px] text-amber">— provide more detail for better analysis</span>
                )}
              </div>
            </motion.div>
          ))}

          {candidates.length < 5 && (
            <button
              onClick={addCandidate}
              className="w-full py-3 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          )}
        </div>
      </div>

      {/* Run */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {!canRun && (
          <p className="text-xs text-amber flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Each candidate needs a name and at least a short reference text to begin analysis.
          </p>
        )}
        <Button
          onClick={onRun}
          disabled={isRunning || !canRun}
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
