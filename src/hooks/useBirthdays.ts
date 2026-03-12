import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Birthday {
  id: string;
  woman_name: string | null;
  man_name: string | null;
  photo_url: string | null;
  birthday_date: string;
  birthday_type: "personal" | "wedding";
  phone: string | null;
  email: string | null;
  address: string | null;
  leader_name: string | null;
  woman_birthday?: string | null;
  man_birthday?: string | null;
  woman_phone?: string | null;
  man_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BirthdayWithMinistries extends Birthday {
  ministries: { ministry_id: string; is_leader: boolean }[];
}

export interface BirthdayInsert {
  woman_name?: string | null;
  man_name?: string | null;
  photo_url?: string | null;
  birthday_date: string;
  birthday_type: "personal" | "wedding";
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  leader_name?: string | null;
  woman_birthday?: string | null;
  man_birthday?: string | null;
  woman_phone?: string | null;
  man_phone?: string | null;
  ministry_selections?: { ministry_id: string; is_leader: boolean; leader_id?: string | null }[];
}

// Fetch all birthdays
export function useBirthdays() {
  return useQuery({
    queryKey: ["birthdays"],
    queryFn: async () => {
      // 1. Fetch birthdays
      const { data: bData, error: bError } = await supabase
        .from("birthdays")
        .select("*")
        .order("birthday_date", { ascending: true })
        .limit(5000); // Garante que buscamos todos mesmo se houver > 1000

      if (bError) throw bError;

      // 2. Fetch ministries mapping
      const { data: mData, error: mError } = await supabase
        .from("birthday_ministries")
        .select("birthday_id, ministry_id, is_leader")
        .limit(10000); // Garante o mapeamento de todos os integrantes

      // Se a tabela der erro (e.g. se não existir), não parte o site, retorna vazio
      if (mError) {
        console.error("Falha ao buscar birthday_ministries:", mError);
        return (bData as Birthday[]).map(b => ({ ...b, ministries: [] })) as BirthdayWithMinistries[];
      }

      // 3. Combine in JS
      const ministriesMap = mData.reduce((acc, curr) => {
        if (!acc[curr.birthday_id]) acc[curr.birthday_id] = [];
        acc[curr.birthday_id].push({
          ministry_id: curr.ministry_id,
          is_leader: curr.is_leader ?? false,
        });
        return acc;
      }, {} as Record<string, { ministry_id: string; is_leader: boolean }[]>);

      return (bData as Birthday[]).map(b => ({
        ...b,
        ministries: ministriesMap[b.id] || []
      })) as BirthdayWithMinistries[];
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
        .limit(2000);

      if (error) throw error;

      const allMonthly: (Birthday & { displayDate: string; displayName: string; iconType: 'cake' | 'heart' })[] = [];

      data?.forEach((b) => {
        const getMonth = (dateStr: string | null) => {
          if (!dateStr) return null;
          return parseInt(dateStr.split('-')[1], 10);
        };

        // 1. Check main date (Birthday or Wedding Anniversary)
        if (getMonth(b.birthday_date) === currentMonth) {
          const isWedding = b.birthday_type === 'wedding';
          allMonthly.push({
            ...(b as Birthday),
            displayDate: b.birthday_date,
            displayName: isWedding ? `${b.man_name || ''} & ${b.woman_name || ''}` : (b.woman_name || b.man_name || ''),
            iconType: isWedding ? 'heart' : 'cake'
          });
        }

        // 2. For wedding records, also check individual birthdays
        if (b.birthday_type === 'wedding') {
          if (b.man_birthday && getMonth(b.man_birthday) === currentMonth) {
            allMonthly.push({
              ...(b as Birthday),
              displayDate: b.man_birthday,
              displayName: `${b.man_name || ''} (Aniversário)`,
              iconType: 'cake'
            });
          }
          if (b.woman_birthday && getMonth(b.woman_birthday) === currentMonth) {
            allMonthly.push({
              ...(b as Birthday),
              displayDate: b.woman_birthday,
              displayName: `${b.woman_name || ''} (Aniversário)`,
              iconType: 'cake'
            });
          }
        }
      });

      // Sort by day
      return allMonthly.sort((a, b) => {
        const dayA = parseInt(a.displayDate.split('-')[2], 10);
        const dayB = parseInt(b.displayDate.split('-')[2], 10);
        return dayA - dayB;
      });
    },
  });
}

// Fetch birthdays by ministry
export function useBirthdaysByMinistry(ministryId: string | undefined) {
  return useQuery({
    queryKey: ["birthdays", "ministry", ministryId],
    queryFn: async () => {
      if (!ministryId) return [];

      const { data: mData, error: mError } = await supabase
        .from("birthday_ministries")
        .select("birthday_id, is_leader")
        .eq("ministry_id", ministryId);

      if (mError) {
        console.warn("Erro ao buscar birthday_ministries", mError);
        return [];
      }

      if (!mData || mData.length === 0) return [];

      const birthdayIds = mData.map(m => m.birthday_id);

      const { data: bData, error: bError } = await supabase
        .from("birthdays")
        .select("*")
        .in("id", birthdayIds);

      if (bError) {
        console.warn("Erro ao buscar birthdays_ids", bError);
        return [];
      }

      // Combine them
      const members = bData.map(birthday => {
        const ministryRel = mData.find(m => m.birthday_id === birthday.id);
        return {
          ...birthday,
          is_leader: ministryRel?.is_leader ?? false
        };
      });

      return members as (Birthday & { is_leader: boolean })[];
    },
    enabled: !!ministryId,
  });
}

// Create birthday
export function useCreateBirthday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BirthdayInsert) => {
      const { ministry_selections, ...birthdayData } = data;

      // Create birthday
      const { data: birthday, error } = await supabase
        .from("birthdays")
        .insert(birthdayData)
        .select()
        .single();

      if (error) throw error;

      // Add ministry relationships
      if (ministry_selections && ministry_selections.length > 0) {
        const relationships = ministry_selections.map((sel) => ({
          birthday_id: birthday.id,
          ministry_id: sel.ministry_id,
          is_leader: sel.is_leader,
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
      const { ministry_selections, ...birthdayData } = data;

      // Update birthday
      const { data: birthday, error } = await supabase
        .from("birthdays")
        .update(birthdayData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update ministry relationships
      if (ministry_selections !== undefined) {
        // Remove existing relationships
        await supabase.from("birthday_ministries").delete().eq("birthday_id", id);

        // Add new relationships
        if (ministry_selections.length > 0) {
          const relationships = ministry_selections.map((sel) => ({
            birthday_id: id,
            ministry_id: sel.ministry_id,
            is_leader: sel.is_leader,
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
