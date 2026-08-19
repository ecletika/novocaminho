import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Visitor {
  id: string;
  name: string;
  birth_date: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  wants_home_visit: boolean;
  accompanied_by: string[];
  prayer_requests: string[];
  notes: string | null;
  church: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorInsert {
  name: string;
  birth_date?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
  wants_home_visit?: boolean;
  accompanied_by?: string[];
  prayer_requests?: string[];
  notes?: string | null;
  church?: string | null;
}

// Opções fixas apresentadas no formulário (chave guardada + rótulo mostrado)
export const ACCOMPANIED_OPTIONS = [
  { key: "filhos", label: "Filhos" },
  { key: "conjuge", label: "Cônjuge" },
  { key: "amigos", label: "Amigos" },
] as const;

export const PRAYER_OPTIONS = [
  { key: "familia", label: "Família" },
  { key: "financeiro", label: "Financeiro" },
  { key: "emprego", label: "Emprego" },
  { key: "casa", label: "Casa" },
  { key: "casamento", label: "Casamento" },
  { key: "filhos", label: "Filhos" },
] as const;

export function labelFor(
  list: readonly { key: string; label: string }[],
  key: string,
) {
  return list.find((o) => o.key === key)?.label ?? key;
}

// Todos os visitantes (mais recentes primeiro) — usado no admin
export function useVisitors() {
  return useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as Visitor[];
    },
  });
}

// Visitantes registados hoje — usado na página pública "Visitantes do Dia"
export function useTodayVisitors() {
  return useQuery({
    queryKey: ["visitors", "today"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("visitors")
        .select("id, name, photo_url, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pick<Visitor, "id" | "name" | "photo_url" | "created_at">[];
    },
    refetchInterval: 60_000, // atualiza a lista do dia a cada minuto
  });
}

export function useCreateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: VisitorInsert) => {
      // Rede de segurança: se a coluna church ainda não existir na BD,
      // grava na mesma (sem a igreja) em vez de falhar.
      let { data: visitor, error } = await supabase
        .from("visitors")
        .insert(data)
        .select()
        .single();
      if (error && ((error as any).code === "PGRST204" || /church/i.test(error.message || ""))) {
        const { church, ...safe } = data as any;
        ({ data: visitor, error } = await supabase
          .from("visitors")
          .insert(safe)
          .select()
          .single());
      }
      if (error) throw error;
      return visitor as Visitor;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useUpdateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: VisitorInsert & { id: string }) => {
      let { data: visitor, error } = await supabase
        .from("visitors")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error && ((error as any).code === "PGRST204" || /church/i.test(error.message || ""))) {
        const { church, ...safe } = data as any;
        ({ data: visitor, error } = await supabase
          .from("visitors")
          .update(safe)
          .eq("id", id)
          .select()
          .single());
      }
      if (error) throw error;
      return visitor as Visitor;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useDeleteVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("visitors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}
