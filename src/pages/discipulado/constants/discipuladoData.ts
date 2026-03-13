import { CSSProperties } from "react";

// ─── Paleta ────────────────────────────────────────────────────────────────
export const C = {
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
export const CATEGORIES = [
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

export const RATING_LABELS = ["Muito difícil", "Difícil", "Regular", "Bem", "Muito bem"];

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Session {
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

export interface PersonOption {
    id: string;
    name: string;
    email?: string | null;
}

// ─── Shared UI Styles ─────────────────────────────────────────────────────
export const styles = {
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
