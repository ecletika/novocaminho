import { useState, useEffect, CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, Trash2, Plus, History, LayoutDashboard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
    bg: "#0F0E0C",
    card: "#1A1812",
    border: "#2a2518",
    text: "#E8E0D0",
    soft: "#8a7a65",
    muted: "#6a5d48",
    gold: "#C9A96E",
    green: "#8BAF9A",
    orange: "#D4856A",
    blue: "#7AA3C0",
    purple: "#9B8BB4",
    red: "#c47070",
};

// ─── Categorias & Perguntas ─────────────────────────────────────────────────
const CATEGORIES = [
    {
        key: "espiritualidade",
        label: "Espiritualidade & Fé",
        icon: "✦",
        color: C.gold,
        questions: [
            "Como descreverias a tua relação com Deus hoje?",
            "Tens conseguido manter uma rotina de leitura bíblica e oração?",
            "Qual foi a última lição que Deus te ensinou através da Sua Palavra?",
            "Existe alguma área espiritual onde sentes resistência ou dificuldade?",
            "Como está a tua vida de adoração pessoal?",
        ],
    },
    {
        key: "familia",
        label: "Família & Relacionamentos",
        icon: "⌂",
        color: C.green,
        questions: [
            "Como está o \"clima\" na tua casa ultimamente?",
            "Como tens servido e liderado a tua família espiritualmente?",
            "Tens algum conflito não resolvido com alguém da tua família ou da igreja?",
            "Como são as tuas amizades? Tens relações que te edificam?",
            "Existe alguém com quem precisas pedir perdão ou oferecer reconciliação?",
        ],
    },
    {
        key: "carater",
        label: "Caráter & Integridade",
        icon: "◈",
        color: C.purple,
        questions: [
            "Há alguma área da tua vida onde sentes que não és honesto ou transparente?",
            "Como tens lidado com tentações recorrentes?",
            "Tens mantido integridade no teu trabalho e finanças?",
            "Existe algum pecado não confessado que carregas?",
            "Como está a tua humildade — aceitas bem correção e conselho?",
        ],
    },
    {
        key: "proposito",
        label: "Propósito & Chamado",
        icon: "→",
        color: C.orange,
        questions: [
            "Tens sentido clareza sobre o teu chamado e propósito?",
            "Quais dons estás a desenvolver para servir à igreja?",
            "Existe algo que sentes que Deus te está chamando a fazer mas tens adiado?",
            "Como tens evangelizado ou discipulado alguém?",
            "O teu trabalho/ministério está alinhado com os teus valores?",
        ],
    },
    {
        key: "emocional",
        label: "Saúde Emocional",
        icon: "◯",
        color: C.blue,
        questions: [
            "Como tens estado emocionalmente neste período?",
            "Existe algum medo, ansiedade ou preocupação que domina os teus pensamentos?",
            "Como lidas com fracasso e decepção?",
            "Tens espaço de descanso e cuidado pessoal na tua rotina?",
            "Há algo do passado que ainda te pesa ou limita?",
        ],
    },
];

const RATING_LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Muito bem"];

// ─── Types ─────────────────────────────────────────────────────────────────
interface Session {
    id: string;
    person_name: string;
    person_id: string | null;
    session_date: string;
    notes: string | null;
    answers: any;
    ratings: any;
    created_at: string;
    created_by: string;
}

interface PersonOption {
    id: string;
    name: string;
    email?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function scoreColor(s: number) {
    if (s >= 4) return C.green;
    if (s >= 3) return C.gold;
    if (s >= 2) return C.orange;
    return C.red;
}

function avgScore(ratings: any) {
    if (!ratings || typeof ratings !== 'object') return 0;
    const vals = Object.values(ratings).map(v => Number(v)).filter((v) => v > 0);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-PT", {
        day: "2-digit", month: "long", year: "numeric",
    });
}

