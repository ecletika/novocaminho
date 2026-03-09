import { Navigate } from "react-router-dom";
import { Loader2, ShieldOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPermissions } from "@/hooks/useUserPermissions";
import { useUserWorshipSkills } from "@/hooks/useWorship";
import { Button } from "@/components/ui/button";

interface PermissionRouteProps {
    children: React.ReactNode;
    /** Permissão necessária para aceder. Se null = apenas autenticado. Se "admin" = apenas admins. */
    perm: string | null;
}

export default function PermissionRoute({ children, perm }: PermissionRouteProps) {
    const { user, isLoading, isAdmin } = useAuth();
    const { data: myPermissions = [], isLoading: permsLoading } = useMyPermissions();
    const worshipSkills = useUserWorshipSkills(user?.id);

    // Aguardar carregamento
    if (isLoading || permsLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">A verificar permissões...</p>
                </div>
            </div>
        );
    }

    // Não autenticado — nunca deve chegar aqui (ProtectedRoute já redireciona), mas por segurança:
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Acesso universal ao proprietário (novocaminho@ecletika.com)
    const isOwner = user?.email?.toLowerCase() === "novocaminho@ecletika.com";
    if (isOwner) {
        return <>{children}</>;
    }

    // Admin tem acesso a tudo
    if (isAdmin) {
        return <>{children}</>;
    }

    // Acesso exclusivo ao proprietário (mauricio.junior) - mantido por compatibilidade
    if (perm === "owner") {
        return <AccessDenied />;
    }

    // Sem permissão específica necessária — acesso livre a autenticados
    if (perm === null) {
        return <>{children}</>;
    }

    // Acesso exclusivo a admins (se chegou aqui, isAdmin é falso)
    if (perm === "admin") {
        return <AccessDenied />;
    }

    // Verificar permissão de louvor via skills de worship
    if (perm === "louvor" && worshipSkills.hasLouvorAccess) {
        return <>{children}</>;
    }

    // Verificar permissão de tech via skills de worship
    if (perm === "tech" && worshipSkills.hasTechAccess) {
        return <>{children}</>;
    }

    // Verificar tabela user_permissions
    if (myPermissions.includes(perm)) {
        return <>{children}</>;
    }

    // Sem permissão
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
