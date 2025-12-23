import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users, Calendar, Send, Tv, Monitor, Radio, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "som", name: "Mesa de Som", icon: Radio },
  { id: "transmissao", name: "Transmissão/Live", icon: Tv },
  { id: "projecao", name: "Projeção", icon: Monitor },
  { id: "camera", name: "Câmera", icon: Camera },
];

const mockMembers = [
  { id: 1, name: "Carlos Lima", roles: ["som", "transmissao"], active: true },
  { id: 2, name: "Ana Ferreira", roles: ["projecao"], active: true },
  { id: 3, name: "Ricardo Santos", roles: ["transmissao", "camera"], active: true },
  { id: 4, name: "Mariana Costa", roles: ["som"], active: true },
  { id: 5, name: "Paulo Oliveira", roles: ["projecao", "camera"], active: false },
];

const mockSchedules = [
  {
    id: 1,
    date: "2024-12-22",
    time: "10:00",
    assignments: [
      { role: "som", member: "Carlos Lima" },
      { role: "transmissao", member: "Ricardo Santos" },
      { role: "projecao", member: "Ana Ferreira" },
    ],
  },
  {
    id: 2,
    date: "2024-12-22",
    time: "18:00",
    assignments: [
      { role: "som", member: "Mariana Costa" },
      { role: "transmissao", member: "Carlos Lima" },
      { role: "projecao", member: "Ana Ferreira" },
    ],
  },
  {
    id: 3,
    date: "2024-12-25",
    time: "18:00",
    assignments: [
      { role: "som", member: "Carlos Lima" },
      { role: "transmissao", member: "Ricardo Santos" },
      { role: "projecao", member: "Ana Ferreira" },
      { role: "camera", member: "Ricardo Santos" },
    ],
  },
];

export default function TechPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);

  const getRoleInfo = (roleId: string) => {
    return roles.find((r) => r.id === roleId) || roles[0];
  };

  const handleSendWhatsApp = (schedule: typeof mockSchedules[0]) => {
    const assignments = schedule.assignments
      .map((a) => `• ${getRoleInfo(a.role).name}: ${a.member}`)
      .join("\n");
    const message = `📅 *Escala Técnica*\n\n📆 Data: ${new Date(schedule.date).toLocaleDateString("pt-PT")} às ${schedule.time}\n\n🎛️ *Equipe:*\n${assignments}\n\n🙏 Contamos com sua presença!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast({
      title: "WhatsApp aberto!",
      description: "A mensagem foi preparada para envio.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Mesa de Som & Mídia
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a equipe técnica de som, transmissão e projeção
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Integrantes</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Escalas</span>
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar integrantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isNewMemberDialogOpen} onOpenChange={setIsNewMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Integrante
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Adicionar Integrante
                  </DialogTitle>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome *
                    </label>
                    <Input placeholder="Nome completo" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Funções *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                        >
                          <input type="checkbox" name="roles" value={role.id} />
                          <role.icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{role.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsNewMemberDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Adicionar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMembers
              .filter((m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-xl shadow-soft p-5 hover:shadow-card transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-secondary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            member.active ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {member.roles.map((roleId) => {
                          const role = getRoleInfo(roleId);
                          return (
                            <span
                              key={roleId}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium"
                            >
                              <role.icon className="w-3 h-3" />
                              {role.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Escalas de Dezembro 2024
            </h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Escala
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-card rounded-xl shadow-soft p-6 hover:shadow-card transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {new Date(schedule.date).toLocaleDateString("pt-PT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h3>
                    <span className="text-muted-foreground">{schedule.time}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendWhatsApp(schedule)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <div className="space-y-3">
                  {schedule.assignments.map((assignment, idx) => {
                    const role = getRoleInfo(assignment.role);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <role.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-muted-foreground">
                            {role.name}
                          </span>
                          <span className="block font-medium text-foreground">
                            {assignment.member}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
