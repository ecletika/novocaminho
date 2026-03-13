import { C } from "../constants/discipuladoData";

// ─── Helpers ───────────────────────────────────────────────────────────────
export function scoreColor(s: number) {
    if (s >= 4) return C.green;
    if (s >= 3) return C.gold;
    if (s >= 2) return C.orange;
    return C.red;
}

export function avgScore(ratings: any) {
    if (!ratings || typeof ratings !== 'object') return 0;
    const vals = Object.values(ratings).map(v => Number(v)).filter((v) => v > 0);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-PT", {
        day: "2-digit", month: "long", year: "numeric",
    });
}

// ─── Shared UI Components ──────────────────────────────────────────────────
export function ScoreBadge({ score }: { score: number }) {
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

export function ProgressBar({ value, max = 5, color }: { value: number; max?: number; color: string }) {
    return (
        <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden", flexGrow: 1 }}>
            <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "width .6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>
    );
}
