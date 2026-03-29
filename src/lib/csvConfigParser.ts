import { CANDIDATE_COLORS, type CandidateInput } from "@/lib/types";

export interface ParsedConfig {
  situation: string;
  role: string;
  timeHorizon: number;
  evaluationCategories: string[];
  candidates: CandidateInput[];
}

export function parseConfigCsv(rawText: string): ParsedConfig {
  // Normalize line endings: remove \r
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) throw new Error("CSV needs a header row and data rows.");

  // Parse header
  const headerLine = lines[0];
  const headerCols = headerLine.split(",").map(h => h.trim().toLowerCase());
  const fieldIdx = headerCols.findIndex(h => h === "field");
  const valueIdx = headerCols.findIndex(h => h === "value");
  if (fieldIdx === -1 || valueIdx === -1) {
    throw new Error("CSV must have 'FIELD' and 'VALUE' columns.");
  }

  let situation = "";
  let role = "";
  let timeHorizon = 5;
  const evaluationCategories: string[] = [];
  const candidateNames: string[] = [];
  const candidateProfiles: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Extract field: everything before first comma
    const firstComma = line.indexOf(",");
    if (firstComma === -1) continue;

    const field = line.substring(0, firstComma).trim().toLowerCase();
    const value = line.substring(firstComma + 1).trim();
    if (!field || !value) continue;

    if (field === "situation") {
      situation = value;
    } else if (field === "role") {
      role = value;
    } else if (field === "strategic_horizon" || field === "time_horizon") {
      const match = value.match(/(\d+)/);
      if (match) timeHorizon = parseInt(match[1]);
    } else if (field === "evaluation_category") {
      evaluationCategories.push(value);
    } else if (field === "candidate_name") {
      candidateNames.push(value);
    } else if (field === "candidate_profile") {
      candidateProfiles.push(value);
    }
  }

  // Pair candidate names with profiles in order
  const candidates: CandidateInput[] = [];
  for (let i = 0; i < candidateNames.length; i++) {
    candidates.push({
      name: candidateNames[i],
      title: role ? `${role} Candidate` : "Candidate",
      color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
      referenceText: candidateProfiles[i] || "",
    });
  }

  return { situation, role, timeHorizon, evaluationCategories, candidates };
}
