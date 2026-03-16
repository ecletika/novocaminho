import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users, Calendar, Send, Tv, Monitor, Radio, Loader2, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useGeneralSchedules, useCreateGeneralSchedule, useUpdateGeneralSchedule, useDeleteGeneralSchedule, GeneralSchedule } from "@/hooks/useGeneralSchedules";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";

const techRoles = [
  { id: "som", name: "Mesa de Som", icon: Radio },
  { id: "midia", name: "Media/Projeção", icon: Monitor },
  { id: "transmissao", name: "Transmissão/Live", icon: Tv },
];

export default function TechPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [isNewFunctionDialogOpen, setIsNewFunctionDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorshipMember | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"member" | "function" | "schedule" | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<GeneralSchedule | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form states - Tech Schedule
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState("");
  const [selectedSom, setSelectedSom] = useState<string[]>([]);
  const [selectedMidia, setSelectedMidia] = useState<string[]>([]);
  const [selectedTransmissao, setSelectedTransmissao] = useState<string[]>([]);

  // Form states
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPrimaryFunctionId, setNewMemberPrimaryFunctionId] = useState("");
  const [newMemberSecondaryFunctionIds, setNewMemberSecondaryFunctionIds] = useState<string[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState<string>("");
  const [newMemberPhotoUrl, setNewMemberPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newFunctionName, setNewFunctionName] = useState("");

  // Queries
  const { data: allMembers = [], isLoading: membersLoading } = useWorshipMembers();
  const { data: functions = [], isLoading: functionsLoading } = useWorshipFunctions();
  const { data: schedules = [] } = useGeneralSchedules();
  const { data: profiles = [] } = useProfiles();

  // Mutations
  const createMember = useCreateWorshipMember();
  const updateMember = useUpdateWorshipMember();
  const deleteMember = useDeleteWorshipMember();
  const createFunction = useCreateWorshipFunction();
  const deleteFunction = useDeleteWorshipFunction();
  const createGeneralSchedule = useCreateGeneralSchedule();
  const updateGeneralSchedule = useUpdateGeneralSchedule();
  const deleteGeneralSchedule = useDeleteGeneralSchedule();

  // Filter tech-related functions (Som, Media, Transmissão, etc.)
  const techFunctions = functions.filter(f =>
    f.name.toLowerCase().includes("som") ||
    f.name.toLowerCase().includes("media") ||
    f.name.toLowerCase().includes("midia") ||
    f.name.toLowerCase().includes("transmissão") ||
    f.name.toLowerCase().includes("transmissao") ||
    f.name.toLowerCase().includes("projeção") ||
    f.name.toLowerCase().includes("projecao") ||
    f.name.toLowerCase().includes("câmera") ||
    f.name.toLowerCase().includes("camera") ||
    f.name.toLowerCase().includes("técnico") ||
    f.name.toLowerCase().includes("tecnico") ||
    f.name.toLowerCase().includes("mesa") ||
    f.name.toLowerCase().includes("live")
  );

  // Filter members that have tech functions
  const techMembers = allMembers.filter(m => {
    const hasTechPrimary = techFunctions.some(tf => tf.id === m.primary_function_id);
    const hasTechSecondary = m.secondary_functions?.some(sf =>
      techFunctions.some(tf => tf.id === sf.function_id)
    );
    return hasTechPrimary || hasTechSecondary;
  });

  // Filter schedules that have any tech team members
  const techSchedules = schedules.filter(s =>
    s.team_members?.some(tm => ["som", "midia", "transmissao"].includes(tm.role))
  );

  const scheduleTypes = ["Culto Domingo", "Culto Quarta", "Culto de Oração", "Evento Especial"];

  const somMembers = techMembers.filter(m =>
    m.primary_function?.name.toLowerCase().includes("som") ||
    m.primary_function?.name.toLowerCase().includes("mesa") ||
    m.secondary_functions?.some(sf => sf.function?.name.toLowerCase().includes("som") || sf.function?.name.toLowerCase().includes("mesa"))
  );

  const midiaMembers = techMembers.filter(m =>
    m.primary_function?.name.toLowerCase().includes("media") ||
    m.primary_function?.name.toLowerCase().includes("midia") ||
    m.secondary_functions?.some(sf => sf.function?.name.toLowerCase().includes("media") || sf.function?.name.toLowerCase().includes("midia"))
  );

  const transmissaoMembers = techMembers.filter(m =>
    m.primary_function?.name.toLowerCase().includes("transmissão") ||
    m.primary_function?.name.toLowerCase().includes("transmissao") ||
    m.primary_function?.name.toLowerCase().includes("live") ||
    m.secondary_functions?.some(sf =>
      sf.function?.name.toLowerCase().includes("transmissão") ||
      sf.function?.name.toLowerCase().includes("transmissao") ||
      sf.function?.name.toLowerCase().includes("live")
    )
  );



  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const schedulesInMonth = schedules.filter(s => {
    const scheduleDate = new Date(s.date);
    return isSameMonth(scheduleDate, currentMonth);
  });

  const getScheduleForDay = (day: Date) => {
    return schedules.find(s => isSameDay(new Date(s.date), day));
  };

  // Get current user's profile and skills
  const myMemberProfile = allMembers.find(m => m.user_id === currentUser?.id);
  const myFunctions = [
    myMemberProfile?.primary_function?.name.toLowerCase(),
    ...(myMemberProfile?.secondary_functions?.map(sf => sf.function?.name.toLowerCase()) || [])
  ].filter(Boolean);

  const isTechMember = myFunctions.some(f =>
    f?.includes("som") || f?.includes("media") || f?.includes("midia") ||
    f?.includes("transmissão") || f?.includes("transmissao") ||
    f?.includes("projeção") || f?.includes("projecao") ||
    f?.includes("câmera") || f?.includes("camera") ||
    f?.includes("técnico") || f?.includes("tecnico") ||
    f?.includes("mesa") || f?.includes("live")
  );

  const hasTechAccess = isAdmin || isTechMember;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "som": return Radio;
      case "midia": return Monitor;
      case "transmissao": return Tv;
      default: return Monitor;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "som": return "Mesa de Som";
      case "midia": return "Media/Projeção";
      case "transmissao": return "Transmissão/Live";
      default: return role;
    }
  };

  const resetMemberForm = () => {
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberPrimaryFunctionId("");
    setNewMemberSecondaryFunctionIds([]);
    setNewMemberUserId("");
    setNewMemberPhotoUrl("");
    setSelectedMember(null);
  };

  const resetScheduleForm = () => {
    setFormDate("");
    setFormType("");
    setSelectedSom([]);
    setSelectedMidia([]);
    setSelectedTransmissao([]);
    setSelectedSchedule(null);
    setIsEditing(false);
  };

  const handleGeneralScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const team_assignments: { member_id: string; role: string; instrument?: string }[] = [];

    selectedSom.forEach(id => team_assignments.push({ member_id: id, role: "som" }));
    selectedMidia.forEach(id => team_assignments.push({ member_id: id, role: "midia" }));
    selectedTransmissao.forEach(id => team_assignments.push({ member_id: id, role: "transmissao" }));

    if (isEditing && selectedSchedule) {
      await updateGeneralSchedule.mutateAsync({
        id: selectedSchedule.id,
        date: formDate,
        type: formType,
        team_assignments,
      });
    } else {
      await createGeneralSchedule.mutateAsync({
        date: formDate,
        type: formType,
        team_assignments,
      });
    }

    setIsDialogOpen(false);
    resetScheduleForm();
  };

  const handleEditGeneralSchedule = (schedule: GeneralSchedule) => {
    setSelectedSchedule(schedule);
    setFormDate(schedule.date);
    setFormType(schedule.type);

    const teamMembers = schedule.team_members || [];
    setSelectedSom(teamMembers.filter(tm => tm.role === "som").map(tm => tm.member_id));
    setSelectedMidia(teamMembers.filter(tm => tm.role === "midia").map(tm => tm.member_id));
    setSelectedTransmissao(teamMembers.filter(tm => tm.role === "transmissao").map(tm => tm.member_id));

    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const toggleTechMember = (list: string[], setList: (val: string[]) => void, memberId: string) => {
    if (list.includes(memberId)) {
      setList(list.filter(id => id !== memberId));
    } else {
      setList([...list, memberId]);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPrimaryFunctionId) return;

    await createMember.mutateAsync({
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      user_id: newMemberUserId || undefined,
      photo_url: newMemberPhotoUrl.trim() || undefined,
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
      user_id: newMemberUserId || null,
      photo_url: newMemberPhotoUrl.trim() || null,
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
    setNewMemberUserId(member.user_id || "");
    setNewMemberPhotoUrl(member.photo_url || "");
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
    } else if (deleteType === "schedule") {
      await deleteGeneralSchedule.mutateAsync(deleteItemId);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      setNewMemberPhotoUrl(publicUrl);
      toast({ title: "Foto carregada com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao carregar foto", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendWhatsApp = (schedule: GeneralSchedule) => {
    const somMembers = schedule.team_members?.filter(tm => tm.role === "som") || [];
    const midiaMembers = schedule.team_members?.filter(tm => tm.role === "midia") || [];
    const transmissaoMembers = schedule.team_members?.filter(tm => tm.role === "transmissao") || [];

    let assignments = "";
    if (somMembers.length > 0) {
      assignments += `🎛️ *Som:*\n${somMembers.map(tm => `• ${tm.member?.name || "N/A"}`).join("\n")}\n\n`;
    }
    if (midiaMembers.length > 0) {
      assignments += `📺 *Media:*\n${midiaMembers.map(tm => `• ${tm.member?.name || "N/A"}`).join("\n")}\n\n`;
    }
    if (transmissaoMembers.length > 0) {
      assignments += `🎥 *Transmissão/Live:*\n${transmissaoMembers.map(tm => `• ${tm.member?.name || "N/A"}`).join("\n")}\n\n`;
    }

    const message = `📅 *Escala Técnica*\n\n📆 Data: ${format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: pt })}\n🕐 Tipo: ${schedule.type}\n\n${assignments}\n\n🙏 Contamos com sua presença!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    toast({
      title: "WhatsApp aberto!",
      description: "A mensagem foi preparada para envio.",
    });
  };

  const filteredMembers = techMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (isAdmin) return matchesSearch;

    // For non-admins, only show members who share at least one tech role group
    const mFunctions = [
      m.primary_function?.name.toLowerCase(),
      ...(m.secondary_functions?.map(sf => sf.function?.name.toLowerCase()) || [])
    ].filter(Boolean);

    const mIsTech = mFunctions.some(f =>
      f?.includes("som") || f?.includes("media") || f?.includes("midia") ||
      f?.includes("transmissão") || f?.includes("transmissao") ||
      f?.includes("projeção") || f?.includes("projecao") ||
      f?.includes("câmera") || f?.includes("camera") ||
      f?.includes("técnico") || f?.includes("tecnico") ||
      f?.includes("mesa") || f?.includes("live")
    );

    if (isTechMember && mIsTech) return matchesSearch;
    if (m.user_id === currentUser?.id) return matchesSearch;

    return false;
  });

  if (membersLoading || functionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasTechAccess && !membersLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <Monitor className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground">
          Não possui habilidades técnicas (som, media, etc.) vinculadas ao seu perfil.
          Entre em contacto com um administrador para configurar seu acesso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Mesa de Som & Media
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a equipa técnica de som, transmissão e projeção
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
          {isAdmin && (
            <TabsTrigger value="functions" className="gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Funções</span>
            </TabsTrigger>
          )}
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
            {isAdmin && (
              <Button onClick={() => { resetMemberForm(); setIsNewMemberDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Integrante
              </Button>
            )}
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum integrante encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione integrantes com funções técnicas (Som, Media, etc.)
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
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-semibold text-secondary">
                          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      )}
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
                  {isAdmin && (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Escalas com Equipa Técnica
            </h2>
            {isAdmin && (
              <Button onClick={() => { resetScheduleForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Escala
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 justify-center">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-display text-xl font-semibold text-foreground min-w-[200px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: pt })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card rounded-xl shadow-soft p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const schedule = getScheduleForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors ${schedule
                      ? 'bg-primary/20 hover:bg-primary/30 cursor-pointer'
                      : 'hover:bg-muted/50'
                      } ${isToday ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => schedule && handleEditGeneralSchedule(schedule)}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, "d")}
                    </span>
                    {schedule && (
                      <div className="mt-1 w-full">
                        <div className="text-[10px] text-primary font-medium truncate text-center">
                          {schedule.type.split(' ')[0]}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {techSchedules.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma escala encontrada</h3>
              <p className="text-muted-foreground">
                As escalas com equipa técnica aparecerão aqui quando forem criadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {techSchedules
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .filter(s => isSameMonth(new Date(s.date), currentMonth))
                .map((schedule) => {
                  const somAssignments = schedule.team_members?.filter(tm => tm.role === "som") || [];
                  const midiaAssignments = schedule.team_members?.filter(tm => tm.role === "midia") || [];
                  const transmissaoAssignments = schedule.team_members?.filter(tm => tm.role === "transmissao") || [];

                  return (
                    <div
                      key={schedule.id}
                      className="bg-card rounded-xl shadow-soft p-6 hover:shadow-card transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: pt })}
                          </h3>
                          <span className="text-muted-foreground">{schedule.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(schedule)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditGeneralSchedule(schedule)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => { setDeleteItemId(schedule.id); setDeleteType("schedule"); }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {somAssignments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Radio className="w-4 h-4 text-orange-500" />
                              Som
                            </span>
                            {somAssignments.map((tm) => (
                              <div key={tm.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 ml-6">
                                <span className="text-sm text-foreground">{tm.member?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {midiaAssignments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-blue-500" />
                              Media
                            </span>
                            {midiaAssignments.map((tm) => (
                              <div key={tm.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 ml-6">
                                <span className="text-sm text-foreground">{tm.member?.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {transmissaoAssignments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Tv className="w-4 h-4 text-purple-500" />
                              Transmissão/Live
                            </span>
                            {transmissaoAssignments.map((tm) => (
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

      {/* New Member Dialog */}
      <Dialog open={isNewMemberDialogOpen} onOpenChange={(open) => { setIsNewMemberDialogOpen(open); if (!open) resetMemberForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Foto</label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="upload" className="text-xs">Ficheiro</TabsTrigger>
                  <TabsTrigger value="link" className="text-xs">Link da Foto</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs"
                    disabled={isUploading}
                  />
                </TabsContent>
                <TabsContent value="link">
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={newMemberPhotoUrl}
                    onChange={(e) => setNewMemberPhotoUrl(e.target.value)}
                    className="text-xs"
                  />
                </TabsContent>
              </Tabs>
              {isUploading && <div className="text-xs text-muted-foreground animate-pulse">Carregando...</div>}
              {newMemberPhotoUrl && (
                <div className="mt-2 flex justify-center">
                  <img src={newMemberPhotoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
                </div>
              )}
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Utilizador Associado (Opcional)</label>
                <Select value={newMemberUserId} onValueChange={setNewMemberUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um utilizador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.user_id}>{profile.full_name || 'Sem nome'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Foto</label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="upload" className="text-xs">Ficheiro</TabsTrigger>
                  <TabsTrigger value="link" className="text-xs">Link da Foto</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs"
                    disabled={isUploading}
                  />
                </TabsContent>
                <TabsContent value="link">
                  <Input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={newMemberPhotoUrl}
                    onChange={(e) => setNewMemberPhotoUrl(e.target.value)}
                    className="text-xs"
                  />
                </TabsContent>
              </Tabs>
              {isUploading && <div className="text-xs text-muted-foreground animate-pulse">Carregando...</div>}
              {newMemberPhotoUrl && (
                <div className="mt-2 flex justify-center">
                  <img src={newMemberPhotoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
                </div>
              )}
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Utilizador Associado (Opcional)</label>
                <Select value={newMemberUserId} onValueChange={setNewMemberUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um utilizador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.user_id}>{profile.full_name || 'Sem nome'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                {updateMember.isPending ? "Salvando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Function Dialog */}
      <Dialog open={isNewFunctionDialogOpen} onOpenChange={setIsNewFunctionDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              Tem certeza que deseja excluir este {deleteType === "member" ? "integrante" : deleteType === "function" ? "função" : "escala"}? Esta ação não pode ser desfeita.
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

      {/* Add/Edit Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetScheduleForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {isEditing ? "Editar Escala Técnica" : "Nova Escala Técnica"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGeneralScheduleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data *</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo *</label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Som */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4 text-orange-500" />
                Som
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {somMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`som-${member.id}`}
                      checked={selectedSom.includes(member.id)}
                      onCheckedChange={() => toggleTechMember(selectedSom, setSelectedSom, member.id)}
                    />
                    <label htmlFor={`som-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Media */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                Media
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {midiaMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`midia-${member.id}`}
                      checked={selectedMidia.includes(member.id)}
                      onCheckedChange={() => toggleTechMember(selectedMidia, setSelectedMidia, member.id)}
                    />
                    <label htmlFor={`midia-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Transmissão/Live */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Tv className="w-4 h-4 text-purple-500" />
                Transmissão/Live
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {techMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`transmissao-${member.id}`}
                      checked={selectedTransmissao.includes(member.id)}
                      onCheckedChange={() => toggleTechMember(selectedTransmissao, setSelectedTransmissao, member.id)}
                    />
                    <label htmlFor={`transmissao-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>



            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetScheduleForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createGeneralSchedule.isPending || updateGeneralSchedule.isPending}>
                {createGeneralSchedule.isPending || updateGeneralSchedule.isPending ? "Salvando..." : isEditing ? "Guardar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
