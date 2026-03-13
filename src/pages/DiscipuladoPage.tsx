import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, History, LayoutDashboard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Internal Imports
import { C, Session, styles } from "./discipulado/constants/discipuladoData";
import { DiscipuladoHome } from "./discipulado/components/DiscipuladoHome";
import { DiscipuladoNewSession } from "./discipulado/components/DiscipuladoNewSession";
import { DiscipuladoHistory } from "./discipulado/components/DiscipuladoHistory";
import { DiscipuladoDetail } from "./discipulado/components/DiscipuladoDetail";
import { DiscipuladoUnlock } from "./discipulado/components/DiscipuladoUnlock";
import { PersonOption } from "./discipulado/constants/discipuladoData";

export default function DiscipuladoPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [view, setView] = useState<"home" | "new" | "history" | "detail">("home");
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(() => !sessionStorage.getItem("discipulado_unlocked"));

    // Queries
    const { data: dbPassword } = useQuery({
        queryKey: ["discipulado-config-pass"],
        queryFn: async () => {
            const { data } = await supabase.from("site_config").select("value").eq("key", "discipulado_password").maybeSingle();
            return data?.value || "discipulado2024"; // Senha padrão se não configurada
        },
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery({
        queryKey: ["discipleship-sessions"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("discipleship_sessions")
                .select("*")
                .order("session_date", { ascending: false });
            if (error) throw error;
            return data as Session[];
        },
        enabled: !!user && !isLocked,
    });

    const { data: persons = [] } = useQuery({
        queryKey: ["discipleship-persons"],
        queryFn: async () => {
            const { data: birthdays, error } = await supabase
                .from("birthdays")
                .select("id, woman_name, man_name")
                .order("woman_name", { ascending: true });

            if (error) throw error;

            const list: PersonOption[] = [];
            (birthdays || []).forEach(b => {
                if (b.woman_name) list.push({ id: b.id, name: b.woman_name });
                if (b.man_name) list.push({ id: b.id, name: b.man_name });
            });

            return list.sort((a, b) => a.name.localeCompare(b.name));
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newData: any) => {
            const { error } = await (supabase as any).from("discipleship_sessions").insert([{ ...newData, created_by: user?.id }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discipleship-sessions"] });
            toast.success("Sessão guardada com sucesso!");
            setView("home");
        },
        onError: () => toast.error("Erro ao guardar sessão."),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from("discipleship_sessions").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discipleship-sessions"] });
            toast.success("Sessão eliminada.");
            setView("home");
        },
    });

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    if (isLocked) {
        return <DiscipuladoUnlock dbPassword={dbPassword} onUnlock={() => setIsLocked(false)} />;
    }

    if (loadingSessions) {
        return (
            <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 className="animate-spin text-gold" size={32} style={{ color: C.gold }} />
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: C.gold, fontSize: 24 }}>✦</span>
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: 18, letterSpacing: "-0.02em" }}>Discipulado</div>
                        <div style={{ fontSize: 10, color: C.soft, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nuvem Segura</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {view === "home" ? (
                        <button style={styles.btnGhost} onClick={() => setView("history")}><History size={16} /> Histórico</button>
                    ) : (
                        <button style={styles.btnGhost} onClick={() => setView("home")}><LayoutDashboard size={16} /> Painel</button>
                    )}
                </div>
            </div>

            {view === "home" && (
                <DiscipuladoHome 
                    sessions={sessions} 
                    onNew={() => setView("new")} 
                    onViewAll={() => setView("history")} 
                    onDetail={s => { setSelectedSessionId(s.id); setView("detail"); }} 
                />
            )}
            {view === "new" && (
                <DiscipuladoNewSession 
                    persons={persons} 
                    onSave={data => createMutation.mutate(data)} 
                    onCancel={() => setView("home")} 
                    isSaving={createMutation.isPending} 
                />
            )}
            {view === "history" && (
                <DiscipuladoHistory 
                    sessions={sessions} 
                    onDetail={s => { setSelectedSessionId(s.id); setView("detail"); }} 
                />
            )}
            {view === "detail" && selectedSession && (
                <DiscipuladoDetail 
                    selectedSession={selectedSession} 
                    onBack={() => setView("home")} 
                    onDelete={id => deleteMutation.mutate(id)} 
                />
            )}
        </div>
    );
}
