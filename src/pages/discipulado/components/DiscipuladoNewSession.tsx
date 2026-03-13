import { useState } from "react";
import { Loader2 } from "lucide-react";
import { C, CATEGORIES, PersonOption, styles } from "../constants/discipuladoData";
import { avgScore, formatDate, ProgressBar } from "./DiscipuladoShared";

export function DiscipuladoNewSession({ 
    onSave, 
    onCancel, 
    persons, 
    isSaving 
}: { 
    onSave: (data: any) => void; 
    onCancel: () => void; 
    persons: PersonOption[]; 
    isSaving: boolean 
}) {
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
                            <div style={{ fontSize: 64, fontWeight: "bold", color: "gold", margin: "16px 0" }}>{avgScore(ratings)}</div>
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
