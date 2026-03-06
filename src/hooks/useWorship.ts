import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
export interface WorshipFunction {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MemberFunction {
  id: string;
  member_id: string;
  function_id: string;
  function?: WorshipFunction;
}

export interface WorshipMember {
  id: string;
  user_id?: string | null;
  name: string;
  phone: string | null;
  photo_url: string | null;
  primary_function_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  primary_function?: WorshipFunction;
  secondary_functions?: MemberFunction[];
}

export interface WorshipSong {
  id: string;
  name: string;
  original_key: string;
  lyrics: string | null;
  has_chords: boolean;
  content_type: "cifra" | "letra";
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorshipMinister {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongMinisterAssignment {
  id: string;
  song_id: string;
  minister_id: string;
  key: string;
  created_at: string;
  song?: WorshipSong;
  minister?: WorshipMinister;
}

export interface ScheduleVocalist {
  id: string;
  schedule_id: string;
  member_id: string;
  member?: WorshipMember;
}

export interface ScheduleMusician {
  id: string;
  schedule_id: string;
  member_id: string;
  instrument: "teclado" | "violao" | "bateria";
  member?: WorshipMember;
}

export interface WorshipSchedule {
  id: string;
  date: string;
  time: string;
  minister_id: string | null;
  created_at: string;
  updated_at: string;
  minister?: WorshipMinister;
  vocalists?: ScheduleVocalist[];
  musicians?: ScheduleMusician[];
}

// Worship Functions Hooks
export function useWorshipFunctions() {
  return useQuery({
    queryKey: ["worship-functions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worship_functions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as WorshipFunction[];
    },
  });
}

export function useCreateWorshipFunction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (func: { name: string }) => {
      const { data, error } = await supabase
        .from("worship_functions")
        .insert(func)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-functions"] });
      toast({ title: "Função adicionada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar função", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorshipFunction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_functions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-functions"] });
      toast({ title: "Função removida com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover função", description: error.message, variant: "destructive" });
    },
  });
}

// Worship Members Hooks
export function useWorshipMembers() {
  return useQuery({
    queryKey: ["worship-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worship_members")
        .select(`
          *,
          primary_function:worship_functions(*)
        `)
        .order("name");
      if (error) throw error;

      // If no members, return empty array
      if (!data || data.length === 0) {
        return [] as WorshipMember[];
      }

      // Fetch secondary functions
      const memberIds = data.map(m => m.id);
      const { data: secondaryFunctions } = await supabase
        .from("member_functions")
        .select(`*, function:worship_functions(*)`)
        .in("member_id", memberIds);

      return data.map(member => ({
        ...member,
        secondary_functions: secondaryFunctions?.filter(sf => sf.member_id === member.id) || []
      })) as WorshipMember[];
    },
  });
}

export function useCreateWorshipMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: {
      name: string;
      phone?: string;
      photo_url?: string;
      primary_function_id?: string;
      user_id?: string;
      secondary_function_ids?: string[];
    }) => {
      const { secondary_function_ids, ...memberData } = member;

      const { data, error } = await supabase
        .from("worship_members")
        .insert(memberData)
        .select()
        .single();
      if (error) throw error;

      // Add secondary functions
      if (secondary_function_ids && secondary_function_ids.length > 0) {
        const { error: funcError } = await supabase
          .from("member_functions")
          .insert(secondary_function_ids.map(fid => ({
            member_id: data.id,
            function_id: fid
          })));
        if (funcError) throw funcError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-members"] });
      toast({ title: "Integrante adicionado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar integrante", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorshipMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      secondary_function_ids,
      ...updates
    }: {
      id: string;
      name?: string;
      phone?: string;
      photo_url?: string;
      primary_function_id?: string;
      user_id?: string | null;
      active?: boolean;
      secondary_function_ids?: string[];
    }) => {
      const { data, error } = await supabase
        .from("worship_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Update secondary functions if provided
      if (secondary_function_ids !== undefined) {
        // Delete existing
        await supabase.from("member_functions").delete().eq("member_id", id);

        // Add new
        if (secondary_function_ids.length > 0) {
          const { error: funcError } = await supabase
            .from("member_functions")
            .insert(secondary_function_ids.map(fid => ({
              member_id: id,
              function_id: fid
            })));
          if (funcError) throw funcError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-members"] });
      toast({ title: "Integrante atualizado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar integrante", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorshipMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-members"] });
      toast({ title: "Integrante removido com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover integrante", description: error.message, variant: "destructive" });
    },
  });
}

// Worship Songs Hooks
export function useWorshipSongs() {
  return useQuery({
    queryKey: ["worship-songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worship_songs")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as WorshipSong[];
    },
  });
}

export function useCreateWorshipSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (song: {
      name: string;
      original_key: string;
      lyrics?: string;
      has_chords?: boolean;
      content_type: "cifra" | "letra";
      youtube_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("worship_songs")
        .insert(song)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-songs"] });
      toast({ title: "Música adicionada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar música", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorshipSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorshipSong> & { id: string }) => {
      const { data, error } = await supabase
        .from("worship_songs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-songs"] });
      toast({ title: "Música atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar música", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorshipSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_songs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-songs"] });
      toast({ title: "Música removida com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover música", description: error.message, variant: "destructive" });
    },
  });
}

// Worship Ministers Hooks
export function useWorshipMinisters() {
  return useQuery({
    queryKey: ["worship-ministers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worship_ministers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as WorshipMinister[];
    },
  });
}

export function useCreateWorshipMinister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (minister: { name: string }) => {
      const { data, error } = await supabase
        .from("worship_ministers")
        .insert(minister)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-ministers"] });
      toast({ title: "Ministrante adicionado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar ministrante", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorshipMinister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_ministers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-ministers"] });
      toast({ title: "Ministrante removido com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover ministrante", description: error.message, variant: "destructive" });
    },
  });
}

// Song Minister Assignments Hooks
export function useSongMinisterAssignments() {
  return useQuery({
    queryKey: ["song-minister-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_minister_assignments")
        .select(`
          *,
          song:worship_songs(*),
          minister:worship_ministers(*)
        `);
      if (error) throw error;
      return data as SongMinisterAssignment[];
    },
  });
}

export function useCreateSongMinisterAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: { song_id: string; minister_id: string; key: string }) => {
      const { data, error } = await supabase
        .from("song_minister_assignments")
        .insert(assignment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-minister-assignments"] });
      toast({ title: "Associação criada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar associação", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSongMinisterAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; key?: string }) => {
      const { data, error } = await supabase
        .from("song_minister_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-minister-assignments"] });
      toast({ title: "Associação atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar associação", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSongMinisterAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("song_minister_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-minister-assignments"] });
      toast({ title: "Associação removida com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover associação", description: error.message, variant: "destructive" });
    },
  });
}

