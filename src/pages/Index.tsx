import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentPipeline from "@/components/AgentPipeline";
import PhaseRoleSetup from "@/components/PhaseRoleSetup";
import CandidateCards from "@/components/CandidateCards";
import CompetencyHeatmap from "@/components/CompetencyHeatmap";
import TrajectoryChart from "@/components/TrajectoryChart";
import Recommendations from "@/components/Recommendations";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  runForesightAgent,
  runProfileAgent,
  runTrajectoryAgent,
  runDecisionAgent,
} from "@/lib/agents";
import type {
  Role, TimeHorizon, TransitionContext,
  AnalysisState,
} from "@/lib/types";

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
      // Phase 2: Industry Foresight
      updateStatus("foresight", "active");
      const forecasts = await runForesightAgent(
        state.role, state.transitionContext, state.customContext, state.timeHorizon
      );
      setState(prev => ({ ...prev, industryForesight: forecasts }));
      updateStatus("foresight", "complete");

      // Phase 3: Profile Agents (parallel)
      updateStatus("profile", "active");
      const profiles = await Promise.all([
        runProfileAgent(0),
        runProfileAgent(1),
        runProfileAgent(2),
      ]);
      setState(prev => ({ ...prev, candidateProfiles: profiles, phase: 3 }));
      updateStatus("profile", "complete");

      // Phase 4: Trajectory Agents (parallel)
      updateStatus("trajectory", "active");
      const trajectories = await Promise.all(
        profiles.map(p => runTrajectoryAgent(p.name, p, forecasts))
      );
      setState(prev => ({ ...prev, trajectories }));
      updateStatus("trajectory", "complete");
      updateStatus("risk", "active");
      // Risk is integrated into trajectory
      await new Promise(r => setTimeout(r, 500));
      updateStatus("risk", "complete");
      setState(prev => ({ ...prev, phase: 4 }));

      // Phase 5: Decision Agent
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
  }, [state.role, state.transitionContext, state.customContext, state.timeHorizon]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground tracking-tight">FutureProof</h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Decision Intelligence</p>
            </div>
          </div>
          {state.phase > 1 && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {state.role} · {state.timeHorizon}Y Horizon · {state.transitionContext}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Pipeline Status */}
        {state.phase > 1 && <AgentPipeline status={state.agentStatus} />}

        <AnimatePresence mode="wait">
          {/* Phase 1 */}
          {state.phase === 1 && (
            <PhaseRoleSetup
              key="phase1"
              role={state.role}
              timeHorizon={state.timeHorizon}
              transitionContext={state.transitionContext}
              customContext={state.customContext}
              onRoleChange={r => setState(prev => ({ ...prev, role: r }))}
              onHorizonChange={h => setState(prev => ({ ...prev, timeHorizon: h }))}
              onContextChange={c => setState(prev => ({ ...prev, transitionContext: c }))}
              onCustomContextChange={c => setState(prev => ({ ...prev, customContext: c }))}
              onNext={runFullAnalysis}
            />
          )}

          {/* Phases 2-5: Show progressive results */}
          {state.phase >= 2 && (
            <motion.div key="analysis" className="space-y-12">
              {/* Candidates */}
              <CandidateCards
                profiles={state.candidateProfiles}
                loading={state.agentStatus.profile === "active"}
              />

              {/* Foresight Heatmap */}
              {state.industryForesight && state.industryForesight.length > 0 && (
                <CompetencyHeatmap
                  forecasts={state.industryForesight}
                  candidates={state.candidateProfiles}
                />
              )}

              {/* Trajectory Chart */}
              {state.trajectories && state.trajectories.length > 0 && (
                <TrajectoryChart
                  trajectories={state.trajectories}
                  timeHorizon={state.timeHorizon}
                />
              )}

              {/* Recommendations */}
              {state.recommendations && state.recommendations.length > 0 && (
                <Recommendations
                  recommendations={state.recommendations}
                  devilsAdvocate={state.devilsAdvocate}
                  keyInsight={state.keyInsight}
                />
              )}

              {/* Restart */}
              {state.phase === 5 && !isRunning && (
                <div className="text-center pt-8 pb-12">
                  <Button
                    variant="outline"
                    onClick={() => setState(initialState)}
                    className="gap-2"
                  >
                    Run New Analysis <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
