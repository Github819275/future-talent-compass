import type {
  Role, TimeHorizon, TransitionContext,
  CompetencyForecast, CandidateProfile, CandidateTrajectory, Recommendation,
  CandidateInput, TeamPairing, AgentReasoning,
} from "@/lib/types";
import { COMPETENCIES } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callAgent(agentType: string, payload: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
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
    clearTimeout(timeout);
    throw err;
  }
}

async function fetchCompetencies(): Promise<string[]> {
  const { data, error } = await supabase
    .from("custom_competencies")
    .select("name")
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return COMPETENCIES;
  return data.map((c: any) => c.name);
}

// AGENT 1: Context Agent
export async function runContextAgent(
  role: Role,
  companySituation: string,
  timeHorizon: TimeHorizon
): Promise<any> {
  return callAgent("context", {
    role,
    companySituation,
    timeHorizon,
  });
}

// AGENT 2: Candidate Agent
export async function runCandidateAgent(
  candidates: CandidateInput[],
  companySituation: string,
  role: Role
): Promise<{ profiles: CandidateProfile[] }> {
  const competencies = await fetchCompetencies();

  const result = await callAgent("candidate", {
    candidates: candidates.map(c => ({
      name: c.name,
      title: c.title,
      referenceText: c.referenceText,
    })),
    competencies,
    companySituation,
    role,
  });

  const profiles: CandidateProfile[] = (result.candidates || []).map((c: any, i: number) => ({
    name: c.name,
    title: candidates[i]?.title || "Candidate",
    archetype: c.archetype || "Unknown",
    archetypeDescription: c.archetypeDescription || "",
    skills: c.skills || [],
    color: candidates[i]?.color || "#60A5FA",
    scores: c.scores || {},
  }));

  return { profiles };
}

// AGENT 3: Foresight Agent
export async function runForesightAgent(
  companySituation: string,
  profiles: CandidateProfile[],
  contextResult: any,
  timeHorizon: TimeHorizon
): Promise<{ trajectories: CandidateTrajectory[]; forecasts: CompetencyForecast[] }> {
  const competencies = await fetchCompetencies();

  const result = await callAgent("foresight", {
    companySituation,
    candidates: profiles.map(p => ({
      name: p.name,
      archetype: p.archetype,
      skills: p.skills,
    })),
    contextAnalysis: contextResult,
    competencies,
    timeHorizon,
  });

  const trajectories: CandidateTrajectory[] = (result.trajectories || []).map((t: any) => ({
    candidateName: t.candidateName,
    points: t.points || [],
    crossingPoints: [],
    appreciatingSkills: t.appreciatingSkills || [],
    depreciatingSkills: t.depreciatingSkills || [],
  }));

  // Map forecast score keys to standard format
  const forecasts: CompetencyForecast[] = (result.forecasts || []).map((f: any) => {
    const rawScores = f.scores || {};
    // Normalize keys to standard format
    const scores: Record<string, number> = {};
    const keyMap: Record<string, string> = {
      now: "hiring", y1: "1y", y2: "2y", y3: "3y", y4: "4y", y5: "5y",
      hiring: "hiring", "1y": "1y", "2y": "2y", "3y": "3y", "4y": "4y", "5y": "5y",
    };
    for (const [k, v] of Object.entries(rawScores)) {
      const mapped = keyMap[k] || k;
      scores[mapped] = v as number;
    }
    return {
      competency: f.competency,
      scores,
      trend: f.trend || "stable",
      reasoning: f.reasoning || "",
    };
  });

  return { trajectories, forecasts };
}

// AGENT 4: Decision Agent
export async function runDecisionAgent(
  companySituation: string,
  profiles: CandidateProfile[],
  trajectories: CandidateTrajectory[],
  contextResult: any,
  timeHorizon: TimeHorizon
): Promise<{
  recommendations: Recommendation[];
  devilsAdvocate: string;
  keyInsight: string;
  agentReasoning: AgentReasoning[];
  teamPairings: TeamPairing[];
}> {
  const result = await callAgent("decision", {
    companySituation,
    candidates: profiles.map(p => ({
      name: p.name,
      archetype: p.archetype,
      archetypeDescription: p.archetypeDescription,
      skills: p.skills,
    })),
    trajectories,
    contextAnalysis: contextResult,
    timeHorizon,
  });

  return {
    recommendations: result.recommendations || [],
    devilsAdvocate: result.devilsAdvocate || "",
    keyInsight: result.keyInsight || "",
    agentReasoning: result.agentReasoning || [],
    teamPairings: result.teamPairings || [],
  };
}
