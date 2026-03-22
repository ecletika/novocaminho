import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AfricaContentType = 'history' | 'image' | 'video' | 'pastor';

export interface AfricaContent {
  id: string;
  type: AfricaContentType;
  title: string;
  description: string | null;
  content: string | null;
  media_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type AfricaContentInsert = Omit<AfricaContent, "id" | "created_at" | "updated_at">;
export type AfricaContentUpdate = Partial<AfricaContentInsert>;

export function useAfricaContents() {
  return useQuery({
    queryKey: ["africa-contents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("africa_content")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AfricaContent[];
    },
  });
}

export function useCreateAfricaContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (content: AfricaContentInsert) => {
      const { data, error } = await supabase
        .from("africa_content")
        .insert(content)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["africa-contents"] });
      toast({
        title: "Conteúdo criado",
        description: "O conteúdo para a África foi criado com sucesso.",
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

export function useUpdateAfricaContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AfricaContentUpdate }) => {
      const { data, error } = await supabase
        .from("africa_content")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["africa-contents"] });
      toast({
        title: "Conteúdo atualizado",
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

export function useDeleteAfricaContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("africa_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["africa-contents"] });
      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi removido.",
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

export async function uploadAfricaMedia(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `media/${fileName}`;

  const { error } = await supabase.storage
    .from("africa")
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("africa")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
