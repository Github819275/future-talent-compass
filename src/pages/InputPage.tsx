import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Zap, ChevronDown, FileText, Plus, Trash2, Upload, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRef } from "react";
import {
  ROLES, CANDIDATE_COLORS, DEFAULT_CANDIDATES,
  type Role, type TimeHorizon, type TransitionContext, type CandidateInput,
} from "@/lib/types";

const InputPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companySituation, setCompanySituation] = useState(
    "BMW Group is undergoing a historic transformation from internal combustion engine (ICE) manufacturing to full electric vehicle (EV) production. The Neue Klasse platform launches in 2025, targeting 50% fully electric global sales by 2030. The company must manage a dual-track reality — maintaining profitability from legacy ICE operations while making massive investments in battery technology, software-defined vehicles, and direct-to-consumer models. The board is divided between traditionalists who want evolutionary change and progressives who believe BMW risks falling behind Tesla, BYD, and new Chinese competitors without revolutionary leadership."
  );
  const [role, setRole] = useState<Role>("Chief Executive Officer");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(5);
  const [candidates, setCandidates] = useState<CandidateInput[]>(DEFAULT_CANDIDATES);
  const [cSuiteContext, setCsuiteContext] = useState(
    "Current C-Suite: CFO (conservative, cost-focused, 20 years at BMW), COO (strong operations leader, manufacturing background, open to change), Chief Engineer (deep ICE expertise, sceptical of rapid EV transition), Chief Commercial Officer (digital-savvy, pushing for direct-to-consumer), Head of HR (focused on cultural transformation and talent retention)"
  );

  const canRun = candidates.length >= 2 && candidates.every(c => c.name.trim() && c.referenceText.trim().length > 20);

  const handleRun = () => {
    sessionStorage.setItem("futureproof_input", JSON.stringify({
      role,
      timeHorizon,
      transitionContext: "Full EV Transition" as TransitionContext,
      customContext: companySituation,
      companySituation,
      cSuiteContext,
      candidates,
    }));
    navigate("/analysis");
  };

  const updateCandidate = (index: number, field: keyof CandidateInput, value: string) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [field]: value };
    setCandidates(updated);
  };

  const addCandidate = () => {
    if (candidates.length >= 5) return;
    const color = CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length];
    setCandidates([...candidates, { name: "", title: "CEO Candidate", color, referenceText: "" }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { toast.error("CSV needs a header and data rows."); return; }
        const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
        const nameIdx = header.findIndex(h => h === "name");
        const textIdx = header.findIndex(h => h.includes("reference") || h.includes("text") || h.includes("cv") || h.includes("notes") || h.includes("description"));
        if (nameIdx === -1 || textIdx === -1) { toast.error("CSV needs 'name' and 'referenceText' columns."); return; }
        const imported: CandidateInput[] = [];
        for (let i = 1; i < lines.length && imported.length < 5; i++) {
          const cols = lines[i].split(",");
          const name = cols[nameIdx]?.replace(/^["']|["']$/g, "").trim();
          const refText = cols[textIdx]?.replace(/^["']|["']$/g, "").trim();
          if (!name || !refText) continue;
          imported.push({ name, title: "CEO Candidate", color: CANDIDATE_COLORS[imported.length % CANDIDATE_COLORS.length], referenceText: refText });
        }
        if (imported.length === 0) { toast.error("No valid candidates in CSV."); return; }
        setCandidates(imported);
        toast.success(`Imported ${imported.length} candidate${imported.length > 1 ? "s" : ""}`);
      } catch { toast.error("Failed to parse CSV."); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal/5" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Multi-Agent Decision Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight">
              Future<span className="text-gradient-blue">Proof</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hire for the leader your organisation will need — not just the one it needs today.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-6 pb-20 space-y-8"
      >
        {/* Company Situation */}
        <section className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">1</div>
            <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Company Situation</h2>
          </div>
          <Textarea
            value={companySituation}
            onChange={e => setCompanySituation(e.target.value)}
            placeholder="Describe the company's current situation, challenges, and strategic context..."
            className="bg-muted/30 border-border/40 min-h-[120px] text-sm leading-relaxed"
          />
        </section>

        {/* Role & Horizon */}
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Role & Strategic Horizon</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Role Being Hired</label>
              <Select value={role} onValueChange={v => setRole(v as Role)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Strategic Horizon</label>
              <Select value={String(timeHorizon)} onValueChange={v => setTimeHorizon(Number(v) as TimeHorizon)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Year — Short Term</SelectItem>
                  <SelectItem value="3">3 Years — Medium Term</SelectItem>
                  <SelectItem value="5">5 Years — Long Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Candidates */}
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Candidate Profiles</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">{candidates.length} candidates</span>
          </div>

          <div className="space-y-4">
            {candidates.map((c, i) => (
              <div key={i} className="border border-border/40 rounded-lg overflow-hidden bg-muted/20">
                <div className="flex items-center gap-3 p-4 border-b border-border/30">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: c.color + "20", color: c.color, border: `1px solid ${c.color}40` }}
                  >
                    {c.name ? c.name.split(" ").map(n => n[0]).join("") : (i + 1)}
                  </div>
                  <Input
                    value={c.name}
                    onChange={e => updateCandidate(i, "name", e.target.value)}
                    placeholder="Candidate name"
                    className="bg-background border-border/50 h-8 text-sm flex-1"
                  />
                  {candidates.length > 2 && (
                    <button onClick={() => removeCandidate(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <Textarea
                    value={c.referenceText}
                    onChange={e => updateCandidate(i, "referenceText", e.target.value)}
                    placeholder="Paste reference letter, CV extract, or interview notes..."
                    className="bg-background/50 border-border/30 min-h-[100px] text-xs leading-relaxed resize-y"
                    rows={4}
                  />
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    {c.referenceText.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              {candidates.length < 5 && (
                <button onClick={addCandidate} className="flex-1 py-3 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Candidate
                </button>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            </div>
          </div>
        </section>

        {/* C-Suite Context */}
        <section className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">4</div>
            <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">Existing C-Suite Context</h2>
          </div>
          <Textarea
            value={cSuiteContext}
            onChange={e => setCsuiteContext(e.target.value)}
            placeholder="Describe the existing leadership team, their strengths, weaknesses, and dynamics..."
            className="bg-muted/30 border-border/40 min-h-[100px] text-sm leading-relaxed"
          />
        </section>

        {/* Run Button */}
        <div className="flex flex-col items-center gap-3 pt-4">
          {!canRun && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Each candidate needs a name and reference text to begin analysis.
            </p>
          )}
          <Button
            onClick={handleRun}
            disabled={!canRun}
            size="lg"
            className="gap-3 font-display text-lg px-12 py-7 glow-blue"
          >
            Run FutureProof Analysis <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default InputPage;
