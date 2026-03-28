import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Briefcase, Target, ArrowLeft, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import {
  useCustomRoles, useCustomCompetencies,
  useAddRole, useDeleteRole,
  useAddCompetency, useDeleteCompetency,
} from "@/hooks/useCustomConfig";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [newRole, setNewRole] = useState("");
  const [newCompetency, setNewCompetency] = useState("");
  const rolesFileRef = useRef<HTMLInputElement>(null);
  const compFileRef = useRef<HTMLInputElement>(null);

  const { data: roles = [], isLoading: rolesLoading } = useCustomRoles();
  const { data: competencies = [], isLoading: compLoading } = useCustomCompetencies();
  const addRole = useAddRole();
  const deleteRole = useDeleteRole();
  const addCompetency = useAddCompetency();
  const deleteCompetency = useDeleteCompetency();

  const handleAddRole = async () => {
    const name = newRole.trim();
    if (!name) return;
    if (roles.includes(name)) { toast.error("Role already exists"); return; }
    try {
      await addRole.mutateAsync(name);
      setNewRole("");
      toast.success(`Added "${name}"`);
    } catch { toast.error("Failed to add role"); }
  };

  const handleAddCompetency = async () => {
    const name = newCompetency.trim();
    if (!name) return;
    if (competencies.includes(name)) { toast.error("Competency already exists"); return; }
    try {
      await addCompetency.mutateAsync(name);
      setNewCompetency("");
      toast.success(`Added "${name}"`);
    } catch { toast.error("Failed to add competency"); }
  };

  const parseCsvLines = (text: string): string[] => {
    return text
      .split(/\r?\n/)
      .map(line => line.replace(/^["']|["']$/g, "").trim())
      .filter(line => line.length > 0);
  };

  const handleCsvImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "roles" | "competencies",
    existing: string[],
    addFn: (name: string) => Promise<void>,
    fileRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = parseCsvLines(text);

        // Skip header if it looks like one
        const start = lines[0]?.toLowerCase().includes("name") || lines[0]?.toLowerCase().includes("role") || lines[0]?.toLowerCase().includes("competenc") || lines[0]?.toLowerCase().includes("categor") ? 1 : 0;

        let added = 0;
        for (let i = start; i < lines.length; i++) {
          // Handle CSV with multiple columns — take the first column
          const name = lines[i].split(",")[0].replace(/^["']|["']$/g, "").trim();
          if (!name || existing.includes(name)) continue;
          try {
            await addFn(name);
            added++;
          } catch {
            // skip duplicates
          }
        }

        if (added === 0) {
          toast.info("No new items found in CSV.");
        } else {
          toast.success(`Imported ${added} ${type === "roles" ? "role" : "categor"}${added > 1 ? (type === "roles" ? "s" : "ies") : (type === "roles" ? "" : "y")}`);
        }
      } catch {
        toast.error("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        right={
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-xs">
            <ArrowLeft className="w-3 h-3" /> Back to Analysis
          </Button>
        }
      />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold text-foreground">Configuration Dashboard</h2>
          <p className="text-muted-foreground">Customize the roles and evaluation categories used in FutureProof analyses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Roles */}
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-semibold text-foreground">Hiring Roles</h3>
            </div>
            <p className="text-xs text-muted-foreground">The C-suite and leadership roles available in the analysis dropdown.</p>

            {rolesLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {roles.map(role => (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/30 group"
                    >
                      <span className="text-sm text-foreground">{role}</span>
                      <button
                        onClick={async () => {
                          try { await deleteRole.mutateAsync(role); toast.success(`Removed "${role}"`); }
                          catch { toast.error("Failed to remove"); }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Input
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                placeholder="New role name…"
                className="bg-muted/30 border-border/40 h-9 text-sm"
                onKeyDown={e => e.key === "Enter" && handleAddRole()}
              />
              <Button size="sm" onClick={handleAddRole} disabled={!newRole.trim() || addRole.isPending} className="gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <button
              onClick={() => rolesFileRef.current?.click()}
              className="w-full py-2.5 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Import Roles from CSV
            </button>
            <input ref={rolesFileRef} type="file" accept=".csv,.txt" onChange={e => handleCsvImport(e, "roles", roles, (n) => addRole.mutateAsync(n), rolesFileRef)} className="hidden" />
          </section>

          {/* Competencies */}
          <section className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-semibold text-foreground">Evaluation Categories</h3>
            </div>
            <p className="text-xs text-muted-foreground">The competencies used to evaluate candidates and forecast industry trends.</p>

            {compLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {competencies.map(comp => (
                    <motion.div
                      key={comp}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/30 group"
                    >
                      <span className="text-sm text-foreground">{comp}</span>
                      <button
                        onClick={async () => {
                          try { await deleteCompetency.mutateAsync(comp); toast.success(`Removed "${comp}"`); }
                          catch { toast.error("Failed to remove"); }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Input
                value={newCompetency}
                onChange={e => setNewCompetency(e.target.value)}
                placeholder="New competency name…"
                className="bg-muted/30 border-border/40 h-9 text-sm"
                onKeyDown={e => e.key === "Enter" && handleAddCompetency()}
              />
              <Button size="sm" onClick={handleAddCompetency} disabled={!newCompetency.trim() || addCompetency.isPending} className="gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
            <button
              onClick={() => compFileRef.current?.click()}
              className="w-full py-2.5 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Import Categories from CSV
            </button>
            <input ref={compFileRef} type="file" accept=".csv,.txt" onChange={e => handleCsvImport(e, "competencies", competencies, (n) => addCompetency.mutateAsync(n), compFileRef)} className="hidden" />
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
