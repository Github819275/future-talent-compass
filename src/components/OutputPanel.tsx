import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BarChart3, TrendingUp, Award } from "lucide-react";
import CandidateCards from "@/components/CandidateCards";
import CompetencyHeatmap from "@/components/CompetencyHeatmap";
import TrajectoryChart from "@/components/TrajectoryChart";
import Recommendations from "@/components/Recommendations";
import AgentReasoningPanel from "@/components/AgentReasoningPanel";
import { Button } from "@/components/ui/button";
import type { AnalysisState } from "@/lib/types";

interface Props {
  state: AnalysisState;
}

const tabs = [
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "competencies", label: "Competencies", icon: BarChart3 },
  { id: "trajectories", label: "Trajectories", icon: TrendingUp },
  { id: "verdict", label: "Verdict", icon: Award },
] as const;

type TabId = (typeof tabs)[number]["id"];

const OutputPanel = ({ state }: Props) => {
  const [activeTab, setActiveTab] = useState<TabId>("candidates");

  const hasForesight = state.industryForesight && state.industryForesight.length > 0;
  const hasTrajectories = state.trajectories && state.trajectories.length > 0;
  const hasRecommendations = state.recommendations && state.recommendations.length > 0;
  

  const isTabReady = (id: TabId) => {
    switch (id) {
      case "candidates": return true;
      case "competencies": return !!hasForesight;
      case "trajectories": return !!hasTrajectories;
      
      case "verdict": return !!hasRecommendations;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <nav className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const ready = isTabReady(tab.id);
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => ready && setActiveTab(tab.id)}
              disabled={!ready}
              className={`
                relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? "bg-background text-primary shadow-sm border border-border/60"
                  : ready
                    ? "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {!ready && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-muted-foreground/20 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "candidates" && (
            <CandidateCards
              profiles={state.candidateProfiles}
              loading={state.agentStatus.profile === "active"}
            />
          )}

          {activeTab === "competencies" && hasForesight && (
            <CompetencyHeatmap
              forecasts={state.industryForesight}
              candidates={state.candidateProfiles}
            />
          )}

          {activeTab === "trajectories" && hasTrajectories && (
            <TrajectoryChart
              trajectories={state.trajectories}
              timeHorizon={state.timeHorizon}
              candidateProfiles={state.candidateProfiles}
            />
          )}


          {activeTab === "verdict" && hasRecommendations && (
            <div className="space-y-6">
              <Recommendations
                recommendations={state.recommendations}
                devilsAdvocate={state.devilsAdvocate}
                keyInsight={state.keyInsight}
              />
              {state.agentReasoning && state.agentReasoning.length > 0 && (
                <AgentReasoningPanel reasoning={state.agentReasoning} />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next / Previous navigation */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={activeTab === tabs[0].id}
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx > 0) setActiveTab(tabs[idx - 1].id);
          }}
        >
          ← Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={activeTab === tabs[tabs.length - 1].id || !isTabReady(tabs[tabs.findIndex(t => t.id === activeTab) + 1]?.id)}
          onClick={() => {
            const idx = tabs.findIndex(t => t.id === activeTab);
            if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
          }}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

export default OutputPanel;
