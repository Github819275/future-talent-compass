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
    throw new Error("CSV must have 'field' and 'value' columns.");
  }

  let situation = "";
  let role = "";
  let timeHorizon = 5;
  const evaluationCategories: string[] = [];
  const candidateMap = new Map<string, { name: string; text: string }>();

  for (let i = 1; i < lines.length; i++) {
    // Smart CSV split: handle commas inside quoted values
    const row = smartSplit(lines[i]);
    const field = row[fieldIdx]?.replace(/^["']|["']$/g, "").trim().toLowerCase() || "";
    const value = row[valueIdx]?.replace(/^["']|["']$/g, "").trim() || "";
    
    // Also grab everything after the value column as it might be part of the value (unquoted commas)
    if (!field || !value) continue;

    if (field === "situation") {
      situation = value;
    } else if (field === "role") {
      role = value;
    } else if (field === "strategic_horizon" || field === "strategichorizon" || field === "time_horizon") {
      const num = parseInt(value);
      if (!isNaN(num)) timeHorizon = num;
    } else if (field.startsWith("evaluation")) {
      evaluationCategories.push(value);
    } else if (field.startsWith("candidate")) {
      // Extract candidate name from field like "candidate_Klaus Bergmann" or "candidate_name"
      const suffix = field.replace(/^candidate_?/, "").trim();
      
      // Check if this is a named candidate entry (candidate_Name format with value as description)
      if (suffix) {
        const existing = candidateMap.get(suffix);
        if (existing) {
          existing.text = existing.text ? existing.text + " " + value : value;
        } else {
          candidateMap.set(suffix, { name: suffix, text: value });
        }
      }
    }
  }

  // Convert candidate map to array, using the name from the key (properly cased)
  const candidates: CandidateInput[] = [];
  for (const [key, val] of candidateMap) {
    // Capitalize the name properly
    const name = key.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    candidates.push({
      name,
      title: role ? `${role} Candidate` : "Candidate",
      color: CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length],
      referenceText: val.text,
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
