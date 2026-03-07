import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventInsert {
  title: string;
  description?: string | null;
  date: string;
  time: string;
  location?: string | null;
  category: string;
  image_url?: string | null;
  is_active?: boolean;
}

export interface EventUpdate extends Partial<EventInsert> {
  id: string;
}

// Fetch all events
export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

// Fetch upcoming events
export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("date", today)
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventInsert) => {
      const { data: event, error } = await supabase
        .from("events")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return event as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });
}

// Update event
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: EventUpdate) => {
      const { data: event, error } = await supabase
        .from("events")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return event as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar evento: " + error.message);
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento: " + error.message);
    },
  });
}

// Upload event image
export async function uploadEventImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("event_images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("event_images")
    .getPublicUrl(filePath);

  return publicUrl;
}