// ─── Shared UI Styles ─────────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: C.text,
        padding: "0 0 60px",
    } as CSSProperties,
    header: {
        borderBottom: `1px solid ${C.border}`,
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky" as const,
        top: 0,
        background: C.bg + "EE",
        backdropFilter: "blur(10px)",
        zIndex: 10,
    } as CSSProperties,
    container: {
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 24px",
    } as CSSProperties,
    card: {
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "24px",
        marginBottom: 16,
    } as CSSProperties,
    input: {
        width: "100%",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        color: C.text,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 15,
        padding: "12px 16px",
        boxSizing: "border-box",
        outline: "none",
        marginTop: 6,
    } as CSSProperties,
    textarea: {
        width: "100%",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        color: C.text,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 15,
        padding: "12px 16px",
        boxSizing: "border-box",
        resize: "vertical",
        minHeight: 80,
        outline: "none",
        marginTop: 6,
    } as CSSProperties,
    btnPrimary: {
        background: C.gold,
        color: C.bg,
        border: "none",
        borderRadius: 12,
        width: "100%",
        padding: "14px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 14,
        fontWeight: "bold",
        letterSpacing: "1px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "transform .2s",
    } as CSSProperties,
    btnGhost: {
        background: "transparent",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        color: C.gold,
        padding: "10px 16px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 13,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
    } as CSSProperties,
    btnDanger: {
        background: "transparent",
        border: `1px solid #3a2020`,
        borderRadius: 12,
        color: C.red,
        padding: "12px 20px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 14,
        cursor: "pointer",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    } as CSSProperties,
    label: {
        fontSize: 11,
        color: C.soft,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        display: "block",
        marginBottom: 4,
    } as CSSProperties,
};

// ─── Score Badge ───────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
    const col = scoreColor(score);
    return (
        <span style={{
            background: col + "22",
            color: col,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: "bold",
            minWidth: 32,
            textAlign: "center",
            display: "inline-block",
            border: `1px solid ${col}44`,
        }}>
            {score > 0 ? score + "/5" : "—"}
        </span>
    );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
    return (
        <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden", flexGrow: 1 }}>
            <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "width .6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>
    );
}

// ─── Session Card ──────────────────────────────────────────────────────────
function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
    const score = avgScore(session.ratings);
    const initials = session.person_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div
            onClick={onClick}
            style={{ ...styles.card, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all .3s" }}
            className="session-card"
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: "50%", background: C.gold + "15",
                border: `1px solid ${C.gold}33`, display: "flex", alignItems: "center",
                justifyContent: "center", color: C.gold, fontWeight: "bold", fontSize: 13, flexShrink: 0,
            }}>
                {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.person_name}
                </div>
                <div style={{ fontSize: 11, color: C.soft }}>{formatDate(session.session_date)}</div>
            </div>
            <ScoreBadge score={score} />
        </div>
    );
}

// ─── Views ─────────────────────────────────────────────────────────────────

function HomeView({
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
                    <SessionCard key={session.id} session={session} onClick={() => onDetail(session)} />
                ))
            )}
        </div>
    );
}