// Worship Schedules Hooks
export function useWorshipSchedules() {
  return useQuery({
    queryKey: ["worship-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worship_schedules")
        .select(`
          *,
          minister:worship_ministers(*)
        `)
        .order("date", { ascending: false });
      if (error) throw error;

      // If no schedules, return empty array
      if (!data || data.length === 0) {
        return [] as WorshipSchedule[];
      }

      // Fetch vocalists and musicians
      const scheduleIds = data.map(s => s.id);

      const { data: vocalists } = await supabase
        .from("schedule_vocalists")
        .select(`*, member:worship_members(*, primary_function:worship_functions(*))`)
        .in("schedule_id", scheduleIds);

      const { data: musicians } = await supabase
        .from("schedule_musicians")
        .select(`*, member:worship_members(*, primary_function:worship_functions(*))`)
        .in("schedule_id", scheduleIds);

      return data.map(schedule => ({
        ...schedule,
        vocalists: vocalists?.filter(v => v.schedule_id === schedule.id) || [],
        musicians: musicians?.filter(m => m.schedule_id === schedule.id) || []
      })) as WorshipSchedule[];
    },
  });
}

export function useCreateWorshipSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: {
      date: string;
      time?: string;
      minister_id?: string;
      vocalist_ids?: string[];
      musician_assignments?: { member_id: string; instrument: "teclado" | "violao" | "bateria" }[];
    }) => {
      const { vocalist_ids, musician_assignments, ...scheduleData } = schedule;

      const { data, error } = await supabase
        .from("worship_schedules")
        .insert({ ...scheduleData, time: scheduleData.time || "00:00" })
        .select()
        .single();
      if (error) throw error;

      // Add vocalists
      if (vocalist_ids && vocalist_ids.length > 0) {
        await supabase.from("schedule_vocalists").insert(
          vocalist_ids.map(vid => ({ schedule_id: data.id, member_id: vid }))
        );
      }

      // Add musicians
      if (musician_assignments && musician_assignments.length > 0) {
        await supabase.from("schedule_musicians").insert(
          musician_assignments.map(ma => ({
            schedule_id: data.id,
            member_id: ma.member_id,
            instrument: ma.instrument
          }))
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast({ title: "Escala criada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar escala", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorshipSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      vocalist_ids,
      musician_assignments,
      ...updates
    }: {
      id: string;
      date?: string;
      time?: string;
      minister_id?: string;
      vocalist_ids?: string[];
      musician_assignments?: { member_id: string; instrument: "teclado" | "violao" | "bateria" }[];
    }) => {
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("worship_schedules")
          .update(updates)
          .eq("id", id);
        if (error) throw error;
      }

      // Update vocalists if provided
      if (vocalist_ids !== undefined) {
        await supabase.from("schedule_vocalists").delete().eq("schedule_id", id);
        if (vocalist_ids.length > 0) {
          await supabase.from("schedule_vocalists").insert(
            vocalist_ids.map(vid => ({ schedule_id: id, member_id: vid }))
          );
        }
      }

      // Update musicians if provided
      if (musician_assignments !== undefined) {
        await supabase.from("schedule_musicians").delete().eq("schedule_id", id);
        if (musician_assignments.length > 0) {
          await supabase.from("schedule_musicians").insert(
            musician_assignments.map(ma => ({
              schedule_id: id,
              member_id: ma.member_id,
              instrument: ma.instrument
            }))
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast({ title: "Escala atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar escala", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorshipSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("worship_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worship-schedules"] });
      toast({ title: "Escala removida com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover escala", description: error.message, variant: "destructive" });
    },
  });
}

// Photo upload helper
export async function uploadMemberPhoto(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function useUserWorshipSkills(userId?: string) {
  const { data: members = [] } = useWorshipMembers();

  if (!userId) return { skills: [], isMusician: false, isTech: false, isMinister: false, isVocal: false };

  const member = members.find(m => m.user_id === userId);
  if (!member) return { skills: [], isMusician: false, isTech: false, isMinister: false, isVocal: false };

  const skills = [
    member.primary_function?.name.toLowerCase(),
    ...(member.secondary_functions?.map(sf => sf.function?.name.toLowerCase()) || [])
  ].filter(Boolean) as string[];

  const isMusician = skills.some(s => ["teclado", "violão", "violao", "bateria", "baixo", "guitarra"].some(instr => s.includes(instr)));
  const isVocal = skills.some(s => s.includes("vocal") || s.includes("back"));
  const isMinister = skills.some(s => s.includes("ministrante"));
  const isTech = skills.some(s =>
    s.includes("som") || s.includes("mídia") || s.includes("midia") ||
    s.includes("transmissão") || s.includes("transmissao") ||
    s.includes("projeção") || s.includes("projecao") ||
    s.includes("câmera") || s.includes("camera") ||
    s.includes("técnico") || s.includes("tecnico")
  );

  return {
    skills,
    isMusician,
    isTech,
    isMinister,
    isVocal,
    hasLouvorAccess: isMusician || isVocal || isMinister,
    hasTechAccess: isTech
  };
}
