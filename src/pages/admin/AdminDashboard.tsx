import { useState } from "react";
import {
  Package,
  Music,
  Tv,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useNextSchedule } from "@/hooks/useDashboardStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: nextSchedule } = useNextSchedule();
  
  const [quickActionDialog, setQuickActionDialog] = useState<string | null>(null);

  const statsData = [
    { 
      name: "Itens no Inventário", 
      value: statsLoading ? "-" : stats?.inventoryCount.toString() || "0", 
      icon: Package, 
      href: "/admin/inventario" 
    },
    { 
      name: "Músicas Cadastradas", 
      value: statsLoading ? "-" : stats?.songsCount.toString() || "0", 
      icon: Music, 
      href: "/admin/louvor" 
    },
    { 
      name: "Integrantes Ativos", 
      value: statsLoading ? "-" : stats?.membersCount.toString() || "0", 
      icon: Users, 
      href: "/admin/louvor" 
    },
    { 
      name: "Escalas este Mês", 
      value: statsLoading ? "-" : stats?.schedulesThisMonth.toString() || "0", 
      icon: Calendar, 
      href: "/admin/escalas" 
    },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Nova Música":
        navigate("/admin/louvor?tab=songs&new=true");
        break;
      case "Criar Escala":
        navigate("/admin/escalas?new=true");
        break;
      case "Add Item":
        navigate("/admin/inventario?new=true");
        break;
      case "Novo Doc":
        navigate("/admin/docs?new=true");
        break;
    }
  };

  const quickActions = [
    { name: "Nova Música", icon: Music },
    { name: "Criar Escala", icon: Calendar },
    { name: "Add Item", icon: Package },
    { name: "Novo Doc", icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao painel administrativo da Igreja Novo Caminho
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Button 
              key={action.name} 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => handleQuickAction(action.name)}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
            </h3>
            <p className="text-muted-foreground text-sm">{stat.name}</p>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Mobile */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Ações Rápidas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => handleQuickAction(action.name)}
                className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <action.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium text-foreground">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-xl shadow-soft p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/louvor"
              className="p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-center"
            >
              <Music className="w-8 h-8 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-foreground">Louvor</span>
            </Link>
            <Link
              to="/admin/tech"
              className="p-4 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors text-center"
            >
              <Tv className="w-8 h-8 text-secondary mx-auto mb-2" />
              <span className="text-sm font-medium text-foreground">Mídia</span>
            </Link>
            <Link
              to="/admin/inventario"
              className="p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors text-center"
            >
              <Package className="w-8 h-8 text-accent mx-auto mb-2" />
              <span className="text-sm font-medium text-foreground">Inventário</span>
            </Link>
            <Link
              to="/admin/docs"
              className="p-4 rounded-xl bg-gold/10 hover:bg-gold/20 transition-colors text-center"
            >
              <FileText className="w-8 h-8 text-gold-dark mx-auto mb-2" />
              <span className="text-sm font-medium text-foreground">Docs</span>
            </Link>
          </div>

          {/* Próxima Escala */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              Próxima Escala
            </h3>
            {nextSchedule ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {format(new Date(nextSchedule.date), "EEEE, dd/MM", { locale: ptBR })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {nextSchedule.team_members?.filter((tm: any) => tm.role === "louvor")
                    .map((tm: any) => tm.member?.name).join(", ") || "Sem equipe definida"}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma escala próxima</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
