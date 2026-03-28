import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Briefcase, Target, ArrowLeft, Loader2 } from "lucide-react";
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
