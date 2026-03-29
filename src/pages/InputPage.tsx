import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Trash2, Upload, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  CANDIDATE_COLORS, DEFAULT_CANDIDATES,
  type Role, type TimeHorizon, type TransitionContext, type CandidateInput,
} from "@/lib/types";
import { parseConfigCsv } from "@/lib/csvConfigParser";
import { useCustomRoles } from "@/hooks/useCustomConfig";
import bmwLogo from "@/assets/bmw-logo.png";
import bmwHeroCar from "@/assets/bmw-hero-car.jpg";

const InputPage = () => {
  const navigate = useNavigate();
  const configFileRef = useRef<HTMLInputElement>(null);
  const { data: roles = [] } = useCustomRoles();

  const [companySituation, setCompanySituation] = useState(
    "BMW Group is undergoing a historic transformation from internal combustion engine (ICE) manufacturing to full electric vehicle (EV) production. The Neue Klasse platform launches in 2025, targeting 50% fully electric global sales by 2030. The company must manage a dual-track reality — maintaining profitability from legacy ICE operations while making massive investments in battery technology, software-defined vehicles, and direct-to-consumer models. The board is divided between traditionalists who want evolutionary change and progressives who believe BMW risks falling behind Tesla, BYD, and new Chinese competitors without revolutionary leadership."
  );
  const [role, setRole] = useState<Role>("Chief Executive Officer");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(5);
  const [candidates, setCandidates] = useState<CandidateInput[]>(DEFAULT_CANDIDATES);
  const [configLoaded, setConfigLoaded] = useState(false);

  const canRun = candidates.length >= 2 && candidates.every(c => c.name.trim() && c.referenceText.trim().length > 20);

  const handleRun = () => {
    sessionStorage.setItem("futureproof_input", JSON.stringify({
      role,
      timeHorizon,
      transitionContext: "Full EV Transition" as TransitionContext,
      customContext: companySituation,
      companySituation,
      cSuiteContext: "",
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
    const color = CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length];
    setCandidates([...candidates, { name: "", title: "CEO Candidate", color, referenceText: "" }]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleConfigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const config = parseConfigCsv(text);

        if (config.situation) setCompanySituation(config.situation);
        if (config.role) {
          // Try to match to existing roles, otherwise use as-is
          const matchedRole = roles.find(r => r.toLowerCase().includes(config.role.toLowerCase()));
          if (matchedRole) setRole(matchedRole as Role);
        }
        if (config.timeHorizon) {
          const th = config.timeHorizon;
          if (th === 1 || th === 3 || th === 5) setTimeHorizon(th);
          else if (th <= 2) setTimeHorizon(1);
          else if (th <= 4) setTimeHorizon(3);
          else setTimeHorizon(5);
        }
        if (config.candidates.length >= 2) {
          setCandidates(config.candidates);
        }
        setConfigLoaded(true);
        toast.success(`Configuration loaded — ${config.candidates.length} candidates, ${config.evaluationCategories.length} evaluation categories`);
      } catch (err: any) {
        toast.error(err.message || "Failed to parse configuration CSV.");
      }
    };
    reader.readAsText(file);
    if (configFileRef.current) configFileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* BMW Hero with Car Background */}
      <div className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <img src={bmwHeroCar} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* Header bar */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={bmwLogo} alt="BMW" className="w-12 h-12 object-contain mix-blend-lighten" width={48} height={48} />
            <div className="h-6 w-px bg-white/20" />
            <span className="text-xs font-medium text-white/60 tracking-[0.2em] uppercase">Senior Hiring</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2 text-xs px-5 py-4 border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent"
          >
            <Settings className="w-3.5 h-3.5" /> Configuration
          </Button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
            <p className="text-xs font-medium text-primary tracking-[0.3em] uppercase">Talent Intelligence Platform</p>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.1]">
              Future<span className="text-primary">Proof</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl leading-relaxed">
              Strategic leadership evaluation for the BMW Group's next generation of leaders in the Neue Klasse era.
            </p>

            {/* Upload Configuration CSV — prominent hero CTA */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => configFileRef.current?.click()}
                size="lg"
                variant={configLoaded ? "outline" : "default"}
                className={`gap-3 font-display text-base px-8 py-6 ${configLoaded ? "border-primary/40 text-primary hover:bg-primary/10" : "glow-blue"}`}
              >
                <Upload className="w-5 h-5" />
                {configLoaded ? "Re-upload Configuration" : "Upload Configuration CSV"}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <HelpCircle className="w-4 h-4 text-white/60" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs leading-relaxed p-3">
                    <p className="font-semibold mb-1">Configuration CSV Format</p>
                    <p className="text-muted-foreground mb-2">Upload a CSV with <strong>field</strong> and <strong>value</strong> columns:</p>
                    <ul className="space-y-0.5 text-muted-foreground list-disc pl-3">
                      <li><strong>situation</strong> — Company context</li>
                      <li><strong>role</strong> — Role being hired</li>
                      <li><strong>strategic_horizon</strong> — Years (1, 3, or 5)</li>
                      <li><strong>evaluation_*</strong> — Evaluation categories</li>
                      <li><strong>candidate_Name</strong> — Candidate info</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input ref={configFileRef} type="file" accept=".csv" onChange={handleConfigUpload} className="hidden" />
            </div>
            {configLoaded && (
              <p className="text-xs text-primary/80 flex items-center gap-1.5">
                ✓ Configuration loaded — review and edit below before running analysis.
              </p>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto px-6 pb-20 space-y-8 -mt-4">
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
                <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Strategic Horizon</label>
              <Select value={String(timeHorizon)} onValueChange={v => setTimeHorizon(Number(v) as TimeHorizon)}>
                <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
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
              <div key={i} className="border border-border/40 rounded-sm overflow-hidden bg-muted/20">
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

            <button onClick={addCandidate} className="w-full py-3 border border-dashed border-border/50 rounded-sm text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>
        </section>

        {/* Run Button */}
        <div className="flex flex-col items-center gap-3 pt-4">
          {!canRun && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Each candidate needs a name and reference text to begin analysis.
            </p>
          )}
          <Button onClick={handleRun} disabled={!canRun} size="lg" className="gap-3 font-display text-lg px-12 py-7 glow-blue">
            Run BMW FutureProof Analysis <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default InputPage;
