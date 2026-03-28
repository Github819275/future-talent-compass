import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InputPanel from "@/components/InputPanel";
import AppHeader from "@/components/AppHeader";
import type { Role, TimeHorizon, TransitionContext, CandidateInput } from "@/lib/types";
import { DEFAULT_CANDIDATES } from "@/lib/types";

const InputPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("VP of Powertrain");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(5);
  const [transitionContext, setTransitionContext] = useState<TransitionContext>("Full EV Transition");
  const [customContext, setCustomContext] = useState("");
  const [candidates, setCandidates] = useState<CandidateInput[]>(DEFAULT_CANDIDATES);

  const handleRun = () => {
    // Store in sessionStorage so AnalysisPage can pick it up
    sessionStorage.setItem("futureproof_input", JSON.stringify({
      role, timeHorizon, transitionContext, customContext, candidates,
    }));
    navigate("/analysis");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <InputPanel
        role={role}
        timeHorizon={timeHorizon}
        transitionContext={transitionContext}
        customContext={customContext}
        candidates={candidates}
        onRoleChange={setRole}
        onHorizonChange={setTimeHorizon}
        onContextChange={setTransitionContext}
        onCustomContextChange={setCustomContext}
        onCandidatesChange={setCandidates}
        onRun={handleRun}
        isRunning={false}
        compact={false}
      />
    </div>
  );
};

export default InputPage;
