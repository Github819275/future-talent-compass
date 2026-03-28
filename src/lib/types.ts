export type Role = 
  | "Chief Executive Officer"
  | "Chief Operating Officer"
  | "Chief Technology Officer"
  | "Chief Financial Officer"
  | "Chief Commercial Officer"
  | "VP of Engineering"
  | "Head of Strategy"
  | "Head of Transformation";

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
  scores: Record<string, number>;
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

export interface TeamPairing {
  candidate: string;
  cSuiteMember: string;
  cSuiteRole: string;
  compatibility: "strong" | "risk";
  reasoning: string;
}

export interface AgentReasoning {
  agentName: string;
  conclusion: string;
  keyFactors: string[];
}

export interface AnalysisState {
  role: Role;
  timeHorizon: TimeHorizon;
  transitionContext: TransitionContext;
  customContext: string;
  companySituation: string;
  cSuiteContext: string;
  phase: number;
  industryForesight: CompetencyForecast[] | null;
  candidateProfiles: CandidateProfile[] | null;
  trajectories: CandidateTrajectory[] | null;
  recommendations: Recommendation[] | null;
  devilsAdvocate: string | null;
  keyInsight: string | null;
  teamPairings: TeamPairing[] | null;
  agentReasoning: AgentReasoning[] | null;
  agentStatus: Record<string, "idle" | "active" | "complete" | "error">;
}

export const ROLES: Role[] = [
  "Chief Executive Officer",
  "Chief Operating Officer",
  "Chief Technology Officer",
  "Chief Financial Officer",
  "Chief Commercial Officer",
  "VP of Engineering",
  "Head of Strategy",
  "Head of Transformation",
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
  "Strategic Vision & Industry Foresight",
  "Transformation & Change Leadership",
  "Electric Vehicle & New Technology Expertise",
  "Financial Acumen & Capital Allocation",
  "Stakeholder Management & Board Relations",
  "Large Organisation Leadership",
  "Innovation & Emerging Technology Adoption",
  "Talent Development & Culture Building",
  "Crisis Management & Risk Mitigation",
  "Global Market Understanding",
  "Regulatory & Policy Navigation",
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
    name: "Klaus Mueller",
    title: "CEO Candidate",
    color: "#60A5FA",
    referenceText: `Klaus Mueller is one of the most experienced automotive executives in Europe. He has spent 25 years rising through the ranks of BMW's powertrain and manufacturing divisions, ultimately serving as SVP of Global Manufacturing Operations. His deep expertise is in internal combustion engine production, lean manufacturing, and large-scale operational excellence. He managed over 15,000 employees across 6 plants and delivered consistent margin improvement year-on-year. His relationships with Tier 1 suppliers are legendary — he personally negotiated BMW's largest ever powertrain supply contracts. He is methodical, deeply respected by the board, and embodies the traditional BMW engineering culture. His weakness is that his entire career has been built in the ICE paradigm — he has begun engaging with electrification strategy in the last 18 months but his understanding of software-defined vehicles, battery chemistry, and direct-to-consumer models remains surface-level. He describes himself as "a fast learner" but his references note he is most comfortable in environments he already deeply understands.`,
  },
  {
    name: "Sara Lindqvist",
    title: "CEO Candidate",
    color: "#34D399",
    referenceText: `Sara Lindqvist is a transformational leader who has spent the last 8 years leading the European expansion of a major EV-native manufacturer. As their Chief Operating Officer, she built the operational infrastructure from 200 to 4,500 employees, launched 3 gigafactory partnerships, and led the company through a successful IPO. Before that, she spent 6 years at a major strategy consultancy specialising in automotive transformation. She thinks natively in software and electrification — she understands battery supply chains, software-defined vehicle architectures, over-the-air update strategies, and direct-to-consumer sales models at a deep operational level. She is visionary, fast-moving, and comfortable with ambiguity. Her weakness is that she has never led an organisation of BMW's scale and complexity — her largest direct organisation was 4,500 people vs BMW's 150,000. She also has limited experience managing legacy operations that must continue generating revenue during a transition. Board members who met her were impressed by her vision but concerned about her ability to manage the political complexity of a 100-year-old German institution.`,
  },
  {
    name: "Thomas Berg",
    title: "CEO Candidate",
    color: "#FBBF24",
    referenceText: `Thomas Berg spent 12 years as a Senior Partner at McKinsey & Company leading their global automotive practice, where he advised 6 of the world's top 10 automakers on electrification strategy, digital transformation, and organisational restructuring. He then served as Chief Transformation Officer at a major European OEM for 4 years, where he led the company's pivot from a diesel-heavy portfolio to a hybrid-first strategy. He is exceptionally skilled at stakeholder management, board communication, and building consensus across competing factions. He understands both the legacy business and the future state intellectually, though his hands-on operational experience is thinner than either Klaus or Sara. He has never run a P&L of BMW's scale. His references describe him as "the smartest person in the room who can get everyone aligned" but also note that his consulting background sometimes shows — he can be perceived as more comfortable with frameworks than with making irreversible operational decisions under pressure. He is the lowest-risk candidate politically but the question is whether BMW needs a diplomat or a revolutionary.`,
  },
];

export const CANDIDATES = DEFAULT_CANDIDATES;

export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  "Chief Executive Officer": [
    "Describe their experience leading large-scale organisational transformation.",
    "What is their strategic vision for the company's future in the EV transition?",
    "How have they managed board relationships and complex stakeholder dynamics?",
    "Describe their track record with P&L management at significant scale.",
    "What evidence is there of their ability to build culture and attract top talent?",
    "How do they balance maintaining legacy revenue streams while investing in the future?",
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
