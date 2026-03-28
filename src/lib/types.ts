export type Role = 
  | "VP of Powertrain"
  | "Head of Supply Chain"
  | "Chief Commercial Officer"
  | "VP of Engineering"
  | "Head of Manufacturing"
  | "Regional Director"
  | "Chief Procurement Officer"
  | "Head of Product Development";

export type TimeHorizon = 1 | 3 | 5;

export type TransitionContext =
  | "Full EV Transition"
  | "Software-Defined Vehicle Shift"
  | "Supply Chain Restructuring"
  | "Autonomous Driving Acceleration"
  | "New Mobility Models"
  | "Custom";

export type SkillLevel = "Core" | "Developed" | "Emerging";

export interface SkillProfile {
  competency: string;
  level: SkillLevel;
  confidence: number;
  reasoning: string;
}

export interface CandidateProfile {
  name: string;
  title: string;
  archetype: string;
  archetypeDescription: string;
  skills: SkillProfile[];
  color: string;
}

export interface CompetencyForecast {
  competency: string;
  scores: { hiring: number; year1: number; year3: number; year5: number };
  trend: "appreciating" | "stable" | "depreciating";
  reasoning: string;
}

export interface TrajectoryPoint {
  time: string;
  score: number;
  optimistic: number;
  pessimistic: number;
}

export interface CandidateTrajectory {
  candidateName: string;
  points: TrajectoryPoint[];
  crossingPoints: { time: string; label: string }[];
  appreciatingSkills: string[];
  depreciatingSkills: string[];
}

export interface Recommendation {
  horizon: string;
  candidate: string;
  rationale: string;
  risk: string;
  developmentPlan?: string;
}

export interface AnalysisState {
  role: Role;
  timeHorizon: TimeHorizon;
  transitionContext: TransitionContext;
  customContext: string;
  phase: number;
  industryForesight: CompetencyForecast[] | null;
  candidateProfiles: CandidateProfile[] | null;
  trajectories: CandidateTrajectory[] | null;
  recommendations: Recommendation[] | null;
  devilsAdvocate: string | null;
  keyInsight: string | null;
  agentStatus: Record<string, "idle" | "active" | "complete" | "error">;
}

export const ROLES: Role[] = [
  "VP of Powertrain",
  "Head of Supply Chain",
  "Chief Commercial Officer",
  "VP of Engineering",
  "Head of Manufacturing",
  "Regional Director",
  "Chief Procurement Officer",
  "Head of Product Development",
];

export const TRANSITION_CONTEXTS: TransitionContext[] = [
  "Full EV Transition",
  "Software-Defined Vehicle Shift",
  "Supply Chain Restructuring",
  "Autonomous Driving Acceleration",
  "New Mobility Models",
  "Custom",
];

export const COMPETENCIES = [
  "Internal Combustion Engine Expertise",
  "Battery & Electrochemistry Knowledge",
  "Power Electronics & Electric Motor Design",
  "Thermal Management Systems",
  "Software Integration & Control Systems",
  "Supplier Relationship Management",
  "Large Team Leadership",
  "Stakeholder Management in Complex Organisations",
  "Programme & Programme Management",
  "Risk Management & Regulatory Compliance",
  "Innovation & Emerging Technology Adoption",
  "Cross-Functional Collaboration",
];
export interface CandidateInput {
  name: string;
  title: string;
  color: string;
  referenceText: string;
}

export const CANDIDATE_COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#A78BFA"];

export const DEFAULT_CANDIDATES: CandidateInput[] = [
  {
    name: "Heinrich Müller",
    title: "VP of Powertrain Candidate",
    color: "#60A5FA",
    referenceText: `Heinrich is one of the most experienced powertrain executives I have encountered in three decades in the automotive industry. He has spent 22 years mastering internal combustion engine development, leading teams that have delivered some of the most efficient and reliable petrol and diesel powertrains in the segment. His technical depth is extraordinary — there is no combustion engineering problem he has not seen and solved. He manages large, complex engineering teams with authority and discipline. His supplier relationships in the traditional powertrain supply base are second to none. He is methodical, thorough, and highly risk-averse, which has served him exceptionally well in an environment where reliability is paramount. He has begun engaging with electrification topics in the last two years but it is not yet an area where he has demonstrated depth — he describes it as the next chapter he is preparing for rather than one he has written.`,
  },
  {
    name: "Yuki Tanaka",
    title: "VP of Powertrain Candidate",
    color: "#34D399",
    referenceText: `Yuki is not a conventional powertrain candidate but I believe she is exactly the kind of leader the industry needs right now. She has 11 years of experience, the last six of which have been spent building and leading the powertrain engineering function at an EV-native startup that was acquired by a major OEM last year. She has deep expertise in battery integration, electric motor design, power electronics, and thermal management systems. She thinks natively in software — she understands how control systems and physical hardware interact in ways that most mechanical engineers her age do not. She is fast-moving and comfortable with ambiguity. Her weakness is that she has only ever worked in flat, startup-style organisations — she has not yet managed the scale and complexity of a traditional automotive engineering hierarchy, and her stakeholder management skills in large corporate environments are untested. She has enormous potential but she will need support in the first 12 to 18 months navigating the organisational complexity.`,
  },
  {
    name: "Robert Baumann",
    title: "VP of Powertrain Candidate",
    color: "#FBBF24",
    referenceText: `Robert is a versatile engineering leader who has moved across multiple powertrain domains over his 16-year career — he has worked on diesel, petrol, hybrid, and most recently mild hybrid systems. He is technically solid across all of these areas without being deeply specialised in any of them. He has also spent three years in a programme management role which gave him strong cross-functional experience and good stakeholder relationships across engineering, procurement, and manufacturing. He is politically astute and well-liked. He has been following the EV transition closely and has taken several external courses on battery technology and electric drivetrain systems — he is genuinely curious and motivated to develop in this direction. He would not be the strongest technical leader on day one in either the traditional or EV domain, but he is the most well-rounded candidate in the pool and the least likely to create disruption during a transition period.`,
  },
];

// Keep backwards compat for components that reference CANDIDATES
export const CANDIDATES = DEFAULT_CANDIDATES;

export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  "VP of Powertrain": [
    "Describe their experience leading powertrain engineering teams and the scale of those teams.",
    "What is their depth of knowledge in electric vehicle powertrain systems vs. traditional ICE?",
    "How have they managed supplier relationships, particularly during technology transitions?",
    "Describe a situation where they navigated organisational complexity or stakeholder conflict.",
    "What evidence is there of their ability to adopt and champion emerging technologies?",
    "How do they approach risk management in engineering decisions?",
  ],
  "Head of Supply Chain": [
    "Describe their experience restructuring supply chains during major industry shifts.",
    "How have they managed supplier diversification and regional sourcing strategies?",
    "What is their track record with cost optimisation without compromising quality?",
    "How do they handle supply chain disruptions and crisis management?",
    "Describe their experience with digital supply chain tools and data-driven decision making.",
    "How do they balance speed-to-market with supply chain resilience?",
  ],
  default: [
    "Describe their leadership style and how they manage large, complex teams.",
    "What evidence is there of strategic thinking beyond day-to-day operations?",
    "How have they navigated periods of significant organisational or industry change?",
    "What is their approach to talent development and succession planning?",
    "Describe their cross-functional collaboration experience.",
    "What are their key technical strengths and known development areas?",
  ],
};