import { C, Session, styles } from "../constants/discipuladoData";
import { avgScore, formatDate, ScoreBadge } from "./DiscipuladoShared";

export function DiscipuladoCard({ session, onClick }: { session: Session; onClick: () => void }) {
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
