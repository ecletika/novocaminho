import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorshipMember } from "./useWorship";

export interface ScheduleTeamMember {
  id: string;
  schedule_id: string;
  member_id: string;
  role: "ministrante" | "louvor" | "musicos" | "som" | "midia";
  instrument: string | null;
  member?: WorshipMember;
}

export interface GeneralSchedule {
  id: string;
  date: string;
  type: string;
  created_at: string;
  updated_at: string;
  team_members?: ScheduleTeamMember[];
}

export function useGeneralSchedules() {
  return useQuery({
    queryKey: ["general-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("general_schedules")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      
      // Fetch team members
      const scheduleIds = data.map(s => s.id);
      const { data: teamMembers } = await supabase
        .from("schedule_team_members")
        .select(`
          *,
          member:worship_members(*, primary_function:worship_functions(*))
        `)
        .in("schedule_id", scheduleIds);
      
      return data.map(schedule => ({
        ...schedule,
        team_members: teamMembers?.filter(tm => tm.schedule_id === schedule.id) || []
      })) as GeneralSchedule[];
    },
  });
}

export function useCreateGeneralSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: { 
      date: string; 
      type: string;
      team_assignments: { member_id: string; role: string; instrument?: string }[];
    }) => {
      const { team_assignments, ...scheduleData } = schedule;
      
      const { data, error } = await supabase
        .from("general_schedules")
        .insert(scheduleData)
        .select()
        .single();
      if (error) throw error;
      
      // Add team members
      if (team_assignments.length > 0) {
        const { error: teamError } = await supabase
          .from("schedule_team_members")
          .insert(team_assignments.map(ta => ({
            schedule_id: data.id,
            member_id: ta.member_id,
            role: ta.role,
            instrument: ta.instrument || null
          })));
        if (teamError) throw teamError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-schedules"] });
      toast({ title: "Escala criada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar escala", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateGeneralSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      team_assignments,
      ...updates 
    }: { 
      id: string; 
      date?: string;
      type?: string;
      team_assignments?: { member_id: string; role: string; instrument?: string }[];
    }) => {
      const { data, error } = await supabase
        .from("general_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      // Update team members if provided
      if (team_assignments !== undefined) {
        // Delete existing
        await supabase.from("schedule_team_members").delete().eq("schedule_id", id);
        
        // Add new
        if (team_assignments.length > 0) {
          const { error: teamError } = await supabase
            .from("schedule_team_members")
            .insert(team_assignments.map(ta => ({
              schedule_id: id,
              member_id: ta.member_id,
              role: ta.role,
              instrument: ta.instrument || null
            })));
          if (teamError) throw teamError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-schedules"] });
      toast({ title: "Escala atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar escala", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteGeneralSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("general_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-schedules"] });
      toast({ title: "Escala removida com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover escala", description: error.message, variant: "destructive" });
    },
  });
}
