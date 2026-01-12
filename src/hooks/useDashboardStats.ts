import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  inventoryCount: number;
  songsCount: number;
  membersCount: number;
  schedulesThisMonth: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get inventory count
      const { count: inventoryCount } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true });
      
      // Get songs count
      const { count: songsCount } = await supabase
        .from("worship_songs")
        .select("*", { count: "exact", head: true });
      
      // Get active members count
      const { count: membersCount } = await supabase
        .from("worship_members")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      
      // Get schedules this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      
      const { count: worshipSchedules } = await supabase
        .from("worship_schedules")
        .select("*", { count: "exact", head: true })
        .gte("date", startOfMonth.toISOString().split('T')[0])
        .lt("date", endOfMonth.toISOString().split('T')[0]);
      
      const { count: generalSchedules } = await supabase
        .from("general_schedules")
        .select("*", { count: "exact", head: true })
        .gte("date", startOfMonth.toISOString().split('T')[0])
        .lt("date", endOfMonth.toISOString().split('T')[0]);
      
      return {
        inventoryCount: inventoryCount || 0,
        songsCount: songsCount || 0,
        membersCount: membersCount || 0,
        schedulesThisMonth: (worshipSchedules || 0) + (generalSchedules || 0)
      } as DashboardStats;
    },
  });
}

export function useNextSchedule() {
  return useQuery({
    queryKey: ["next-schedule"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("general_schedules")
        .select(`
          *,
          team_members:schedule_team_members(
            *,
            member:worship_members(name)
          )
        `)
        .gte("date", today)
        .order("date")
        .limit(1)
        .maybeSingle();
      
      // If no schedule found, return null (not an error)
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}
