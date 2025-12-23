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
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

// Admin Layout & Pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventarioPage from "./pages/admin/InventarioPage";
import LouvorPage from "./pages/admin/LouvorPage";
import TechPage from "./pages/admin/TechPage";
import DocsPage from "./pages/admin/DocsPage";
import AdminMinisteriosPage from "./pages/admin/AdminMinisteriosPage";
import EscalasPage from "./pages/admin/EscalasPage";
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
            <Route path="/auth" element={<AuthPage />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventario" element={<InventarioPage />} />
              <Route path="louvor" element={<LouvorPage />} />
              <Route path="tech" element={<TechPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="ministerios" element={<AdminMinisteriosPage />} />
              <Route path="escalas" element={<EscalasPage />} />
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
