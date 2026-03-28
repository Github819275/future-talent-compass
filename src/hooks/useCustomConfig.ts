import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCustomRoles() {
  return useQuery({
    queryKey: ["custom_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_roles")
        .select("id, name")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data.map((r: any) => r.name as string);
    },
  });
}

export function useCustomCompetencies() {
  return useQuery({
    queryKey: ["custom_competencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_competencies")
        .select("id, name")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data.map((c: any) => c.name as string);
    },
  });
}

export function useAddRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("custom_roles").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("custom_roles").delete().eq("name", name);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_roles"] }),
  });
}

export function useAddCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("custom_competencies").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_competencies"] }),
  });
}

export function useDeleteCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("custom_competencies").delete().eq("name", name);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_competencies"] }),
  });
}
