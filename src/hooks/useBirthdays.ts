import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Birthday {
  id: string;
  woman_name: string | null;
  man_name: string | null;
  birthday_date: string;
  birthday_type: "personal" | "wedding";
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface BirthdayWithMinistries extends Birthday {
  ministries: { ministry_id: string }[];
}

export interface BirthdayInsert {
  woman_name?: string | null;
  man_name?: string | null;
  birthday_date: string;
  birthday_type: "personal" | "wedding";
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  ministry_ids?: string[];
}

// Fetch all birthdays
export function useBirthdays() {
  return useQuery({
    queryKey: ["birthdays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("birthdays")
        .select("*, ministries:birthday_ministries(ministry_id)")
        .order("birthday_date", { ascending: true });

      if (error) throw error;
      return data as BirthdayWithMinistries[];
    },
  });
}

// Fetch birthdays for current month
export function useMonthlyBirthdays() {
  const currentMonth = new Date().getMonth() + 1;

  return useQuery({
    queryKey: ["birthdays", "monthly", currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("birthdays")
        .select("*")
        .order("birthday_date", { ascending: true });

      if (error) throw error;

      // Filter by current month
      return (data as Birthday[]).filter((b) => {
        const month = new Date(b.birthday_date + "T00:00:00").getMonth() + 1;
        return month === currentMonth;
      });
    },
  });
}

// Fetch birthdays by ministry
export function useBirthdaysByMinistry(ministryId: string | undefined) {
  const currentMonth = new Date().getMonth() + 1;

  return useQuery({
    queryKey: ["birthdays", "ministry", ministryId, currentMonth],
    queryFn: async () => {
      if (!ministryId) return [];

      const { data, error } = await supabase
        .from("birthday_ministries")
        .select("birthday_id, birthdays(*)")
        .eq("ministry_id", ministryId);

      if (error) throw error;

      // Extract birthdays and filter by current month
      const birthdays = data
        .map((item) => item.birthdays as unknown as Birthday)
        .filter((b) => {
          if (!b) return false;
          const month = new Date(b.birthday_date + "T00:00:00").getMonth() + 1;
          return month === currentMonth;
        });

      return birthdays;
    },
    enabled: !!ministryId,
  });
}

// Create birthday
export function useCreateBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BirthdayInsert) => {
      const { ministry_ids, ...birthdayData } = data;

      // Create birthday
      const { data: birthday, error } = await supabase
        .from("birthdays")
        .insert(birthdayData)
        .select()
        .single();

      if (error) throw error;

      // Add ministry relationships
      if (ministry_ids && ministry_ids.length > 0) {
        const relationships = ministry_ids.map((ministry_id) => ({
          birthday_id: birthday.id,
          ministry_id,
        }));

        const { error: relError } = await supabase
          .from("birthday_ministries")
          .insert(relationships);

        if (relError) throw relError;
      }

      return birthday;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birthdays"] });
    },
  });
}

// Update birthday
export function useUpdateBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: BirthdayInsert & { id: string }) => {
      const { ministry_ids, ...birthdayData } = data;

      // Update birthday
      const { data: birthday, error } = await supabase
        .from("birthdays")
        .update(birthdayData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update ministry relationships
      if (ministry_ids !== undefined) {
        // Remove existing relationships
        await supabase.from("birthday_ministries").delete().eq("birthday_id", id);

        // Add new relationships
        if (ministry_ids.length > 0) {
          const relationships = ministry_ids.map((ministry_id) => ({
            birthday_id: id,
            ministry_id,
          }));

          const { error: relError } = await supabase
            .from("birthday_ministries")
            .insert(relationships);

          if (relError) throw relError;
        }
      }

      return birthday;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birthdays"] });
    },
  });
}

// Delete birthday
export function useDeleteBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("birthdays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birthdays"] });
    },
  });
}
