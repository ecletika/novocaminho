import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackupData {
  version: string;
  created_at: string;
  data: {
    ministries: Record<string, unknown>[];
    ministry_posts: Record<string, unknown>[];
    birthdays: Record<string, unknown>[];
    birthday_ministries: Record<string, unknown>[];
    inventory_items: Record<string, unknown>[];
    worship_members: Record<string, unknown>[];
    worship_functions: Record<string, unknown>[];
    worship_songs: Record<string, unknown>[];
    worship_schedules: Record<string, unknown>[];
    worship_ministers: Record<string, unknown>[];
    general_schedules: Record<string, unknown>[];
  };
}

type TableName = 
  | "ministries"
  | "ministry_posts"
  | "birthdays"
  | "birthday_ministries"
  | "inventory_items"
  | "worship_members"
  | "worship_functions"
  | "worship_songs"
  | "worship_schedules"
  | "worship_ministers"
  | "general_schedules";

export async function exportBackup(): Promise<void> {
  try {
    // Fetch all data
    const [
      { data: ministries },
      { data: ministry_posts },
      { data: birthdays },
      { data: birthday_ministries },
      { data: inventory_items },
      { data: worship_members },
      { data: worship_functions },
      { data: worship_songs },
      { data: worship_schedules },
      { data: worship_ministers },
      { data: general_schedules },
    ] = await Promise.all([
      supabase.from("ministries").select("*"),
      supabase.from("ministry_posts").select("*"),
      supabase.from("birthdays").select("*"),
      supabase.from("birthday_ministries").select("*"),
      supabase.from("inventory_items").select("*"),
      supabase.from("worship_members").select("*"),
      supabase.from("worship_functions").select("*"),
      supabase.from("worship_songs").select("*"),
      supabase.from("worship_schedules").select("*"),
      supabase.from("worship_ministers").select("*"),
      supabase.from("general_schedules").select("*"),
    ]);

    const backup: BackupData = {
      version: "1.0",
      created_at: new Date().toISOString(),
      data: {
        ministries: (ministries || []) as Record<string, unknown>[],
        ministry_posts: (ministry_posts || []) as Record<string, unknown>[],
        birthdays: (birthdays || []) as Record<string, unknown>[],
        birthday_ministries: (birthday_ministries || []) as Record<string, unknown>[],
        inventory_items: (inventory_items || []) as Record<string, unknown>[],
        worship_members: (worship_members || []) as Record<string, unknown>[],
        worship_functions: (worship_functions || []) as Record<string, unknown>[],
        worship_songs: (worship_songs || []) as Record<string, unknown>[],
        worship_schedules: (worship_schedules || []) as Record<string, unknown>[],
        worship_ministers: (worship_ministers || []) as Record<string, unknown>[],
        general_schedules: (general_schedules || []) as Record<string, unknown>[],
      },
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-igreja-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Backup exportado com sucesso!");
  } catch (error) {
    console.error("Error exporting backup:", error);
    toast.error("Erro ao exportar backup");
    throw error;
  }
}

export async function importBackup(file: File): Promise<void> {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);

    // Validate backup structure
    if (!backup.version || !backup.data) {
      throw new Error("Arquivo de backup inválido");
    }

    // Clear existing data and import new data
    const tables: TableName[] = [
      "birthday_ministries",
      "ministry_posts",
      "birthdays",
      "inventory_items",
      "worship_schedules",
      "worship_songs",
      "worship_members",
      "worship_functions",
      "worship_ministers",
      "general_schedules",
      "ministries",
    ];

    // Delete in reverse order to handle foreign keys
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        console.error(`Error deleting ${table}:`, error);
      }
    }

    // Insert data in correct order
    const insertOrder: { table: TableName; data: Record<string, unknown>[] }[] = [
      { table: "ministries", data: backup.data.ministries },
      { table: "worship_functions", data: backup.data.worship_functions },
      { table: "worship_ministers", data: backup.data.worship_ministers },
      { table: "worship_members", data: backup.data.worship_members },
      { table: "worship_songs", data: backup.data.worship_songs },
      { table: "worship_schedules", data: backup.data.worship_schedules },
      { table: "general_schedules", data: backup.data.general_schedules },
      { table: "inventory_items", data: backup.data.inventory_items },
      { table: "birthdays", data: backup.data.birthdays },
      { table: "ministry_posts", data: backup.data.ministry_posts },
      { table: "birthday_ministries", data: backup.data.birthday_ministries },
    ];

    for (const { table, data } of insertOrder) {
      if (data && Array.isArray(data) && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from(table).insert(data as any);
        if (error) {
          console.error(`Error inserting ${table}:`, error);
        }
      }
    }

    toast.success("Backup restaurado com sucesso!");
  } catch (error) {
    console.error("Error importing backup:", error);
    toast.error("Erro ao restaurar backup. Verifique o arquivo.");
    throw error;
  }
}
