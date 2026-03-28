import { supabase } from "@/integrations/supabase/client";
import type {
  Role, TimeHorizon, TransitionContext,
  CompetencyForecast, CandidateProfile, CandidateTrajectory, Recommendation,
} from "@/lib/types";
import { CANDIDATES, COMPETENCIES } from "@/lib/types";

const EV_SEED = `BMW Group has publicly committed to making 50% of global sales fully electric by 2030. The Neue Klasse platform launching in 2025 marks the beginning of a full architectural shift away from combustion-based platforms. The powertrain function will progressively shift from mechanical engineering dominance to software, electronics, and electrochemistry. Traditional combustion expertise will remain relevant for the existing fleet and for markets where EV adoption is slower, but it is a declining domain within the organisation. Battery technology, power electronics, thermal management, and software-defined powertrain control are the growth domains. Supplier relationships must be rebuilt around a fundamentally different supply base. The function will need to manage a dual-track reality for approximately 3-5 years before combustion becomes a maintenance-only domain.`;

async function callAgent(agentType: string, payload: any) {
  const { data, error } = await supabase.functions.invoke("futureproof-agent", {
    body: { agentType, payload },
  });
  if (error) throw new Error(`Agent ${agentType} failed: ${error.message}`);
  return data;
}

export async function runForesightAgent(
  role: Role,
  transitionContext: TransitionContext,
  customContext: string,
  timeHorizon: TimeHorizon
): Promise<CompetencyForecast[]> {
  const contextText = transitionContext === "Custom" ? customContext :
    transitionContext === "Full EV Transition" ? EV_SEED :
    `Industry transition: ${transitionContext}`;

  const result = await callAgent("foresight", {
    role,
    transitionContext: contextText,
    timeHorizon,
    competencies: COMPETENCIES,
  });

  return result.forecasts || [];
}

export async function runProfileAgent(candidateIndex: number): Promise<CandidateProfile> {
  const candidate = CANDIDATES[candidateIndex];
  const result = await callAgent("profile", {
    candidateName: candidate.name,
    referenceText: candidate.referenceText,
    competencies: COMPETENCIES,
  });

  return {
    name: candidate.name,
    title: candidate.title,
    color: candidate.color,
    archetype: result.archetype || "Unknown",
    archetypeDescription: result.archetypeDescription || "",
    skills: result.skills || [],
  };
}

export async function runTrajectoryAgent(
  candidateName: string,
  profile: CandidateProfile,
  forecasts: CompetencyForecast[]
): Promise<CandidateTrajectory> {
  const result = await callAgent("trajectory", {
    candidateName,
    skills: profile.skills,
    forecasts,
  });

  return {
    candidateName,
    points: result.points || [],
    crossingPoints: [],
    appreciatingSkills: result.appreciatingSkills || [],
    depreciatingSkills: result.depreciatingSkills || [],
  };
}

export async function runDecisionAgent(
  trajectories: CandidateTrajectory[],
  profiles: CandidateProfile[],
  forecasts: CompetencyForecast[],
  timeHorizon: TimeHorizon
): Promise<{ recommendations: Recommendation[]; devilsAdvocate: string; keyInsight: string }> {
  const result = await callAgent("decision", {
    trajectories,
    profiles: profiles.map(p => ({ name: p.name, archetype: p.archetype, skills: p.skills })),
    forecasts,
    timeHorizon,
  });

  return {
    recommendations: result.recommendations || [],
    devilsAdvocate: result.devilsAdvocate || "",
    keyInsight: result.keyInsight || "",
  };
}
