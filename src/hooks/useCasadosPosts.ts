import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CasadosPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function useCasadosPosts() {
  return useQuery({
    queryKey: ["casados-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casados_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CasadosPost[];
    },
  });
}

export function usePublishedCasadosPosts() {
  return useQuery({
    queryKey: ["casados-posts", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casados_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CasadosPost[];
    },
  });
}

export function useCreateCasadosPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CasadosPost, "id" | "created_at" | "updated_at">) => {
      const { data: post, error } = await supabase
        .from("casados_posts")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return post;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["casados-posts"] }),
  });
}

export function useUpdateCasadosPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CasadosPost> & { id: string }) => {
      const { data: post, error } = await supabase
        .from("casados_posts")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return post;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["casados-posts"] }),
  });
}

export function useDeleteCasadosPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("casados_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["casados-posts"] }),
  });
}
