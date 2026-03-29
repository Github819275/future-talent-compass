import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AgentPipeline from "@/components/AgentPipeline";
import OutputPanel from "@/components/OutputPanel";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Settings } from "lucide-react";
import {
  runContextAgent,
  runCandidateAgent,
  runForesightAgent,
  runDecisionAgent,
} from "@/lib/agents";
import type {
  Role, TimeHorizon, TransitionContext,
  AnalysisState, CandidateInput,
} from "@/lib/types";

const AnalysisPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AnalysisState>({
    role: "Chief Executive Officer",
    timeHorizon: 5,
    transitionContext: "Full EV Transition",
    customContext: "",
    companySituation: "",
    cSuiteContext: "",
    phase: 2,
    industryForesight: null,
    candidateProfiles: null,
    trajectories: null,
    recommendations: null,
    devilsAdvocate: null,
    keyInsight: null,
    teamPairings: null,
    agentReasoning: null,
    agentStatus: {
      context: "idle",
      candidate: "idle",
      foresight: "idle",
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

  const runAnalysis = useCallback(async (
    role: Role, _transitionContext: TransitionContext, customContext: string,
    timeHorizon: TimeHorizon, cands: CandidateInput[], companySituation: string
  ) => {
    setIsRunning(true);

    try {
      // AGENT 1: Context Agent
      updateStatus("context", "active");
      const contextResult = await runContextAgent(role, companySituation || customContext, timeHorizon);
      updateStatus("context", "complete");

      // AGENT 2: Candidate Agent
      updateStatus("candidate", "active");
      const { profiles } = await runCandidateAgent(cands, companySituation || customContext, role);
      setState(prev => ({ ...prev, candidateProfiles: profiles, phase: 3 }));
      updateStatus("candidate", "complete");

      // AGENT 3: Foresight Agent
      updateStatus("foresight", "active");
      const { trajectories, forecasts } = await runForesightAgent(
        companySituation || customContext, profiles, contextResult, timeHorizon
      );
      setState(prev => ({ ...prev, trajectories, industryForesight: forecasts }));
      updateStatus("foresight", "complete");

      // AGENT 4: Decision Agent
      updateStatus("decision", "active");
      const decision = await runDecisionAgent(
        companySituation || customContext, profiles, trajectories, contextResult, timeHorizon
      );
      setState(prev => ({
        ...prev,
        recommendations: decision.recommendations,
        devilsAdvocate: decision.devilsAdvocate,
        keyInsight: decision.keyInsight,
        agentReasoning: decision.agentReasoning || null,
        teamPairings: decision.teamPairings || null,
        phase: 5,
      }));
      updateStatus("decision", "complete");

      toast.success("Analysis complete", { description: "All 4 agents have finished processing." });
    } catch (error) {
      console.error("Analysis failed:", error);
      // Mark current active agent as error
      setState(prev => {
        const updated = { ...prev.agentStatus };
        for (const key of Object.keys(updated)) {
          if (updated[key] === "active") updated[key] = "error";
        }
        return { ...prev, agentStatus: updated };
      });
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
      companySituation: input.companySituation || "",
      cSuiteContext: input.cSuiteContext || "",
    }));
    runAnalysis(
      input.role, input.transitionContext, input.customContext,
      input.timeHorizon, input.candidates, input.companySituation || ""
    );
  }, [navigate, runAnalysis, hasStarted]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        right={
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-lg">
              <Settings className="w-3 h-3" />
              {state.role} · {state.timeHorizon}Y
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-1.5 text-xs border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
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
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {isRunning ? "Gemini AI Processing…" : "Pipeline Complete"}
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
