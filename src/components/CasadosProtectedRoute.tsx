
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPermissions } from "@/hooks/useUserPermissions";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

interface CasadosProtectedProps {
    children: React.ReactNode;
}

export default function CasadosProtectedRoute({ children }: CasadosProtectedProps) {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const { data: permissions, isLoading: permsLoading } = useMyPermissions();
    const location = useLocation();

    if (authLoading || permsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-serif italic">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Se for admin ou tiver a permissão 'casados', tem acesso
    const hasAccess = isAdmin || permissions?.includes('casados');

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="bg-card rounded-3xl p-12 shadow-xl border border-border max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-4">Acesso Restrito</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        Não tem permissão para aceder o Material Online.
                        Entre em contacto com um administrador para solicitar o acesso "Casados Para Sempre".
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-all"
                    >
                        Voltar para o Início
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
