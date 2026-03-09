
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
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Owner and Admins have full access
    if (isAdmin || user.email?.toLowerCase() === "novocaminho@ecletika.com") {
        return <>{children}</>;
    }

    if (permissions && permissions.includes("casados")) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    Acesso Restrito
                </h2>
                <p className="text-muted-foreground mb-8">
                    Esta área é exclusiva para participantes e líderes do ministério
                    <strong className="text-primary ml-1">Casados Para Sempre</strong>.
                    Caso faça parte do ministério, solicite o acesso à liderança.
                </p>
                <Link to="/casados" className="inline-block">
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                        Voltar para a página inicial
                    </button>
                </Link>
            </div>
        </div>
    );
}
