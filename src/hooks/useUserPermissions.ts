import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPermission {
  id: string;
  user_id: string;
  permission: string;
  created_at: string;
}

export const ALL_PERMISSIONS = [
  { key: "inventario", label: "Inventário" },
  { key: "louvor", label: "Louvor" },
  { key: "tech", label: "Mesa & Media" },
  { key: "ministerios", label: "Ministérios" },
  { key: "eventos", label: "Eventos" },
  { key: "conteudos", label: "Conteúdos" },
  { key: "casados", label: "Casados Para Sempre" },
  { key: "aniversarios", label: "Aniversários" },
  { key: "escalas", label: "Escalas" },
  { key: "docs", label: "Documentação" },
  { key: "config", label: "Configurações" },
  { key: "discipulado", label: "Entrevistas de Discipulado" },
] as const;

export function useAllUserPermissions() {
  return useQuery({
    queryKey: ["user-permissions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*");
      if (error) throw error;
      return data as UserPermission[];
    },
  });
}

export function useMyPermissions() {
  return useQuery({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((p) => p.permission);
    },
  });
}

export function useSetUserPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
      // Delete existing
      const { error: delError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", userId);
      if (delError) throw delError;

      // Insert new
      if (permissions.length > 0) {
        const rows = permissions.map((p) => ({ user_id: userId, permission: p }));
        const { error: insError } = await supabase
          .from("user_permissions")
          .insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-permissions-all"] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}
