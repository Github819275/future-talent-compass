import { motion, AnimatePresence } from "framer-motion";
import CandidateCards from "@/components/CandidateCards";
import CompetencyHeatmap from "@/components/CompetencyHeatmap";
import TrajectoryChart from "@/components/TrajectoryChart";
import Recommendations from "@/components/Recommendations";
import type { AnalysisState } from "@/lib/types";

interface Props {
  state: AnalysisState;
}

const OutputPanel = ({ state }: Props) => {
  return (
    <div className="space-y-10">
      {/* Section label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Analysis Output</span>
        <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
      </div>

      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </div>
  );
};

export default OutputPanel;
