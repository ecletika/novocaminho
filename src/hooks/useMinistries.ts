import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Ministry {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bible_verse: string | null;
  icon: string;
  image_url: string | null;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MinistryInsert = Omit<Ministry, "id" | "created_at" | "updated_at">;
export type MinistryUpdate = Partial<MinistryInsert>;

export function useMinistries() {
  return useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Ministry[];
    },
  });
}

export function useMinistry(slug: string) {
  return useQuery({
    queryKey: ["ministry", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Ministry | null;
    },
    enabled: !!slug,
  });
}

export function useCreateMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ministry: MinistryInsert) => {
      const { data, error } = await supabase
        .from("ministries")
        .insert(ministry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({
        title: "Ministério criado",
        description: "O ministério foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MinistryUpdate }) => {
      const { data, error } = await supabase
        .from("ministries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({
        title: "Ministério atualizado",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ministries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({
        title: "Ministério excluído",
        description: "O ministério foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
