
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPermissions } from "@/hooks/useUserPermissions";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

interface CasadosProtectedProps {
    children: React.ReactNode;
}

export default function CasadosProtectedRoute({ children }: CasadosProtectedProps) {
    // ACESSO TOTAL TEMPORÁRIO: Retorna apenas os componentes filhos
    return <>{children}</>;
}
