import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentPipeline from "@/components/AgentPipeline";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  runForesightAgent,
  runProfileAgentCustom,
  runTrajectoryAgent,
  runDecisionAgent,
} from "@/lib/agents";
import type {
  Role, TimeHorizon, TransitionContext,
  AnalysisState, CandidateInput,
} from "@/lib/types";
import { DEFAULT_CANDIDATES } from "@/lib/types";

const initialState: AnalysisState = {
  role: "VP of Powertrain",
  timeHorizon: 5,
  transitionContext: "Full EV Transition",
  customContext: "",
  phase: 1,
  industryForesight: null,
  candidateProfiles: null,
  trajectories: null,
  recommendations: null,
  devilsAdvocate: null,
  keyInsight: null,
  agentStatus: {
    foresight: "idle",
    profile: "idle",
    trajectory: "idle",
    risk: "idle",
    decision: "idle",
  },
};

const Index = () => {
  const [state, setState] = useState<AnalysisState>(initialState);
  const [candidates, setCandidates] = useState<CandidateInput[]>(DEFAULT_CANDIDATES);
  const [isRunning, setIsRunning] = useState(false);

  const updateStatus = (agent: string, status: "idle" | "active" | "complete" | "error") => {
    setState(prev => ({
      ...prev,
      agentStatus: { ...prev.agentStatus, [agent]: status },
    }));
  };

  const runFullAnalysis = useCallback(async () => {
    setIsRunning(true);
    setState(prev => ({ ...prev, phase: 2 }));

    try {
      updateStatus("foresight", "active");
      const forecasts = await runForesightAgent(
        state.role, state.transitionContext, state.customContext, state.timeHorizon
      );
      setState(prev => ({ ...prev, industryForesight: forecasts }));
      updateStatus("foresight", "complete");

      updateStatus("profile", "active");
      const profiles = await Promise.all(
        candidates.map(c => runProfileAgentCustom(c))
      );
      setState(prev => ({ ...prev, candidateProfiles: profiles, phase: 3 }));
      updateStatus("profile", "complete");

      updateStatus("trajectory", "active");
      const trajectories = await Promise.all(
        profiles.map(p => runTrajectoryAgent(p.name, p, forecasts))
      );
      setState(prev => ({ ...prev, trajectories }));
      updateStatus("trajectory", "complete");
      updateStatus("risk", "active");
      await new Promise(r => setTimeout(r, 500));
      updateStatus("risk", "complete");
      setState(prev => ({ ...prev, phase: 4 }));

      updateStatus("decision", "active");
      const decision = await runDecisionAgent(trajectories, profiles, forecasts, state.timeHorizon);
      setState(prev => ({
        ...prev,
        recommendations: decision.recommendations,
        devilsAdvocate: decision.devilsAdvocate,
        keyInsight: decision.keyInsight,
        phase: 5,
      }));
      updateStatus("decision", "complete");

      toast.success("Analysis complete", { description: "All agents have finished processing." });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis error", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsRunning(false);
    }
  }, [state.role, state.transitionContext, state.customContext, state.timeHorizon, candidates]);

  const hasOutput = state.phase >= 2;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground tracking-tight">FutureProof</h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Decision Intelligence</p>
            </div>
          </div>
          {hasOutput && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setState(initialState); setCandidates(DEFAULT_CANDIDATES); setIsRunning(false); }}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3 h-3" /> New Analysis
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto">
        <div className={`grid transition-all duration-700 ${hasOutput ? "grid-cols-[340px_1fr] min-h-[calc(100vh-57px)]" : "grid-cols-1"}`}>
          <div className={`border-r border-border/30 ${hasOutput ? "overflow-y-auto max-h-[calc(100vh-57px)] scrollbar-thin" : ""}`}>
            <InputPanel
              role={state.role}
              timeHorizon={state.timeHorizon}
              transitionContext={state.transitionContext}
              customContext={state.customContext}
              candidates={candidates}
              onRoleChange={r => setState(prev => ({ ...prev, role: r }))}
              onHorizonChange={h => setState(prev => ({ ...prev, timeHorizon: h }))}
              onContextChange={c => setState(prev => ({ ...prev, transitionContext: c }))}
              onCustomContextChange={c => setState(prev => ({ ...prev, customContext: c }))}
              onCandidatesChange={setCandidates}
              onRun={runFullAnalysis}
              isRunning={isRunning}
              compact={hasOutput}
            />
          </div>

          {hasOutput && (
            <div className="overflow-y-auto max-h-[calc(100vh-57px)] scrollbar-thin">
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30 px-6 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Agent Pipeline</span>
                </div>
                <AgentPipeline status={state.agentStatus} />
              </div>
              <div className="px-6 py-6">
                <OutputPanel state={state} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