function NewSessionView({ onSave, onCancel, persons, isSaving }: { onSave: (data: any) => void; onCancel: () => void; persons: PersonOption[]; isSaving: boolean }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);
    const [personName, setPersonName] = useState("");
    const [personId, setPersonId] = useState<string | null>(null);
    const [personDate, setPersonDate] = useState(new Date().toISOString().split("T")[0]);
    const [personNotes, setPersonNotes] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});

    const TOTAL_STEPS = CATEGORIES.length + 2;

    const goTo = (next: number) => {
        setVisible(false);
        setTimeout(() => {
            setStep(next);
            setVisible(true);
        }, 200);
    };

    const currentCat = step >= 1 && step <= CATEGORIES.length ? CATEGORIES[step - 1] : null;
    const isSummary = step === CATEGORIES.length + 1;

    const handleSave = () => {
        onSave({
            person_name: personName,
            person_id: personId,
            session_date: personDate,
            notes: personNotes,
            answers,
            ratings,
        });
    };

    return (
        <div style={styles.container}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ height: 2, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(step / (TOTAL_STEPS - 1)) * 100}%`, background: C.gold, transition: "width .4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: C.soft, textTransform: "uppercase" }}>Passo {step + 1} de {TOTAL_STEPS}</span>
                    <button style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer" }} onClick={onCancel}>Sair</button>
                </div>
            </div>

            <div style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}>
                {step === 0 && (
                    <div style={styles.card}>
                        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8, color: C.gold }}>✦ Iniciar Acompanhamento</div>
                        <div style={{ color: C.soft, fontSize: 13, marginBottom: 24 }}>Identificação da pessoa e data da sessão</div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={styles.label}>Pessoa da Base de Dados</label>
                            <select
                                style={{ ...styles.input, cursor: "pointer" }}
                                onChange={(e) => {
                                    const p = persons.find((x) => x.id === e.target.value);
                                    if (p) {
                                        setPersonName(p.name);
                                        setPersonId(p.id);
                                    } else {
                                        setPersonName("");
                                        setPersonId(null);
                                    }
                                }}
                            >
                                <option value="">— Escrever nome manualmente —</option>
                                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={styles.label}>Nome Completo *</label>
                            <input style={styles.input} value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Nome do discípulo" />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={styles.label}>Data</label>
                            <input type="date" style={styles.input} value={personDate} onChange={(e) => setPersonDate(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={styles.label}>Observações Iniciais</label>
                            <textarea style={styles.textarea} value={personNotes} onChange={(e) => setPersonNotes(e.target.value)} placeholder="Contexto da sessão..." />
                        </div>

                        <button style={{ ...styles.btnPrimary, opacity: personName.trim() ? 1 : 0.5 }} disabled={!personName.trim()} onClick={() => goTo(1)}>
                            CONTINUAR →
                        </button>
                    </div>
                )}

                {currentCat && (
                    <div>
                        <div style={{ ...styles.card, borderColor: currentCat.color + "33", position: "relative" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                                <span style={{ fontSize: 28, color: currentCat.color }}>{currentCat.icon}</span>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: "bold", color: currentCat.color }}>{currentCat.label}</div>
                                    <div style={{ fontSize: 11, color: C.soft }}>{personName}</div>
                                </div>
                            </div>

                            <label style={styles.label}>Avaliação Geral desta Área</label>
                            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                                {[1, 2, 3, 4, 5].map((val) => {
                                    const selected = ratings[currentCat.key] === val;
                                    return (
                                        <button
                                            key={val}
                                            onClick={() => setRatings(prev => ({ ...prev, [currentCat.key]: val }))}
                                            style={{
                                                flex: 1, padding: "12px 0", borderRadius: 8, fontSize: 16, cursor: "pointer", transition: "all .2s",
                                                background: selected ? currentCat.color : "transparent",
                                                border: `1px solid ${selected ? currentCat.color : C.border}`,
                                                color: selected ? C.bg : C.soft,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {currentCat.questions.map((q, i) => (
                            <div key={i} style={styles.card}>
                                <div style={{ fontSize: 13, color: C.soft, marginBottom: 12, fontStyle: "italic", lineHeight: 1.5 }}>{q}</div>
                                <textarea
                                    style={{ ...styles.textarea, marginTop: 0, minHeight: 60 }}
                                    value={answers[`${currentCat.key}-${i}`] || ""}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentCat.key}-${i}`]: e.target.value }))}
                                    placeholder="Anotações da resposta..."
                                />
                            </div>
                        ))}

                        <div style={{ display: "flex", gap: 12 }}>
                            <button style={{ ...styles.btnGhost, flex: 1 }} onClick={() => goTo(step - 1)}>Anterior</button>
                            <button style={{ ...styles.btnPrimary, flex: 2 }} onClick={() => goTo(step + 1)}>Próximo →</button>
                        </div>
                    </div>
                )}

                {isSummary && (
                    <div style={styles.card}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={styles.label}>Resumo Final</div>
                            <div style={{ fontSize: 64, fontWeight: "bold", color: scoreColor(avgScore(ratings)), margin: "16px 0" }}>{avgScore(ratings)}</div>
                            <div style={{ fontSize: 18, fontWeight: "bold" }}>{personName}</div>
                            <div style={{ fontSize: 12, color: C.soft }}>{formatDate(personDate)}</div>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            {CATEGORIES.map(cat => (
                                <div key={cat.key} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: cat.color }}>{cat.icon} {cat.label}</span>
                                        <span style={{ fontWeight: "bold" }}>{ratings[cat.key] || 0}/5</span>
                                    </div>
                                    <ProgressBar value={ratings[cat.key] || 0} color={cat.color} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <button style={{ ...styles.btnGhost, flex: 1 }} onClick={() => goTo(step - 1)}>Anterior</button>
                            <button style={{ ...styles.btnPrimary, flex: 2 }} onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : "GUARDAR NA BASE DE DADOS ✦"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DiscipuladoPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [view, setView] = useState<"home" | "new" | "history" | "detail">("home");
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(() => !sessionStorage.getItem("discipulado_unlocked"));
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

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
                .select("id, woman_name, man_name, person_id:id")
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

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setTimeout(() => {
            if (password === dbPassword) {
                sessionStorage.setItem("discipulado_unlocked", "true");
                setIsLocked(false);
                toast.success("Acesso autorizado.");
            } else {
                toast.error("Chave de acesso incorreta.");
            }
            setIsVerifying(false);
        }, 600);
    };

    if (isLocked) {
        return (
            <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ ...styles.card, maxWidth: 360, width: "100%", textAlign: "center", padding: "48px 32px" }}>
                    <div style={{ fontSize: 40, marginBottom: 24, color: C.gold }}>✦</div>
                    <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Área Confidencial</h2>
                    <p style={{ fontSize: 13, color: C.soft, marginBottom: 32, lineHeight: 1.6 }}>
                        Este módulo contém informações sensíveis. Por favor, introduza a chave de acesso.
                    </p>
                    <form onSubmit={handleUnlock} style={{ textAlign: "left" }}>
                        <label style={styles.label}>Chave de Acesso</label>
                        <input
                            type="password"
                            autoFocus
                            style={{ ...styles.input, textAlign: "center", fontSize: 20, letterSpacing: 8 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                        />
                        <button
                            type="submit"
                            style={{ ...styles.btnPrimary, marginTop: 24, height: 48 }}
                            disabled={isVerifying || !password}
                        >
                            {isVerifying ? <Loader2 className="animate-spin" size={18} /> : "ENTRAR"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loadingSessions) {
        return (
            <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
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

            {view === "home" && <HomeView sessions={sessions} onNew={() => setView("new")} onViewAll={() => setView("history")} onDetail={s => { setSelectedSessionId(s.id); setView("detail"); }} />}
            {view === "new" && <NewSessionView persons={persons} onSave={data => createMutation.mutate(data)} onCancel={() => setView("home")} isSaving={createMutation.isPending} />}
            {view === "history" && (
                <div style={styles.container}>
                    <div style={{ marginBottom: 20, fontSize: 12, color: C.soft, textTransform: "uppercase" }}>Todas as Sessões ({sessions.length})</div>
                    {sessions.map(s => <SessionCard key={s.id} session={s} onClick={() => { setSelectedSessionId(s.id); setView("detail"); }} />)}
                </div>
            )}
            {view === "detail" && selectedSession && (
                <div style={styles.container}>
                    <button style={{ ...styles.btnGhost, marginBottom: 24 }} onClick={() => setView("home")}><ArrowLeft size={16} /> Voltar</button>

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

                    <button style={styles.btnDanger} onClick={() => { if (confirm("Deseja eliminar permanentemente esta sessão?")) deleteMutation.mutate(selectedSession.id); }}>
                        <Trash2 size={16} /> ELIMINAR REGISTO
                    </button>
                </div>
            )}
        </div>
    );
}
