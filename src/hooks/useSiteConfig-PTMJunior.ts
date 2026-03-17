import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteConfig(key: string) {
  return useQuery({
    queryKey: ["site-config", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data?.value || null;
    },
  });
}

export function useUpdateSiteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_config")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: ["site-config", key] });
    },
  });
}
