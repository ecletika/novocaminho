import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MinistryPost {
  id: string;
  ministry_id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MinistryPostInsert {
  ministry_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  published?: boolean;
}

// Fetch all posts
export function useMinistryPosts() {
  return useQuery({
    queryKey: ["ministry-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministry_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MinistryPost[];
    },
  });
}

// Fetch posts by ministry
export function useMinistryPostsByMinistry(ministryId: string | undefined) {
  return useQuery({
    queryKey: ["ministry-posts", "ministry", ministryId],
    queryFn: async () => {
      if (!ministryId) return [];

      const { data, error } = await supabase
        .from("ministry_posts")
        .select("*")
        .eq("ministry_id", ministryId)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MinistryPost[];
    },
    enabled: !!ministryId,
  });
}

// Fetch single post
export function useMinistryPost(id: string | undefined) {
  return useQuery({
    queryKey: ["ministry-posts", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("ministry_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as MinistryPost;
    },
    enabled: !!id,
  });
}

// Create post
export function useCreateMinistryPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MinistryPostInsert) => {
      const { data: post, error } = await supabase
        .from("ministry_posts")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return post as MinistryPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministry-posts"] });
    },
  });
}

// Update post
export function useUpdateMinistryPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MinistryPostInsert> & { id: string }) => {
      const { data: post, error } = await supabase
        .from("ministry_posts")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return post as MinistryPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministry-posts"] });
    },
  });
}

// Delete post
export function useDeleteMinistryPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ministry_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministry-posts"] });
    },
  });
}

// Upload post image
export async function uploadPostImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("ministry-posts")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("ministry-posts")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
