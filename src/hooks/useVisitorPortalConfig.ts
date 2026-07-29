import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CONFIG_KEY = "visitor_portal_config";

export interface VisitorPortalConfig {
  title: string;
  subtitle: string;
  accent_color: string;
  logo_url: string;
  button_label: string;
  success_message: string;
  show_daily_public: boolean;
}

export const DEFAULT_PORTAL_CONFIG: VisitorPortalConfig = {
  title: "Seja bem-vindo!",
  subtitle:
    "Ficamos muito felizes com a sua visita. Preencha os seus dados para mantermos contacto.",
  accent_color: "#2563eb",
  logo_url: "",
  button_label: "Concluir Registo",
  success_message: "Obrigado pela sua visita! Que Deus abençoe a sua vida.",
  show_daily_public: true,
};

function parseConfig(raw: string | null): VisitorPortalConfig {
  if (!raw) return DEFAULT_PORTAL_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PORTAL_CONFIG,
      ...parsed,
      // show_daily_public pode vir como string "true"/"false"
      show_daily_public:
        typeof parsed.show_daily_public === "string"
          ? parsed.show_daily_public === "true"
          : parsed.show_daily_public ?? DEFAULT_PORTAL_CONFIG.show_daily_public,
    };
  } catch {
    return DEFAULT_PORTAL_CONFIG;
  }
}

export function useVisitorPortalConfig() {
  return useQuery({
    queryKey: ["site-config", CONFIG_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", CONFIG_KEY)
        .maybeSingle();
      if (error) throw error;
      return parseConfig(data?.value ?? null);
    },
  });
}

export function useUpdateVisitorPortalConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: VisitorPortalConfig) => {
      const { error } = await supabase.from("site_config").upsert(
        {
          key: CONFIG_KEY,
          value: JSON.stringify(config),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-config", CONFIG_KEY] });
    },
  });
}
