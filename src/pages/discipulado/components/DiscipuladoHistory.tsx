import { Session, styles, C } from "../constants/discipuladoData";
import { DiscipuladoCard } from "./DiscipuladoCard";

export function DiscipuladoHistory({ 
    sessions, 
    onDetail 
}: { 
    sessions: Session[]; 
    onDetail: (s: Session) => void; 
}) {
    return (
        <div style={styles.container}>
            <div style={{ marginBottom: 20, fontSize: 12, color: C.soft, textTransform: "uppercase" }}>Todas as Sessões ({sessions.length})</div>
            {sessions.map(s => <DiscipuladoCard key={s.id} session={s} onClick={() => onDetail(s)} />)}
        </div>
    );
}
