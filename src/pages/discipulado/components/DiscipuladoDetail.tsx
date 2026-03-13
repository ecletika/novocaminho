import { ArrowLeft, Trash2 } from "lucide-react";
import { C, CATEGORIES, Session, styles } from "../constants/discipuladoData";
import { avgScore, formatDate, ProgressBar, scoreColor } from "./DiscipuladoShared";

export function DiscipuladoDetail({ 
    selectedSession, 
    onBack, 
    onDelete 
}: { 
    selectedSession: Session; 
    onBack: () => void; 
    onDelete: (id: string) => void; 
}) {
    return (
        <div style={styles.container}>
            <button style={{ ...styles.btnGhost, marginBottom: 24 }} onClick={onBack}><ArrowLeft size={16} /> Voltar</button>

            <div style={{ ...styles.card, textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.soft, textTransform: "uppercase", marginBottom: 12 }}>Pontuação Final</div>
                <div style={{ fontSize: 72, fontWeight: "bold", color: scoreColor(avgScore(selectedSession.ratings)), lineHeight: 1 }}>{avgScore(selectedSession.ratings)}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 20 }}>{selectedSession.person_name}</div>
                <div style={{ fontSize: 12, color: C.soft }}>{formatDate(selectedSession.session_date)}</div>
                {selectedSession.notes && (
                    <div style={{ marginTop: 24, padding: "16px", background: C.bg, borderRadius: 12, fontSize: 14, color: C.soft, fontStyle: "italic", border: `1px solid ${C.border}` }}>
                        "{selectedSession.notes}"
                    </div>
                )}
            </div>

            <div style={styles.card}>
                <div style={{ fontSize: 11, color: C.soft, textTransform: "uppercase", marginBottom: 20 }}>Avaliação por Área</div>
                {CATEGORIES.map(cat => {
                    const r = selectedSession.ratings[cat.key] || 0;
                    return (
                        <div key={cat.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                                <span style={{ color: cat.color }}>{cat.icon} {cat.label}</span>
                                <span style={{ fontWeight: "bold", color: cat.color }}>{r}/5</span>
                            </div>
                            <ProgressBar value={r} color={cat.color} />
                        </div>
                    );
                })}
            </div>

            {CATEGORIES.map(cat => {
                const ans = cat.questions.map((q, i) => ({ q, a: selectedSession.answers[`${cat.key}-${i}`] })).filter(x => x.a && x.a.trim());
                if (ans.length === 0) return null;
                return (
                    <div key={cat.key} style={styles.card}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <span style={{ color: cat.color, fontSize: 18 }}>{cat.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: "bold", color: cat.color }}>{cat.label}</span>
                        </div>
                        {ans.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: 16, borderBottom: idx < ans.length - 1 ? `1px solid ${C.border}` : "none", paddingBottom: 16 }}>
                                <div style={{ fontSize: 11, color: C.soft, marginBottom: 6, fontStyle: "italic" }}>{item.q}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{item.a}</div>
                            </div>
                        ))}
                    </div>
                );
            })}

            <button style={styles.btnDanger} onClick={() => { if (confirm("Deseja eliminar permanentemente esta sessão?")) onDelete(selectedSession.id); }}>
                <Trash2 size={16} /> ELIMINAR REGISTO
            </button>
        </div>
    );
}
