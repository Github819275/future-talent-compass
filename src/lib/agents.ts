import type {
  Role, TimeHorizon, TransitionContext,
  CompetencyForecast, CandidateProfile, CandidateTrajectory, Recommendation,
  CandidateInput, TeamPairing, AgentReasoning,
} from "@/lib/types";
import { CANDIDATES, COMPETENCIES } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

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

async function fetchCompetencies(): Promise<string[]> {
  const { data, error } = await supabase
    .from("custom_competencies")
    .select("name")
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return COMPETENCIES;
  return data.map((c: any) => c.name);
}

export async function runForesightAgent(
  role: Role,
  transitionContext: TransitionContext,
  customContext: string,
  timeHorizon: TimeHorizon,
  evaluationCategories?: string[]
): Promise<CompetencyForecast[]> {
  const contextText = transitionContext === "Custom" ? customContext :
    transitionContext === "Full EV Transition" ? (customContext || EV_SEED) :
    `Industry transition: ${transitionContext}. ${customContext || ""}`;

  // Use CSV categories if provided, otherwise fall back to DB/defaults
  const competencies = evaluationCategories && evaluationCategories.length > 0
    ? evaluationCategories
    : await fetchCompetencies();

  const result = await callAgent("foresight", {
    role,
    transitionContext: contextText,
    timeHorizon,
    competencies,
  });

  return result.forecasts || [];
}

export async function runProfileAgent(candidateIndex: number): Promise<CandidateProfile> {
  const candidate = CANDIDATES[candidateIndex];
  return runProfileAgentCustom(candidate);
}

export async function runProfileAgentCustom(candidate: CandidateInput, evaluationCategories?: string[]): Promise<CandidateProfile> {
  const competencies = evaluationCategories && evaluationCategories.length > 0
    ? evaluationCategories
    : await fetchCompetencies();

  const result = await callAgent("profile", {
    candidateName: candidate.name,
    referenceText: candidate.referenceText,
    competencies,
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

/**
 * Deterministic trajectory calculation (no AI call).
 * 
 * For each time point in the foresight data:
 *   score(t) = Σ(importance(t) × skillMultiplier × confidence) / Σ(importance(t))
 * 
 * Skill multipliers: Core = 1.0, Developed = 0.7, Emerging = 0.4
 * Optimistic: score + 12%, Pessimistic: score - 12%, both clamped to [0, 100]
 */
const SKILL_MULTIPLIERS: Record<string, number> = {
  Core: 1.0,
  Developed: 0.7,
  Emerging: 0.4,
};

// Canonical time-point ordering for consistent graph rendering
const TIME_ORDER = ["hiring", "6m", "1y", "1.5y", "2y", "2.5y", "3y", "3.5y", "4y", "4.5y", "5y"];
const TIME_LABELS: Record<string, string> = {
  hiring: "Hiring", "6m": "6M", "1y": "Y1", "1.5y": "Y1.5",
  "2y": "Y2", "2.5y": "Y2.5", "3y": "Y3", "3.5y": "Y3.5",
  "4y": "Y4", "4.5y": "Y4.5", "5y": "Y5",
};

export function calculateTrajectory(
  candidateName: string,
  profile: CandidateProfile,
  forecasts: CompetencyForecast[]
): CandidateTrajectory {
  // Build a skill lookup by competency name (case-insensitive)
  const skillMap = new Map<string, SkillProfile>();
  for (const skill of profile.skills) {
    skillMap.set(skill.competency.toLowerCase(), skill);
  }

  // Determine which time keys exist in the foresight data
  const sampleScores = forecasts[0]?.scores || {};
  const timeKeys = TIME_ORDER.filter(t => t in sampleScores);

  const points: TrajectoryPoint[] = [];
  const firstScores: Record<string, number> = {};
  const lastScores: Record<string, number> = {};

  for (const timeKey of timeKeys) {
    let weightedSum = 0;
    let totalImportance = 0;

    for (const forecast of forecasts) {
      const importance = forecast.scores[timeKey] ?? 0;
      if (importance === 0) continue;

      const skill = skillMap.get(forecast.competency.toLowerCase());
      const multiplier = skill ? (SKILL_MULTIPLIERS[skill.level] ?? 0.4) : 0.3;
      const confidence = skill ? skill.confidence : 0.2;

      weightedSum += importance * multiplier * confidence;
      totalImportance += importance;
    }

    const score = totalImportance > 0
      ? Math.round((weightedSum / totalImportance) * 100)
      : 0;

    const optimistic = Math.min(100, Math.round(score * 1.12));
    const pessimistic = Math.max(0, Math.round(score * 0.88));

    const label = TIME_LABELS[timeKey] || timeKey;
    points.push({ time: label, score, optimistic, pessimistic });

    // Track per-competency scores at first and last time points
    if (timeKey === timeKeys[0]) {
      for (const f of forecasts) firstScores[f.competency] = f.scores[timeKey] ?? 0;
    }
    if (timeKey === timeKeys[timeKeys.length - 1]) {
      for (const f of forecasts) lastScores[f.competency] = f.scores[timeKey] ?? 0;
    }
  }

  // Determine appreciating/depreciating skills based on foresight trends
  const appreciatingSkills: string[] = [];
  const depreciatingSkills: string[] = [];

  for (const forecast of forecasts) {
    const first = firstScores[forecast.competency] ?? 0;
    const last = lastScores[forecast.competency] ?? 0;
    if (last > first + 5) appreciatingSkills.push(forecast.competency);
    else if (last < first - 5) depreciatingSkills.push(forecast.competency);
  }

  return {
    candidateName,
    points,
    crossingPoints: [],
    appreciatingSkills,
    depreciatingSkills,
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
