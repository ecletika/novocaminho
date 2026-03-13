import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { C, styles } from "../constants/discipuladoData";

export function DiscipuladoUnlock({ 
    dbPassword, 
    onUnlock 
}: { 
    dbPassword?: string; 
    onUnlock: () => void; 
}) {
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setTimeout(() => {
            if (password === dbPassword) {
                sessionStorage.setItem("discipulado_unlocked", "true");
                onUnlock();
                toast.success("Acesso autorizado.");
            } else {
                toast.error("Chave de acesso incorreta.");
            }
            setIsVerifying(false);
        }, 600);
    };

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
