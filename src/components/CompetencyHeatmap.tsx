import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import type { CompetencyForecast, CandidateProfile } from "@/lib/types";

interface Props {
  forecasts: CompetencyForecast[];
  candidates: CandidateProfile[] | null;
}

// Relative coloring: color cells based on percentile within the dataset, not absolute value
const buildPercentileColorFn = (allScores: number[]) => {
  const sorted = [...allScores].sort((a, b) => a - b);
  const getPercentile = (v: number) => {
    const idx = sorted.filter(s => s <= v).length;
    return idx / sorted.length;
  };
  return (score: number): string => {
    const p = getPercentile(score);
    if (p >= 0.80) return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (p >= 0.60) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (p >= 0.40) return "bg-yellow-50 text-yellow-800 border border-yellow-200";
    if (p >= 0.20) return "bg-orange-50 text-orange-700 border border-orange-200";
    return "bg-red-50 text-red-800 border border-red-200";
  };
};

const CompetencyHeatmap = ({ forecasts, candidates }: Props) => {
  // Derive time points from the first forecast's score keys
  const scoreKeys = forecasts.length > 0 ? Object.keys(forecasts[0].scores) : [];
  const keyToLabel: Record<string, string> = {
    hiring: "Hiring", "6m": "6M", "1y": "Y1", "1.5y": "Y1.5", "2y": "Y2", "2.5y": "Y2.5",
    "3y": "Y3", "3.5y": "Y3.5", "4y": "Y4", "4.5y": "Y4.5", "5y": "Y5",
    // fallbacks for old format
    year1: "Y1", year3: "Y3", year5: "Y5",
  };
  const timePoints = scoreKeys.map(k => keyToLabel[k] || k);

  // Collect ALL scores to compute relative coloring
  const allScores = forecasts.flatMap(f => scoreKeys.map(k => f.scores[k] ?? 0));
  const getColor = buildPercentileColorFn(allScores);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <BarChart3 className="w-3 h-3" />
          Industry Foresight Report
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Competency Evolution Forecast</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          How the required competency profile for this role will evolve over the selected time horizon.
        </p>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 min-w-[200px]">Competency</th>
              {timePoints.map(t => (
                <th key={t} className="text-center text-xs font-medium text-muted-foreground pb-3 px-2 w-20">{t}</th>
              ))}
              <th className="text-center text-xs font-medium text-muted-foreground pb-3 px-2 w-20">Trend</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f, i) => {
              const scores = scoreKeys.map(k => f.scores[k] ?? 0);
              return (
                <motion.tr
                  key={f.competency}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-border/50"
                >
                  <td className="py-2.5 pr-4 text-xs text-foreground font-medium">{f.competency}</td>
                  {scores.map((s, j) => (
                    <td key={j} className="py-2.5 px-2 text-center">
                      <div className={`mx-auto w-14 h-8 rounded-md flex items-center justify-center text-[11px] font-semibold ${getColor(s)}`}>
                        {s}
                      </div>
                    </td>
                  ))}
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      f.trend === "appreciating" ? "bg-emerald-50 text-teal border border-emerald-200" :
                      f.trend === "depreciating" ? "bg-orange-50 text-amber border border-orange-200" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {f.trend === "appreciating" ? "↑ Rising" : f.trend === "depreciating" ? "↓ Falling" : "→ Stable"}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground font-medium">Importance:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-red-100 border border-red-200" />
            <span className="text-[10px] text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-yellow-100 border border-yellow-200" />
            <span className="text-[10px] text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-emerald-100 border border-emerald-200" />
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      {forecasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.filter(f => f.trend !== "stable").slice(0, 4).map(f => (
            <div key={f.competency} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold ${f.trend === "appreciating" ? "text-teal" : "text-amber"}`}>
                  {f.trend === "appreciating" ? "▲" : "▼"}
                </span>
                <span className="text-sm font-semibold text-foreground">{f.competency}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CompetencyHeatmap;
