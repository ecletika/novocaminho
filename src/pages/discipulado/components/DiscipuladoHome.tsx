import { Plus } from "lucide-react";
import { C, Session, styles } from "../constants/discipuladoData";
import { avgScore } from "./DiscipuladoShared";
import { DiscipuladoCard } from "./DiscipuladoCard";

export function DiscipuladoHome({
    sessions,
    onNew,
    onViewAll,
    onDetail,
}: {
    sessions: Session[];
    onNew: () => void;
    onViewAll: () => void;
    onDetail: (s: Session) => void;
}) {
    const totalPeople = new Set(sessions.map((s) => s.person_name)).size;
    const scores = sessions.map((s) => avgScore(s.ratings)).filter((v) => v > 0);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const recent = sessions.slice(0, 5);

    return (
        <div style={styles.container}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
                {[
                    { label: "Sessões", value: sessions.length },
                    { label: "Pessoas", value: totalPeople },
                    { label: "Média", value: avg > 0 ? avg + "/5" : "—" },
                ].map((stat) => (
                    <div key={stat.label} style={{ ...styles.card, textAlign: "center", marginBottom: 0, padding: "16px 8px" }}>
                        <div style={{ fontSize: 24, fontWeight: "bold", color: C.gold, marginBottom: 2 }}>{stat.value}</div>
                        <div style={{ fontSize: 10, color: C.soft, letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <button style={{ ...styles.btnPrimary, marginBottom: 32 }} onClick={onNew}>
                <Plus size={18} /> NOVA ENTREVISTA
            </button>

            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: C.soft, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Sessões Recentes
                </span>
                {sessions.length > 5 && (
                    <button style={{ ...styles.btnGhost, padding: "4px 12px", border: "none", fontSize: 11 }} onClick={onViewAll}>
                        Ver todas →
                    </button>
                )}
            </div>

            {recent.length === 0 ? (
                <div style={{ ...styles.card, textAlign: "center", padding: 60, borderStyle: "dashed" }}>
                    <div style={{ fontSize: 32, marginBottom: 16, color: C.border }}>✦</div>
                    <div style={{ color: C.soft, fontSize: 14, lineHeight: 1.6 }}>
                        Nenhuma sessão registada na base de dados.<br />
                        As tuas entrevistas aparecerão aqui.
                    </div>
                </div>
            ) : (
                recent.map((session) => (
                    <DiscipuladoCard key={session.id} session={session} onClick={() => onDetail(session)} />
                ))
            )}
        </div>
    );
}
