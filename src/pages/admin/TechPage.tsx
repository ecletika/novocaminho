import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users, Calendar, Send, Tv, Monitor, Radio, Camera, Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useWorshipMembers,
  useWorshipFunctions,
  useCreateWorshipMember,
  useUpdateWorshipMember,
  useDeleteWorshipMember,
  useCreateWorshipFunction,
  useDeleteWorshipFunction,
  WorshipMember,
} from "@/hooks/useWorship";
import { useGeneralSchedules, useCreateGeneralSchedule, useDeleteGeneralSchedule, GeneralSchedule } from "@/hooks/useGeneralSchedules";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const techRoles = [
  { id: "som", name: "Mesa de Som", icon: Radio },
  { id: "midia", name: "Mídia/Projeção", icon: Monitor },
  { id: "transmissao", name: "Transmissão/Live", icon: Tv },
  { id: "camera", name: "Câmera", icon: Camera },
];

export default function TechPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [isNewFunctionDialogOpen, setIsNewFunctionDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorshipMember | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"member" | "function" | null>(null);

  // Form states
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPrimaryFunctionId, setNewMemberPrimaryFunctionId] = useState("");
  const [newMemberSecondaryFunctionIds, setNewMemberSecondaryFunctionIds] = useState<string[]>([]);
  const [newFunctionName, setNewFunctionName] = useState("");

  // Queries
  const { data: allMembers = [], isLoading: membersLoading } = useWorshipMembers();
  const { data: functions = [], isLoading: functionsLoading } = useWorshipFunctions();
  const { data: schedules = [] } = useGeneralSchedules();

  // Mutations
  const createMember = useCreateWorshipMember();
  const updateMember = useUpdateWorshipMember();
  const deleteMember = useDeleteWorshipMember();
  const createFunction = useCreateWorshipFunction();
  const deleteFunction = useDeleteWorshipFunction();

  // Filter tech-related functions (Som, Mídia, Transmissão, etc.)
  const techFunctions = functions.filter(f => 
    f.name.toLowerCase().includes("som") ||
    f.name.toLowerCase().includes("mídia") ||
    f.name.toLowerCase().includes("midia") ||
    f.name.toLowerCase().includes("transmissão") ||
    f.name.toLowerCase().includes("transmissao") ||
    f.name.toLowerCase().includes("projeção") ||
    f.name.toLowerCase().includes("projecao") ||
    f.name.toLowerCase().includes("câmera") ||
    f.name.toLowerCase().includes("camera") ||
    f.name.toLowerCase().includes("técnico") ||
    f.name.toLowerCase().includes("tecnico")
  );

  // Filter members that have tech functions
  const techMembers = allMembers.filter(m => {
    const hasTechPrimary = techFunctions.some(tf => tf.id === m.primary_function_id);
    const hasTechSecondary = m.secondary_functions?.some(sf => 
      techFunctions.some(tf => tf.id === sf.function_id)
    );
    return hasTechPrimary || hasTechSecondary;
  });

  // Filter schedules that have som or midia team members
  const techSchedules = schedules.filter(s => 
    s.team_members?.some(tm => tm.role === "som" || tm.role === "midia")
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "som": return Radio;
      case "midia": return Monitor;
      case "transmissao": return Tv;
      case "camera": return Camera;
      default: return Monitor;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "som": return "Mesa de Som";
      case "midia": return "Mídia/Projeção";
      case "transmissao": return "Transmissão";
      case "camera": return "Câmera";
      default: return role;
    }
  };

  const resetMemberForm = () => {
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberPrimaryFunctionId("");
    setNewMemberSecondaryFunctionIds([]);
    setSelectedMember(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPrimaryFunctionId) return;

    await createMember.mutateAsync({
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      secondary_function_ids: newMemberSecondaryFunctionIds,
    });

    resetMemberForm();
    setIsNewMemberDialogOpen(false);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !newMemberName.trim() || !newMemberPrimaryFunctionId) return;

    await updateMember.mutateAsync({
      id: selectedMember.id,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      secondary_function_ids: newMemberSecondaryFunctionIds,
    });

    resetMemberForm();
    setIsEditMemberDialogOpen(false);
  };

  const openEditMemberDialog = (member: WorshipMember) => {
    setSelectedMember(member);
    setNewMemberName(member.name);
    setNewMemberPhone(member.phone || "");
    setNewMemberPrimaryFunctionId(member.primary_function_id || "");
    setNewMemberSecondaryFunctionIds(member.secondary_functions?.map(sf => sf.function_id) || []);
    setIsEditMemberDialogOpen(true);
  };

  const handleAddFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunctionName.trim()) return;

    await createFunction.mutateAsync({ name: newFunctionName.trim() });
    setNewFunctionName("");
    setIsNewFunctionDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId || !deleteType) return;

    if (deleteType === "member") {
      await deleteMember.mutateAsync(deleteItemId);
    } else if (deleteType === "function") {
      await deleteFunction.mutateAsync(deleteItemId);
    }

    setDeleteItemId(null);
    setDeleteType(null);
  };

  const toggleSecondaryFunction = (functionId: string) => {
    setNewMemberSecondaryFunctionIds(prev =>
      prev.includes(functionId)
        ? prev.filter(id => id !== functionId)
        : [...prev, functionId]
    );
  };

  const handleSendWhatsApp = (schedule: GeneralSchedule) => {
    const somMembers = schedule.team_members?.filter(tm => tm.role === "som") || [];
    const midiaMembers = schedule.team_members?.filter(tm => tm.role === "midia") || [];

    let assignments = "";
    if (somMembers.length > 0) {
      assignments += `🎛️ *Som:*\n${somMembers.map(tm => `• ${tm.member?.name || "N/A"}`).join("\n")}\n\n`;
    }
    if (midiaMembers.length > 0) {
      assignments += `📺 *Mídia:*\n${midiaMembers.map(tm => `• ${tm.member?.name || "N/A"}`).join("\n")}`;
    }

    const message = `📅 *Escala Técnica*\n\n📆 Data: ${format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}\n🕐 Tipo: ${schedule.type}\n\n${assignments}\n\n🙏 Contamos com sua presença!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast({
      title: "WhatsApp aberto!",
      description: "A mensagem foi preparada para envio.",
    });
  };

  const filteredMembers = techMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (membersLoading || functionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Integrantes</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Escalas</span>
          </TabsTrigger>
          <TabsTrigger value="functions" className="gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Funções</span>
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
            <Button onClick={() => { resetMemberForm(); setIsNewMemberDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Integrante
            </Button>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum integrante encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione integrantes com funções técnicas (Som, Mídia, etc.)
              </p>
              <Button onClick={() => { resetMemberForm(); setIsNewMemberDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Integrante
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card rounded-xl shadow-soft p-5 hover:shadow-card transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-secondary">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        <span className={`w-2 h-2 rounded-full ${member.active ? "bg-green-500" : "bg-muted"}`} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {member.primary_function && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                            {member.primary_function.name}
                          </span>
                        )}
                        {member.secondary_functions?.map((sf) => (
                          <span
                            key={sf.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium"
                          >
                            {sf.function?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditMemberDialog(member)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => { setDeleteItemId(member.id); setDeleteType("member"); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Escalas com Equipe Técnica
            </h2>
          </div>

          {techSchedules.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma escala encontrada</h3>
              <p className="text-muted-foreground">
                As escalas com equipe técnica aparecerão aqui quando forem criadas na página de Escalas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {techSchedules
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((schedule) => {
                  const somMembers = schedule.team_members?.filter(tm => tm.role === "som") || [];
                  const midiaMembers = schedule.team_members?.filter(tm => tm.role === "midia") || [];

                  return (
                    <div
                      key={schedule.id}
                      className="bg-card rounded-xl shadow-soft p-6 hover:shadow-card transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </h3>
                          <span className="text-muted-foreground">{schedule.type}</span>
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
                        {somMembers.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Radio className="w-4 h-4 text-orange-500" />
                              Som
                            </span>
                            {somMembers.map((tm) => (
                              <div key={tm.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 ml-6">
                                <span className="text-sm text-foreground">{tm.member?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {midiaMembers.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Tv className="w-4 h-4 text-purple-500" />
                              Mídia
                            </span>
                            {midiaMembers.map((tm) => (
                              <div key={tm.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 ml-6">
                                <span className="text-sm text-foreground">{tm.member?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </TabsContent>

        {/* Functions Tab */}
        <TabsContent value="functions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Funções Técnicas
            </h2>
            <Button onClick={() => setIsNewFunctionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Função
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {functions.map((func) => (
              <div
                key={func.id}
                className="bg-card rounded-xl shadow-soft p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{func.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => { setDeleteItemId(func.id); setDeleteType("function"); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={isNewMemberDialogOpen} onOpenChange={(open) => { setIsNewMemberDialogOpen(open); if (!open) resetMemberForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Adicionar Integrante
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
              <Input
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="912 345 678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Função Principal *</label>
              <Select value={newMemberPrimaryFunctionId} onValueChange={setNewMemberPrimaryFunctionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {functions.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Funções Secundárias</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {functions
                  .filter(f => f.id !== newMemberPrimaryFunctionId)
                  .map((f) => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={newMemberSecondaryFunctionIds.includes(f.id)}
                        onCheckedChange={() => toggleSecondaryFunction(f.id)}
                      />
                      <span className="text-sm">{f.name}</span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewMemberDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createMember.isPending}>
                {createMember.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={(open) => { setIsEditMemberDialogOpen(open); if (!open) resetMemberForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Editar Integrante
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
              <Input
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="912 345 678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Função Principal *</label>
              <Select value={newMemberPrimaryFunctionId} onValueChange={setNewMemberPrimaryFunctionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {functions.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Funções Secundárias</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {functions
                  .filter(f => f.id !== newMemberPrimaryFunctionId)
                  .map((f) => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={newMemberSecondaryFunctionIds.includes(f.id)}
                        onCheckedChange={() => toggleSecondaryFunction(f.id)}
                      />
                      <span className="text-sm">{f.name}</span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditMemberDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={updateMember.isPending}>
                {updateMember.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Function Dialog */}
      <Dialog open={isNewFunctionDialogOpen} onOpenChange={setIsNewFunctionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Nova Função
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFunction} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome da Função *</label>
              <Input
                value={newFunctionName}
                onChange={(e) => setNewFunctionName(e.target.value)}
                placeholder="Ex: Mesa de Som, Projeção, etc."
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewFunctionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createFunction.isPending}>
                {createFunction.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => { setDeleteItemId(null); setDeleteType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este {deleteType === "member" ? "integrante" : "função"}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
