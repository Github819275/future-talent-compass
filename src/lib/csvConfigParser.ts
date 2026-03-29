import { CANDIDATE_COLORS, type CandidateInput } from "@/lib/types";

export interface ParsedConfig {
  situation: string;
  role: string;
  timeHorizon: number;
  evaluationCategories: string[];
  candidates: CandidateInput[];
}

export function parseConfigCsv(text: string): ParsedConfig {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error("CSV needs a header row and data rows.");

  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
  const fieldIdx = header.findIndex(h => h === "field");
  const valueIdx = header.findIndex(h => h === "value");
  if (fieldIdx === -1 || valueIdx === -1) {
    throw new Error("CSV must have 'FIELD' and 'VALUE' columns.");
  }

  let situation = "";
  let role = "";
  let timeHorizon = 5;
  const evaluationCategories: string[] = [];

  // For candidates: collect names and profiles in order, then pair them
  const candidateNames: string[] = [];
  const candidateProfiles: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = smartSplit(lines[i]);
    const field = row[fieldIdx]?.replace(/^["']|["']$/g, "").trim().toLowerCase() || "";
    // Rejoin everything after the first comma as the value (handles commas in text)
    const rawLine = lines[i];
    const firstCommaIdx = rawLine.indexOf(",");
    const value = firstCommaIdx >= 0 ? rawLine.substring(firstCommaIdx + 1).trim() : "";

    if (!field || !value) continue;

    if (field === "situation") {
      situation = value;
    } else if (field === "role") {
      role = value;
    } else if (field === "strategic_horizon" || field === "strategichorizon" || field === "time_horizon") {
      const match = value.match(/(\d+)/);
      if (match) timeHorizon = parseInt(match[1]);
    } else if (field === "evaluation_category" || field.startsWith("evaluation")) {
      evaluationCategories.push(value);
    } else if (field === "candidate_name") {
      candidateNames.push(value);
    } else if (field === "candidate_profile") {
      candidateProfiles.push(value);
    }
  }

  // Pair names with profiles in order
  const candidates: CandidateInput[] = [];
  for (let i = 0; i < candidateNames.length; i++) {
    const name = candidateNames[i];
    const profile = candidateProfiles[i] || "";
    candidates.push({
      name,
      title: role ? `${role} Candidate` : "Candidate",
      color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
      referenceText: profile,
    });
  }

  return { situation, role, timeHorizon, evaluationCategories, candidates };
}

function smartSplit(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
