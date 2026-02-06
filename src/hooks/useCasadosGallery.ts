import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export function useCasadosGallery() {
  return useQuery({
    queryKey: ["casados-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("casados_gallery")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as GalleryImage[];
    },
  });
}

export function useAddGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { image_url: string; caption?: string }) => {
      const { data: img, error } = await supabase
        .from("casados_gallery")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return img;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["casados-gallery"] }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("casados_gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["casados-gallery"] }),
  });
}

export async function uploadGalleryImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("casados-gallery")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("casados-gallery")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
