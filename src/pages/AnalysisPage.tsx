import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AgentPipeline from "@/components/AgentPipeline";
import OutputPanel from "@/components/OutputPanel";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Settings } from "lucide-react";
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

const AnalysisPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AnalysisState>({
    role: "VP of Powertrain",
    timeHorizon: 5,
    transitionContext: "Full EV Transition",
    customContext: "",
    phase: 2,
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
  });
  const [candidates, setCandidates] = useState<CandidateInput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const updateStatus = (agent: string, status: "idle" | "active" | "complete" | "error") => {
    setState(prev => ({
      ...prev,
      agentStatus: { ...prev.agentStatus, [agent]: status },
    }));
  };

  const runAnalysis = useCallback(async (role: Role, transitionContext: TransitionContext, customContext: string, timeHorizon: TimeHorizon, cands: CandidateInput[]) => {
    setIsRunning(true);

    try {
      updateStatus("foresight", "active");
      const forecasts = await runForesightAgent(role, transitionContext, customContext, timeHorizon);
      setState(prev => ({ ...prev, industryForesight: forecasts }));
      updateStatus("foresight", "complete");

      updateStatus("profile", "active");
      const profiles = await Promise.all(cands.map(c => runProfileAgentCustom(c)));
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
      const decision = await runDecisionAgent(trajectories, profiles, forecasts, timeHorizon);
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
  }, []);

  useEffect(() => {
    if (hasStarted) return;
    const raw = sessionStorage.getItem("futureproof_input");
    if (!raw) {
      navigate("/");
      return;
    }
    setHasStarted(true);
    const input = JSON.parse(raw);
    setCandidates(input.candidates);
    setState(prev => ({
      ...prev,
      role: input.role,
      timeHorizon: input.timeHorizon,
      transitionContext: input.transitionContext,
      customContext: input.customContext,
    }));
    runAnalysis(input.role, input.transitionContext, input.customContext, input.timeHorizon, input.candidates);
  }, [navigate, runAnalysis, hasStarted]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        right={
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
              <Settings className="w-3 h-3" />
              {state.role} · {state.timeHorizon}Y · {state.transitionContext}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3 h-3" /> Edit Inputs
            </Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Pipeline */}
        <div className="glass-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-teal"}`} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {isRunning ? "Processing…" : "Pipeline Complete"}
            </span>
          </div>
          <AgentPipeline status={state.agentStatus} />
        </div>

        {/* Output */}
        <OutputPanel state={state} />

        {/* Footer actions */}
        {state.phase === 5 && !isRunning && (
          <div className="flex justify-center pt-6 pb-12">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Run New Analysis
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisPage;
