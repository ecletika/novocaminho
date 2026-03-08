import { useState, useEffect, CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

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
const LS_KEY = "spiritual-sessions";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Session {
    id: number;
    person: { name: string; date: string; notes: string };
    answers: Record<string, string>;
    ratings: Record<string, number>;
    date: string;
    createdAt: string;
    discipledBy?: string;
}

interface PersonOption {
    id: string;
    name: string;
    email?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function loadSessions(): Session[] {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveSessions(sessions: Session[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
}

function scoreColor(s: number) {
    if (s >= 4) return C.green;
    if (s >= 3) return C.gold;
    if (s >= 2) return C.orange;
    return C.red;
}

function avgScore(ratings: Record<string, number>) {
    const vals = Object.values(ratings).filter((v) => v > 0);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-PT", {
        day: "2-digit", month: "long", year: "numeric",
    });
}

// ─── Shared UI ─────────────────────────────────────────────────────────────
const s = {
    page: {
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: C.text,
        padding: "0 0 60px",
    } as CSSProperties,
    header: {
        borderBottom: `1px solid ${C.border}`,
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
    } as CSSProperties,
    btnGhost: {
        background: "transparent",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        color: C.gold,
        padding: "12px 20px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 14,
        cursor: "pointer",
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
    } as CSSProperties,
    label: {
        fontSize: 12,
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
            background: col + "33",
            color: col,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 13,
            fontWeight: "bold",
            minWidth: 36,
            textAlign: "center",
            display: "inline-block",
        }}>
            {score > 0 ? score + "/5" : "—"}
        </span>
    );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
    return (
        <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden", flexGrow: 1 }}>
            <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "width .4s" }} />
        </div>
    );
}

// ─── Session Card ──────────────────────────────────────────────────────────
function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
    const score = avgScore(session.ratings);
    const initials = session.person.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div
            onClick={onClick}
            style={{ ...s.card, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
        >
            <div style={{
                width: 44, height: 44, borderRadius: "50%", background: C.gold + "22",
                border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center",
                justifyContent: "center", color: C.gold, fontWeight: "bold", fontSize: 15, flexShrink: 0,
            }}>
                {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.person.name}
                </div>
                <div style={{ fontSize: 12, color: C.soft }}>{formatDate(session.date)}</div>
            </div>
            <ScoreBadge score={score} />
        </div>
    );
}

