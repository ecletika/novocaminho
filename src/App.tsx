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
import ContatoPage from "./pages/ContatoPage";
import CasadosPage from "./pages/CasadosPage";
import CasadosCursosPage from "./pages/casados/CasadosCursosPage";
import CasadosMaterialPage from "./pages/casados/CasadosMaterialPage";
import CasadosEstudosPage from "./pages/casados/CasadosEstudosPage";
import CasadosRecursosPage from "./pages/casados/CasadosRecursosPage";
import AuthPage from "./pages/AuthPage";
import PublicBirthdayRegister from "./pages/PublicBirthdayRegister";
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
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Route element={<PublicLayout><ContatoPage /></PublicLayout>} path="/contato" />
            <Route element={<PublicLayout><CasadosPage /></PublicLayout>} path="/casados" />
            <Route element={<PublicLayout><CasadosCursosPage /></PublicLayout>} path="/casados/cursos" />
            <Route element={<PublicLayout><CasadosMaterialPage /></PublicLayout>} path="/casados/material" />
            <Route element={<PublicLayout><CasadosEstudosPage /></PublicLayout>} path="/casados/estudos" />
            <Route element={<PublicLayout><CasadosRecursosPage /></PublicLayout>} path="/casados/recursos" />
            <Route element={<PublicLayout><BelievePage /></PublicLayout>} path="/no-que-cremos" />
            <Route element={<PublicLayout><BibliaPage /></PublicLayout>} path="/biblia" />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cadastro-aniversario" element={<PublicBirthdayRegister />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventario" element={<InventarioPage />} />
              <Route path="louvor" element={<LouvorPage />} />
              <Route path="tech" element={<TechPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="ministerios" element={<AdminMinisteriosPage />} />
              <Route path="eventos" element={<AdminEventosPage />} />
              <Route path="escalas" element={<AdminEscalasPage />} />
              <Route path="aniversarios" element={<AniversariosPage />} />
              <Route path="casados" element={<AdminCasadosPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="lideranca" element={<AdminLiderancaPage />} />
              <Route path="config" element={<ConfigPage />} />
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
