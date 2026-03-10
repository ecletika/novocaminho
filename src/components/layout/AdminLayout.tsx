import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Music,
  Tv,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Radio,
  Cake,
  Layers,
  Heart,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPermissions } from "@/hooks/useUserPermissions";
import { useUserWorshipSkills } from "@/hooks/useWorship";
import logoImage from "@/assets/logo-igreja.png";
import logoAdmin from "@/assets/logo-admin.png";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, perm: null },
  { name: "Inventário", href: "/admin/inventario", icon: Package, perm: "inventario" },
  { name: "Louvor", href: "/admin/louvor", icon: Music, perm: "louvor" },
  { name: "Mesa & Media", href: "/admin/tech", icon: Tv, perm: "tech" },
  { name: "Ministérios", href: "/admin/ministerios", icon: Users, perm: "ministerios" },
  { name: "Eventos", href: "/admin/eventos", icon: Calendar, perm: "eventos" },
  { name: "Escalas", href: "/admin/escalas", icon: Calendar, perm: "escalas" },
  { name: "Casados Para Sempre", href: "/admin/casados", icon: Heart, perm: "casados" },
  { name: "Aniversários", href: "/admin/aniversarios", icon: Cake, perm: "aniversarios" },
  { name: "Lideranças", href: "/admin/lideranca", icon: Layers, perm: "ministerios" },
  { name: "Documentação", href: "/admin/docs", icon: FileText, perm: "docs" },
  { name: "Entrevistas", href: "/discipulado", icon: MessageSquare, perm: "discipulado" },
  { name: "Utilizadores", href: "/admin/users", icon: Users, perm: "admin" },
  { name: "Configurações", href: "/admin/config", icon: Settings, perm: "owner" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user, isAdmin } = useAuth();
  const { data: myPermissions } = useMyPermissions();
  const { hasLouvorAccess } = useUserWorshipSkills(user?.id);

  const visibleNavigation = navigation.filter((item) => {
    // Admin always sees everything
    if (isAdmin) return true;

    // Se a rota não exige perm especial, todos veem
    if (!item.perm) return true;

    // Se for rota de 'Admin'
    if (item.perm === "admin") return false;

    // Se tiver a perm específica na tabela user_permissions
    if (myPermissions?.includes(item.perm)) return true;

    // Regra extra pro Dashboard de Louvor (worship_skills)
    if (item.perm === "louvor" && hasLouvorAccess) return true;

    return false;
  });

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link to="/" className="flex items-center justify-center w-full px-2">
              <img
                src={logoAdmin}
                alt="Logo Igreja"
                className="h-20 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Radio Player */}
          <div className="p-4 border-t border-border">
            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                  <Radio className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <span className="font-medium text-foreground text-sm">Rádio Igreja Novo Caminho</span>
                  <span className="block text-xs text-muted-foreground">Ao vivo</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Abrir Player
              </Button>
            </div>
          </div>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground text-sm truncate block">
                  {user?.email?.split("@")[0] || "Admin"}
                </span>
                <span className="block text-xs text-muted-foreground">Administrador</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="h-full flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  className="pl-9 w-64 h-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Ver Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
