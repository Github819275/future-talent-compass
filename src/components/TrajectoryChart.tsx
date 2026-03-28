import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceLine, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { CandidateTrajectory, CandidateProfile, TimeHorizon } from "@/lib/types";

interface Props {
  trajectories: CandidateTrajectory[];
  timeHorizon: TimeHorizon;
  candidateProfiles?: CandidateProfile[] | null;
}

const buildTimeLabels = (horizon: TimeHorizon): string[] => {
  const months = horizon * 12;
  const labels = ["Hiring"];
  for (let m = 6; m <= months; m += 6) {
    if (m < 12) labels.push(`${m}M`);
    else if (m % 12 === 0) labels.push(`Y${m / 12}`);
    else labels.push(`Y${Math.floor(m / 12)}.5`);
  }
  return labels;
};

const TrajectoryChart = ({ trajectories, timeHorizon, candidateProfiles }: Props) => {
  const timeLabels = buildTimeLabels(timeHorizon);

  const getColor = (candidateName: string, fallback: string = "#60A5FA") => {
    return candidateProfiles?.find(p => p.name === candidateName)?.color || fallback;
  };

  const chartData = timeLabels.map((label, i) => {
    const point: Record<string, any> = { time: label };
    trajectories.forEach(t => {
      if (t.points[i]) {
        point[t.candidateName] = t.points[i].score;
        point[`${t.candidateName}_opt`] = t.points[i].optimistic;
        point[`${t.candidateName}_pes`] = t.points[i].pessimistic;
      }
    });
    return point;
  });

  let crossingLabel = "";
  if (trajectories.length >= 2) {
    for (let i = 1; i < timeLabels.length; i++) {
      const a = trajectories[0]?.points[i]?.score;
      const b = trajectories[1]?.points[i]?.score;
      const aPrev = trajectories[0]?.points[i-1]?.score;
      const bPrev = trajectories[1]?.points[i-1]?.score;
      if (a && b && aPrev && bPrev && (aPrev > bPrev) !== (a > b)) {
        crossingLabel = timeLabels[i];
        break;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Activity className="w-3 h-3" />
          Phase 4 — Value Trajectory Analysis
        </div>
        <h2 className="text-2xl font-display font-bold">Projected Value Over Time</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Each candidate's projected fit score across the strategic time horizon, with confidence bands.
        </p>
      </div>

      <div className="glass-card p-6 glow-blue">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
            <XAxis dataKey="time" stroke="hsl(220 10% 46%)" fontSize={12} fontFamily="Space Grotesk" />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(220 10% 46%)"
              fontSize={12}
              fontFamily="Space Grotesk"
              label={{ value: "Fit Score", angle: -90, position: "insideLeft", style: { fill: "hsl(220 10% 46%)", fontFamily: "Space Grotesk", fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 88%)",
                borderRadius: "10px",
                fontFamily: "Inter",
                fontSize: 12,
                color: "hsl(220 25% 12%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            {trajectories.map((t) => {
              const color = getColor(t.candidateName);
              return (
                <Area
                  key={`${t.candidateName}_band`}
                  dataKey={`${t.candidateName}_opt`}
                  stroke="none"
                  fill={color}
                  fillOpacity={0.08}
                  baseLine={chartData.map(d => d[`${t.candidateName}_pes`] || 0)}
                />
              );
            })}

            {trajectories.map((t) => {
              const color = getColor(t.candidateName);
              return (
                <Line
                  key={t.candidateName}
                  type="monotone"
                  dataKey={t.candidateName}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 5, fill: color, strokeWidth: 2, stroke: "hsl(0 0% 100%)" }}
                  activeDot={{ r: 7 }}
                />
              );
            })}

            {crossingLabel && (
              <ReferenceLine
                x={crossingLabel}
                stroke="hsl(217 91% 60%)"
                strokeDasharray="6 4"
                label={{
                  value: "Leadership advantage shifts here",
                  position: "top",
                  style: { fill: "hsl(217 91% 60%)", fontSize: 11, fontFamily: "Space Grotesk" },
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4">
          {trajectories.map((t) => (
            <div key={t.candidateName} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(t.candidateName) }} />
              <span className="text-xs text-foreground">{t.candidateName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skill breakdown */}
      <div className={`grid grid-cols-1 ${trajectories.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
        {trajectories.map((t) => (
          <div key={t.candidateName} className="glass-card p-4 space-y-3">
            <h4 className="text-sm font-display font-semibold" style={{ color: getColor(t.candidateName) }}>
              {t.candidateName}
            </h4>
            {t.appreciatingSkills.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-teal flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Appreciating
                </p>
                {t.appreciatingSkills.map(s => (
                  <p key={s} className="text-xs text-muted-foreground pl-4">• {s}</p>
                ))}
              </div>
            )}
            {t.depreciatingSkills.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-amber flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Depreciating
                </p>
                {t.depreciatingSkills.map(s => (
                  <p key={s} className="text-xs text-muted-foreground pl-4">• {s}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrajectoryChart;
