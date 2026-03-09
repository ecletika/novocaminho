import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Public Layout & Pages
import PublicLayout from "./components/layout/PublicLayout";
import HomePage from "./pages/HomePage";
import MinisteriosPage from "./pages/MinisteriosPage";
import MinisterioDetailPage from "./pages/MinisterioDetailPage";
import EventosPage from "./pages/EventosPage";
import ContactoPage from "./pages/ContactoPage";
import CasadosPage from "./pages/CasadosPage";
import CasadosCursosPage from "./pages/casados/CasadosCursosPage";
import CasadosMaterialPage from "./pages/casados/CasadosMaterialPage";
import CasadosEstudosPage from "./pages/casados/CasadosEstudosPage";
import CasadosRecursosPage from "./pages/casados/CasadosRecursosPage";
import AuthPage from "./pages/AuthPage";
import RegistoAniversarioPage from "./pages/RegistoAniversarioPage";
import BelievePage from "./pages/BelievePage";
import BibliaPage from "./pages/BibliaPage";
import NotFound from "./pages/NotFound";

// Admin Layout & Pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventarioPage from "./pages/admin/InventarioPage";
import LouvorPage from "./pages/admin/LouvorPage";
import TechPage from "./pages/admin/TechPage";
import DocsPage from "./pages/admin/DocsPage";
import AdminMinisteriosPage from "./pages/admin/AdminMinisteriosPage";
import AdminEventosPage from "./pages/admin/AdminEventosPage";
import AniversariosPage from "./pages/admin/AniversariosPage";
import ConfigPage from "./pages/admin/ConfigPage";
import AdminCasadosPage from "./pages/admin/AdminCasadosPage";
import AdminLiderancaPage from "./pages/admin/AdminLiderancaPage";
import AdminEscalasPage from "./pages/admin/AdminEscalasPage";
import UsersPage from "./pages/admin/UsersPage";
import DiscipuladoPage from "./pages/DiscipuladoPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import CasadosProtectedRoute from "./components/CasadosProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout><HomePage /></PublicLayout>} path="/" />
            <Route element={<PublicLayout><MinisteriosPage /></PublicLayout>} path="/ministerios" />
            <Route element={<PublicLayout><MinisterioDetailPage /></PublicLayout>} path="/ministerios/:slug" />
            <Route element={<PublicLayout><EventosPage /></PublicLayout>} path="/eventos" />
            <Route element={<PublicLayout><ContactoPage /></PublicLayout>} path="/contacto" />
            <Route element={<PublicLayout><CasadosPage /></PublicLayout>} path="/casados" />
            <Route element={<PublicLayout><CasadosProtectedRoute><CasadosCursosPage /></CasadosProtectedRoute></PublicLayout>} path="/casados/cursos" />
            <Route element={<PublicLayout><CasadosProtectedRoute><CasadosMaterialPage /></CasadosProtectedRoute></PublicLayout>} path="/casados/material" />
            <Route element={<PublicLayout><CasadosEstudosPage /></PublicLayout>} path="/casados/estudos" />
            <Route element={<PublicLayout><CasadosRecursosPage /></PublicLayout>} path="/casados/recursos" />
            <Route element={<PublicLayout><BelievePage /></PublicLayout>} path="/no-que-cremos" />
            <Route element={<PublicLayout><BibliaPage /></PublicLayout>} path="/biblia" />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/registo-aniversario" element={<RegistoAniversarioPage />} />

            {/* Discipulado — rota isolada, acesso por permissão especial */}
            <Route
              path="/discipulado"
              element={
                <ProtectedRoute>
                  <PermissionRoute perm="discipulado">
                    <DiscipuladoPage />
                  </PermissionRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes — ProtectedRoute garante autenticação, PermissionRoute garante permissão por área */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              {/* Dashboard: acessível a todos os utilizadores autenticados */}
              <Route index element={<PermissionRoute perm={null}><AdminDashboard /></PermissionRoute>} />

              {/* Áreas com permissão específica */}
              <Route path="inventario" element={<PermissionRoute perm="inventario"><InventarioPage /></PermissionRoute>} />
              <Route path="louvor" element={<PermissionRoute perm="louvor"><LouvorPage /></PermissionRoute>} />
              <Route path="tech" element={<PermissionRoute perm="tech"><TechPage /></PermissionRoute>} />
              <Route path="docs" element={<PermissionRoute perm="docs"><DocsPage /></PermissionRoute>} />
              <Route path="ministerios" element={<PermissionRoute perm="ministerios"><AdminMinisteriosPage /></PermissionRoute>} />
              <Route path="eventos" element={<PermissionRoute perm="eventos"><AdminEventosPage /></PermissionRoute>} />
              <Route path="escalas" element={<PermissionRoute perm="escalas"><AdminEscalasPage /></PermissionRoute>} />
              <Route path="aniversarios" element={<PermissionRoute perm="aniversarios"><AniversariosPage /></PermissionRoute>} />
              <Route path="casados" element={<PermissionRoute perm="casados"><AdminCasadosPage /></PermissionRoute>} />
              <Route path="lideranca" element={<PermissionRoute perm="ministerios"><AdminLiderancaPage /></PermissionRoute>} />
              <Route path="config" element={<PermissionRoute perm="owner"><ConfigPage /></PermissionRoute>} />

              {/* Gestão de utilizadores: exclusivo para admins */}
              <Route path="users" element={<PermissionRoute perm="admin"><UsersPage /></PermissionRoute>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
