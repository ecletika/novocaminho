import { Navigate } from "react-router-dom";
import { Loader2, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMyPermissions } from "@/hooks/useUserPermissions";

interface PermissionRouteProps {
    children: React.ReactNode;
    /** Permissão necessária para aceder. Se null = apenas autenticado. Se "admin" = apenas admins. */
    perm: string | null;
}

export default function PermissionRoute({ children, perm }: PermissionRouteProps) {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const { data: permissions, isLoading: permsLoading } = useMyPermissions();

    if (authLoading || permsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Owner and Admins always bypass permission errors
    if (isAdmin || user.email?.toLowerCase() === "novocaminho@ecletika.com") {
        return <>{children}</>;
    }

    if (!perm) {
        return <>{children}</>;
    }

    if (permissions && permissions.includes(perm)) {
        return <>{children}</>;
    }

    return <AccessDenied />;
}

function AccessDenied() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <ShieldOff className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Acesso Negado
                </h2>
                <p className="text-muted-foreground mb-6">
                    Não tens permissão para aceder a esta área. Contacta um administrador caso
                    precises de acesso.
                </p>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Voltar
                </Button>
            </div>
        </div>
    );
}
