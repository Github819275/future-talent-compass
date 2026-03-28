import type {
  Role, TimeHorizon, TransitionContext,
  CompetencyForecast, CandidateProfile, CandidateTrajectory, Recommendation,
  CandidateInput, TeamPairing, AgentReasoning,
} from "@/lib/types";
import { CANDIDATES, COMPETENCIES } from "@/lib/types";

const EV_SEED = `BMW Group has publicly committed to making 50% of global sales fully electric by 2030. The Neue Klasse platform launching in 2025 marks the beginning of a full architectural shift away from combustion-based platforms. The company must manage a dual-track reality for approximately 3-5 years. Battery technology, power electronics, software-defined vehicle control, and direct-to-consumer models are the growth domains.`;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callAgent(agentType: string, payload: any, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/futureproof-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ agentType, payload }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent ${agentType} returned ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Agent ${agentType} attempt ${attempt + 1} failed, retrying...`, err);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

export async function runForesightAgent(
  role: Role,
  transitionContext: TransitionContext,
  customContext: string,
  timeHorizon: TimeHorizon
): Promise<CompetencyForecast[]> {
  const contextText = transitionContext === "Custom" ? customContext :
    transitionContext === "Full EV Transition" ? (customContext || EV_SEED) :
    `Industry transition: ${transitionContext}. ${customContext || ""}`;

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
  return runProfileAgentCustom(candidate);
}

export async function runProfileAgentCustom(candidate: CandidateInput): Promise<CandidateProfile> {
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
): Promise<{ recommendations: Recommendation[]; devilsAdvocate: string; keyInsight: string; agentReasoning: AgentReasoning[] }> {
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
    agentReasoning: result.agentReasoning || [],
  };
}

export async function runTeamCompatibilityAgent(
  profiles: CandidateProfile[],
  cSuiteContext: string
): Promise<TeamPairing[]> {
  const result = await callAgent("teamCompatibility", {
    candidates: profiles.map(p => ({ name: p.name, archetype: p.archetype, archetypeDescription: p.archetypeDescription })),
    cSuiteContext,
  });

  return result.pairings || [];
}