// ─── Home View ─────────────────────────────────────────────────────────────
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
    const totalPeople = new Set(sessions.map((s) => s.person.name)).size;
    const scores = sessions.map((s) => avgScore(s.ratings)).filter((v) => v > 0);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const recent = sessions.slice(0, 5);

    return (
        <div style={s.container}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
                {[
                    { label: "Total de Sessões", value: sessions.length },
                    { label: "Total de Pessoas", value: totalPeople },
                    { label: "Média Geral", value: avg > 0 ? avg + "/5" : "—" },
                ].map((stat) => (
                    <div key={stat.label} style={{ ...s.card, textAlign: "center", marginBottom: 0 }}>
                        <div style={{ fontSize: 26, fontWeight: "bold", color: C.gold, marginBottom: 4 }}>{stat.value}</div>
                        <div style={{ fontSize: 11, color: C.soft, letterSpacing: "0.06em" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* New */}
            <button style={{ ...s.btnPrimary, marginBottom: 32 }} onClick={onNew}>
                ✦  NOVA ENTREVISTA
            </button>

            {/* Recent */}
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.soft, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Sessões Recentes
                </span>
                {sessions.length > 5 && (
                    <button style={{ ...s.btnGhost, padding: "6px 14px", fontSize: 12 }} onClick={onViewAll}>
                        Ver todas
                    </button>
                )}
            </div>

            {recent.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: 48 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
                    <div style={{ color: C.soft, lineHeight: 1.7 }}>
                        Nenhuma sessão registada ainda.<br />
                        Começa a tua primeira entrevista de discipulado.
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

// ─── History View ───────────────────────────────────────────────────────────
function HistoryView({ sessions, onDetail, onBack }: { sessions: Session[]; onDetail: (s: Session) => void; onBack: () => void }) {
    return (
        <div style={s.container}>
            <button style={{ ...s.btnGhost, marginBottom: 24, width: "auto" }} onClick={onBack}>← Voltar</button>
            <div style={{ fontSize: 12, color: C.soft, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
                Todas as Sessões ({sessions.length})
            </div>
            {sessions.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: 48, color: C.soft }}>Sem sessões registadas.</div>
            ) : (
                sessions.map((session) => (
                    <SessionCard key={session.id} session={session} onClick={() => onDetail(session)} />
                ))
            )}
        </div>
    );
}

// ─── Detail View ────────────────────────────────────────────────────────────
function DetailView({ session, onBack, onDelete }: { session: Session; onBack: () => void; onDelete: () => void }) {
    const score = avgScore(session.ratings);
    const col = scoreColor(score);
    const [confirm, setConfirm] = useState(false);

    return (
        <div style={s.container}>
            <button style={{ ...s.btnGhost, marginBottom: 24, width: "auto" }} onClick={onBack}>← Voltar</button>

            {/* Score Hero */}
            <div style={{ ...s.card, textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.soft, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Pontuação Geral</div>
                <div style={{ fontSize: 64, fontWeight: "bold", color: col, lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 4 }}>de 5</div>
                <div style={{ marginTop: 16, fontWeight: "bold", fontSize: 20 }}>{session.person.name}</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 4 }}>{formatDate(session.date)}</div>
                {session.person.notes && (
                    <div style={{ marginTop: 16, fontSize: 14, color: C.soft, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                        {session.person.notes}
                    </div>
                )}
            </div>

            {/* Category bars */}
            <div style={s.card}>
                <div style={{ fontSize: 12, color: C.soft, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Avaliação por Área</div>
                {CATEGORIES.map((cat) => {
                    const rating = session.ratings[cat.key] || 0;
                    return (
                        <div key={cat.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                                <span style={{ color: cat.color, width: 20, textAlign: "center" }}>{cat.icon}</span>
                                <span style={{ fontSize: 13, flex: 1 }}>{cat.label}</span>
                                <span style={{ fontSize: 13, color: cat.color, fontWeight: "bold" }}>
                                    {rating > 0 ? `${rating}/5` : "—"}
                                </span>
                            </div>
                            <div style={{ paddingLeft: 32 }}>
                                <ProgressBar value={rating} color={cat.color} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Answers */}
            {CATEGORIES.map((cat) => {
                const catAnswers = cat.questions
                    .map((q, i) => ({ q, a: session.answers[`${cat.key}-${i}`] }))
                    .filter((x) => x.a && x.a.trim());

                if (!catAnswers.length) return null;

                return (
                    <div key={cat.key} style={s.card}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <span style={{ color: cat.color, fontSize: 18 }}>{cat.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: "bold", color: cat.color }}>{cat.label}</span>
                        </div>
                        {catAnswers.map(({ q, a }, i) => (
                            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < catAnswers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                                <div style={{ fontSize: 12, color: C.soft, marginBottom: 6, fontStyle: "italic" }}>{q}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.7 }}>{a}</div>
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* Delete */}
            <div style={{ marginTop: 24 }}>
                {!confirm ? (
                    <button style={s.btnDanger} onClick={() => setConfirm(true)}>Excluir Sessão</button>
                ) : (
                    <div style={{ ...s.card, textAlign: "center" }}>
                        <div style={{ marginBottom: 16, color: C.soft }}>Tens a certeza? Esta ação não pode ser desfeita.</div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setConfirm(false)}>Cancelar</button>
                            <button style={{ ...s.btnDanger, flex: 1 }} onClick={onDelete}>Confirmar Exclusão</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── New Session View ───────────────────────────────────────────────────────
function NewSessionView({
    onSave,
    onCancel,
    persons,
}: {
    onSave: (session: Session) => void;
    onCancel: () => void;
    persons: PersonOption[];
}) {
    const TOTAL_STEPS = CATEGORIES.length + 2; // step 0 = dados, steps 1-5 = cats, step final = resumo
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    const [personName, setPersonName] = useState("");
    const [personDate, setPersonDate] = useState(new Date().toISOString().split("T")[0]);
    const [personNotes, setPersonNotes] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});

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
        const session: Session = {
            id: Date.now(),
            person: { name: personName.trim(), date: personDate, notes: personNotes.trim() },
            answers,
            ratings,
            date: personDate,
            createdAt: new Date().toISOString(),
        };
        onSave(session);
    };

    const progress = (step / (TOTAL_STEPS - 1)) * 100;

    return (
        <div style={s.container}>
            {/* Progress Bar */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ height: 3, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: C.gold, borderRadius: 4, transition: "width .3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: C.soft }}>Passo {step + 1} de {TOTAL_STEPS}</span>
                    <button style={{ fontSize: 11, color: C.soft, background: "none", border: "none", cursor: "pointer" }} onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </div>

            <div style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}>
                {/* Step 0 — Dados da Pessoa */}
                {step === 0 && (
                    <div style={s.card}>
                        <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8, color: C.gold }}>✦ Nova Entrevista</div>
                        <div style={{ color: C.soft, fontSize: 14, marginBottom: 24 }}>Dados da pessoa a ser discipulada</div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={s.label}>Escolher da base de dados</label>
                            <select
                                style={{ ...s.input, cursor: "pointer" }}
                                onChange={(e) => {
                                    const p = persons.find((x) => x.id === e.target.value);
                                    if (p) setPersonName(p.name);
                                }}
                                defaultValue=""
                            >
                                <option value="">— Selecionar pessoa —</option>
                                {persons.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}{p.email ? ` (${p.email})` : ""}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={s.label}>Nome *</label>
                            <input
                                style={s.input}
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                placeholder="Nome completo da pessoa"
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={s.label}>Data da Entrevista</label>
                            <input
                                type="date"
                                style={s.input}
                                value={personDate}
                                onChange={(e) => setPersonDate(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={s.label}>Observações Iniciais</label>
                            <textarea
                                style={s.textarea}
                                value={personNotes}
                                onChange={(e) => setPersonNotes(e.target.value)}
                                placeholder="Contexto, situação atual, pedidos de oração..."
                            />
                        </div>

                        <button
                            style={{ ...s.btnPrimary, opacity: personName.trim() ? 1 : 0.4 }}
                            disabled={!personName.trim()}
                            onClick={() => goTo(1)}
                        >
                            COMEÇAR ENTREVISTA
                        </button>
                    </div>
                )}

                {/* Steps 1-5 — Categorias */}
                {currentCat && (
                    <div>
                        <div style={{ ...s.card, borderColor: currentCat.color + "44", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                                <span style={{ fontSize: 24, color: currentCat.color }}>{currentCat.icon}</span>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: "bold", color: currentCat.color }}>{currentCat.label}</div>
                                    <div style={{ fontSize: 12, color: C.soft }}>{personName}</div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div style={{ marginTop: 20, marginBottom: 8 }}>
                                <label style={s.label}>Avaliação desta área</label>
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    {RATING_LABELS.map((lbl, i) => {
                                        const val = i + 1;
                                        const selected = ratings[currentCat.key] === val;
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => setRatings((prev) => ({ ...prev, [currentCat.key]: val }))}
                                                title={lbl}
                                                style={{
                                                    flex: 1,
                                                    padding: "10px 4px",
                                                    background: selected ? currentCat.color + "22" : "transparent",
                                                    border: `1px solid ${selected ? currentCat.color : C.border}`,
                                                    borderRadius: 8,
                                                    color: selected ? currentCat.color : C.soft,
                                                    fontWeight: selected ? "bold" : "normal",
                                                    fontSize: 16,
                                                    cursor: "pointer",
                                                    transition: "all .15s",
                                                }}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                                {ratings[currentCat.key] && (
                                    <div style={{ fontSize: 11, color: currentCat.color, textAlign: "center", marginTop: 6 }}>
                                        {RATING_LABELS[(ratings[currentCat.key] || 1) - 1]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Questions */}
                        {currentCat.questions.map((q, qi) => (
                            <div key={qi} style={{ ...s.card, marginBottom: 12 }}>
                                <label style={{ fontSize: 14, color: C.soft, fontStyle: "italic", lineHeight: 1.6, display: "block", marginBottom: 10 }}>
                                    {q}
                                </label>
                                <textarea
                                    style={{ ...s.textarea, marginTop: 0, minHeight: 64 }}
                                    value={answers[`${currentCat.key}-${qi}`] || ""}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({ ...prev, [`${currentCat.key}-${qi}`]: e.target.value }))
                                    }
                                    placeholder="Resposta (opcional)..."
                                />
                            </div>
                        ))}

                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                            <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => goTo(step - 1)}>← Anterior</button>
                            <button style={{ ...s.btnPrimary, flex: 2 }} onClick={() => goTo(step + 1)}>
                                {step < CATEGORIES.length ? "Próxima Área →" : "Ver Resumo →"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Step */}
                {isSummary && (
                    <div>
                        <div style={{ ...s.card, textAlign: "center", marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: C.soft, marginBottom: 4 }}>Resumo — {personName}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{formatDate(personDate)}</div>
                            <div style={{ fontSize: 48, fontWeight: "bold", color: scoreColor(avgScore(ratings)), margin: "16px 0" }}>
                                {avgScore(ratings) || "—"}
                            </div>
                            <div style={{ fontSize: 12, color: C.soft }}>Média Geral</div>
                        </div>

                        <div style={s.card}>
                            {CATEGORIES.map((cat) => {
                                const rating = ratings[cat.key] || 0;
                                return (
                                    <div key={cat.key} style={{ marginBottom: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <span style={{ color: cat.color }}>{cat.icon}</span>
                                            <span style={{ fontSize: 13, flex: 1 }}>{cat.label}</span>
                                            <ScoreBadge score={rating} />
                                        </div>
                                        <ProgressBar value={rating} color={cat.color} />
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => goTo(step - 1)}>← Anterior</button>
                            <button style={{ ...s.btnPrimary, flex: 2 }} onClick={handleSave}>
                                GUARDAR SESSÃO ✦
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
    const [view, setView] = useState<"home" | "new" | "history" | "detail">("home");
    const [sessions, setSessions] = useState<Session[]>(loadSessions);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [persons, setPersons] = useState<PersonOption[]>([]);
    const [loadingPersons, setLoadingPersons] = useState(true);

    // Carregar pessoas da BD
    useEffect(() => {
        async function load() {
            setLoadingPersons(true);
            try {
                // Tentar profiles
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("user_id, full_name, email")
                    .order("full_name");

                if (profiles && profiles.length > 0) {
                    setPersons(profiles.map((p) => ({ id: p.user_id, name: p.full_name || p.email || "Sem nome", email: p.email })));
                } else {
                    // Fallback: birthdays
                    const { data: birthdays } = await supabase
                        .from("birthdays")
                        .select("id, woman_name, man_name, email")
                        .order("woman_name");
                    if (birthdays) {
                        const list: PersonOption[] = birthdays.map((b) => ({
                            id: b.id,
                            name: b.woman_name || b.man_name || "Sem nome",
                            email: b.email || undefined,
                        }));
                        setPersons(list);
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar pessoas:", e);
            } finally {
                setLoadingPersons(false);
            }
        }
        load();
    }, []);

    const handleSave = (session: Session) => {
        const updated = [session, ...sessions];
        setSessions(updated);
        saveSessions(updated);
        setView("home");
    };

    const handleDelete = () => {
        if (!selectedSession) return;
        const updated = sessions.filter((s) => s.id !== selectedSession.id);
        setSessions(updated);
        saveSessions(updated);
        setSelectedSession(null);
        setView("home");
    };

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ color: C.gold, fontSize: 20 }}>✦</span>
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: 18, letterSpacing: "0.05em" }}>Discipulado</div>
                        <div style={{ fontSize: 11, color: C.soft, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Acompanhamento Espiritual — Confidencial
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {view !== "home" ? (
                        <button style={{ ...s.btnGhost, padding: "8px 16px", fontSize: 13 }} onClick={() => setView("home")}>
                            Painel
                        </button>
                    ) : (
                        <>
                            <button style={{ ...s.btnGhost, padding: "8px 16px", fontSize: 13 }} onClick={() => setView("history")}>
                                Histórico
                            </button>
                            <span style={{ fontSize: 12, color: C.soft }}>
                                {user?.email?.split("@")[0]}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Views */}
            {view === "home" && (
                <HomeView
                    sessions={sessions}
                    onNew={() => setView("new")}
                    onViewAll={() => setView("history")}
                    onDetail={(s) => { setSelectedSession(s); setView("detail"); }}
                />
            )}

            {view === "new" && (
                loadingPersons ? (
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.gold }} />
                    </div>
                ) : (
                    <NewSessionView
                        persons={persons}
                        onSave={handleSave}
                        onCancel={() => setView("home")}
                    />
                )
            )}

            {view === "history" && (
                <HistoryView
                    sessions={sessions}
                    onDetail={(s) => { setSelectedSession(s); setView("detail"); }}
                    onBack={() => setView("home")}
                />
            )}

            {view === "detail" && selectedSession && (
                <DetailView
                    session={selectedSession}
                    onBack={() => setView("home")}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
