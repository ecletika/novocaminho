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
    member_functions: Record<string, unknown>[];
    worship_songs: Record<string, unknown>[];
    worship_schedules: Record<string, unknown>[];
    worship_ministers: Record<string, unknown>[];
    song_minister_assignments: Record<string, unknown>[];
    schedule_vocalists: Record<string, unknown>[];
    schedule_musicians: Record<string, unknown>[];
    general_schedules: Record<string, unknown>[];
    schedule_team_members: Record<string, unknown>[];
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
  | "member_functions"
  | "worship_songs"
  | "worship_schedules"
  | "worship_ministers"
  | "song_minister_assignments"
  | "schedule_vocalists"
  | "schedule_musicians"
  | "general_schedules"
  | "schedule_team_members";

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
      { data: member_functions },
      { data: worship_songs },
      { data: worship_schedules },
      { data: worship_ministers },
      { data: song_minister_assignments },
      { data: schedule_vocalists },
      { data: schedule_musicians },
      { data: general_schedules },
      { data: schedule_team_members },
    ] = await Promise.all([
      supabase.from("ministries").select("*"),
      supabase.from("ministry_posts").select("*"),
      supabase.from("birthdays").select("*"),
      supabase.from("birthday_ministries").select("*"),
      supabase.from("inventory_items").select("*"),
      supabase.from("worship_members").select("*"),
      supabase.from("worship_functions").select("*"),
      supabase.from("member_functions").select("*"),
      supabase.from("worship_songs").select("*"),
      supabase.from("worship_schedules").select("*"),
      supabase.from("worship_ministers").select("*"),
      supabase.from("song_minister_assignments").select("*"),
      supabase.from("schedule_vocalists").select("*"),
      supabase.from("schedule_musicians").select("*"),
      supabase.from("general_schedules").select("*"),
      supabase.from("schedule_team_members").select("*"),
    ]);

    const backup: BackupData = {
      version: "1.1",
      created_at: new Date().toISOString(),
      data: {
        ministries: (ministries || []) as Record<string, unknown>[],
        ministry_posts: (ministry_posts || []) as Record<string, unknown>[],
        birthdays: (birthdays || []) as Record<string, unknown>[],
        birthday_ministries: (birthday_ministries || []) as Record<string, unknown>[],
        inventory_items: (inventory_items || []) as Record<string, unknown>[],
        worship_members: (worship_members || []) as Record<string, unknown>[],
        worship_functions: (worship_functions || []) as Record<string, unknown>[],
        member_functions: (member_functions || []) as Record<string, unknown>[],
        worship_songs: (worship_songs || []) as Record<string, unknown>[],
        worship_schedules: (worship_schedules || []) as Record<string, unknown>[],
        worship_ministers: (worship_ministers || []) as Record<string, unknown>[],
        song_minister_assignments: (song_minister_assignments || []) as Record<string, unknown>[],
        schedule_vocalists: (schedule_vocalists || []) as Record<string, unknown>[],
        schedule_musicians: (schedule_musicians || []) as Record<string, unknown>[],
        general_schedules: (general_schedules || []) as Record<string, unknown>[],
        schedule_team_members: (schedule_team_members || []) as Record<string, unknown>[],
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
    // Delete in order that respects foreign keys (junction tables first)
    const deleteOrder: TableName[] = [
      "schedule_team_members",
      "schedule_musicians",
      "schedule_vocalists",
      "song_minister_assignments",
      "member_functions",
      "birthday_ministries",
      "ministry_posts",
      "worship_schedules",
      "general_schedules",
      "worship_songs",
      "worship_members",
      "worship_functions",
      "worship_ministers",
      "birthdays",
      "inventory_items",
      "ministries",
    ];

    // Delete in reverse order to handle foreign keys
    for (const table of deleteOrder) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        console.error(`Error deleting ${table}:`, error);
      }
    }

    // Insert data in correct order (parent tables first)
    const insertOrder: { table: TableName; data: Record<string, unknown>[] | undefined }[] = [
      { table: "ministries", data: backup.data.ministries },
      { table: "worship_functions", data: backup.data.worship_functions },
      { table: "worship_ministers", data: backup.data.worship_ministers },
      { table: "worship_members", data: backup.data.worship_members },
      { table: "member_functions", data: backup.data.member_functions },
      { table: "worship_songs", data: backup.data.worship_songs },
      { table: "worship_schedules", data: backup.data.worship_schedules },
      { table: "schedule_vocalists", data: backup.data.schedule_vocalists },
      { table: "schedule_musicians", data: backup.data.schedule_musicians },
      { table: "song_minister_assignments", data: backup.data.song_minister_assignments },
      { table: "general_schedules", data: backup.data.general_schedules },
      { table: "schedule_team_members", data: backup.data.schedule_team_members },
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
