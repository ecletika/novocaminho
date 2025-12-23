import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Music, Mic, Volume2, Tv } from "lucide-react";
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
import { useSearchParams } from "react-router-dom";
import { useGeneralSchedules, useCreateGeneralSchedule, useUpdateGeneralSchedule, useDeleteGeneralSchedule, GeneralSchedule } from "@/hooks/useGeneralSchedules";
import { useWorshipMembers, useWorshipFunctions } from "@/hooks/useWorship";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const scheduleTypes = ["Culto Domingo", "Culto Quarta", "Culto de Oração", "Evento Especial"];

export default function EscalasPage() {
  const [searchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<GeneralSchedule | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState("");
  const [selectedMinistrantes, setSelectedMinistrantes] = useState<string[]>([]);
  const [selectedLouvor, setSelectedLouvor] = useState<string[]>([]);
  const [selectedMusicos, setSelectedMusicos] = useState<{ member_id: string; instrument: string }[]>([]);
  const [selectedSom, setSelectedSom] = useState<string[]>([]);
  const [selectedMidia, setSelectedMidia] = useState<string[]>([]);

  const { data: schedules = [], isLoading } = useGeneralSchedules();
  const { data: members = [] } = useWorshipMembers();
  const { data: functions = [] } = useWorshipFunctions();
  const createSchedule = useCreateGeneralSchedule();
  const updateSchedule = useUpdateGeneralSchedule();
  const deleteSchedule = useDeleteGeneralSchedule();

  // Open dialog if new=true in URL
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  // Find function IDs
  const ministranteFunctionId = functions.find(f => f.name.toLowerCase().includes("ministrante"))?.id;

  // Get members with Ministrante function (primary or secondary)
  const ministranteMembers = members.filter(m => 
    m.primary_function_id === ministranteFunctionId ||
    m.secondary_functions?.some(sf => sf.function_id === ministranteFunctionId)
  );

  const resetForm = () => {
    setFormDate("");
    setFormType("");
    setSelectedMinistrantes([]);
    setSelectedLouvor([]);
    setSelectedMusicos([]);
    setSelectedSom([]);
    setSelectedMidia([]);
    setSelectedSchedule(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const team_assignments: { member_id: string; role: string; instrument?: string }[] = [];
    
    selectedMinistrantes.forEach(id => team_assignments.push({ member_id: id, role: "ministrante" }));
    selectedLouvor.forEach(id => team_assignments.push({ member_id: id, role: "louvor" }));
    selectedMusicos.forEach(m => team_assignments.push({ member_id: m.member_id, role: "musicos", instrument: m.instrument }));
    selectedSom.forEach(id => team_assignments.push({ member_id: id, role: "som" }));
    selectedMidia.forEach(id => team_assignments.push({ member_id: id, role: "midia" }));
    
    if (isEditing && selectedSchedule) {
      await updateSchedule.mutateAsync({
        id: selectedSchedule.id,
        date: formDate,
        type: formType,
        team_assignments,
      });
    } else {
      await createSchedule.mutateAsync({
        date: formDate,
        type: formType,
        team_assignments,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (schedule: GeneralSchedule) => {
    setSelectedSchedule(schedule);
    setFormDate(schedule.date);
    setFormType(schedule.type);
    
    const teamMembers = schedule.team_members || [];
    setSelectedMinistrantes(teamMembers.filter(tm => tm.role === "ministrante").map(tm => tm.member_id));
    setSelectedLouvor(teamMembers.filter(tm => tm.role === "louvor").map(tm => tm.member_id));
    setSelectedMusicos(teamMembers.filter(tm => tm.role === "musicos").map(tm => ({ member_id: tm.member_id, instrument: tm.instrument || "" })));
    setSelectedSom(teamMembers.filter(tm => tm.role === "som").map(tm => tm.member_id));
    setSelectedMidia(teamMembers.filter(tm => tm.role === "midia").map(tm => tm.member_id));
    
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteScheduleId) {
      await deleteSchedule.mutateAsync(deleteScheduleId);
      setDeleteScheduleId(null);
    }
  };

  const toggleMember = (list: string[], setList: (val: string[]) => void, memberId: string) => {
    if (list.includes(memberId)) {
      setList(list.filter(id => id !== memberId));
    } else {
      setList([...list, memberId]);
    }
  };

  const toggleMusician = (memberId: string, instrument: string) => {
    const existing = selectedMusicos.find(m => m.member_id === memberId);
    if (existing) {
      setSelectedMusicos(selectedMusicos.filter(m => m.member_id !== memberId));
    } else {
      setSelectedMusicos([...selectedMusicos, { member_id: memberId, instrument }]);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Escalas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as escalas de cultos e eventos
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Escala
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center gap-4 justify-center">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-display text-xl font-semibold text-foreground min-w-[200px] text-center">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar View */}
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
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors ${
                  schedule 
                    ? 'bg-primary/20 hover:bg-primary/30 cursor-pointer' 
                    : 'hover:bg-muted/50'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
                onClick={() => schedule && handleEdit(schedule)}
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

      {/* Schedule Cards */}
      <div className="grid gap-4">
        {schedulesInMonth.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-xl">
            Nenhuma escala neste mês
          </div>
        ) : (
          schedulesInMonth
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((schedule) => {
              const ministrantes = schedule.team_members?.filter(tm => tm.role === "ministrante") || [];
              const louvor = schedule.team_members?.filter(tm => tm.role === "louvor") || [];
              const musicos = schedule.team_members?.filter(tm => tm.role === "musicos") || [];
              const som = schedule.team_members?.filter(tm => tm.role === "som") || [];
              const midia = schedule.team_members?.filter(tm => tm.role === "midia") || [];
              
              return (
                <div
                  key={schedule.id}
                  className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{schedule.type}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                          <span>{format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(schedule)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => setDeleteScheduleId(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-5 gap-4 mt-4 pt-4 border-t border-border">
                    {ministrantes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Mic className="w-4 h-4 text-primary" />
                          Ministrante
                        </div>
                        <div className="space-y-1">
                          {ministrantes.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {louvor.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Music className="w-4 h-4 text-secondary" />
                          Louvor
                        </div>
                        <div className="space-y-1">
                          {louvor.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {musicos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Music className="w-4 h-4 text-accent" />
                          Músicos
                        </div>
                        <div className="space-y-1">
                          {musicos.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name} {tm.instrument && `(${tm.instrument})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {som.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Volume2 className="w-4 h-4 text-orange-500" />
                          Som
                        </div>
                        <div className="space-y-1">
                          {som.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {midia.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <Tv className="w-4 h-4 text-purple-500" />
                          Mídia
                        </div>
                        <div className="space-y-1">
                          {midia.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {isEditing ? "Editar Escala" : "Criar Nova Escala"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

            {/* Ministrante */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Ministrante
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {ministranteMembers.length > 0 ? (
                  ministranteMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`ministrante-${member.id}`}
                        checked={selectedMinistrantes.includes(member.id)}
                        onCheckedChange={() => toggleMember(selectedMinistrantes, setSelectedMinistrantes, member.id)}
                      />
                      <label htmlFor={`ministrante-${member.id}`} className="text-sm flex items-center gap-2">
                        {member.photo_url && (
                          <img src={member.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        )}
                        {member.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-3">
                    Adicione a função "Ministrante" aos integrantes
                  </p>
                )}
              </div>
            </div>

            {/* Louvor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Music className="w-4 h-4 text-secondary" />
                Louvor
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`louvor-${member.id}`}
                      checked={selectedLouvor.includes(member.id)}
                      onCheckedChange={() => toggleMember(selectedLouvor, setSelectedLouvor, member.id)}
                    />
                    <label htmlFor={`louvor-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Músicos */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Music className="w-4 h-4 text-accent" />
                Músicos
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {members.map((member) => {
                  const selected = selectedMusicos.find(m => m.member_id === member.id);
                  return (
                    <div key={member.id} className="flex items-center gap-4">
                      <Checkbox
                        id={`musico-${member.id}`}
                        checked={!!selected}
                        onCheckedChange={() => {
                          if (selected) {
                            setSelectedMusicos(selectedMusicos.filter(m => m.member_id !== member.id));
                          } else {
                            setSelectedMusicos([...selectedMusicos, { member_id: member.id, instrument: "" }]);
                          }
                        }}
                      />
                      <label htmlFor={`musico-${member.id}`} className="text-sm min-w-[100px]">{member.name}</label>
                      {selected && (
                        <Select 
                          value={selected.instrument} 
                          onValueChange={(v) => {
                            setSelectedMusicos(selectedMusicos.map(m => 
                              m.member_id === member.id ? { ...m, instrument: v } : m
                            ));
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Instrumento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="teclado">Teclado</SelectItem>
                            <SelectItem value="violao">Violão</SelectItem>
                            <SelectItem value="bateria">Bateria</SelectItem>
                            <SelectItem value="baixo">Baixo</SelectItem>
                            <SelectItem value="guitarra">Guitarra</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Som */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-orange-500" />
                Som
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`som-${member.id}`}
                      checked={selectedSom.includes(member.id)}
                      onCheckedChange={() => toggleMember(selectedSom, setSelectedSom, member.id)}
                    />
                    <label htmlFor={`som-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mídia */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Tv className="w-4 h-4 text-purple-500" />
                Mídia
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`midia-${member.id}`}
                      checked={selectedMidia.includes(member.id)}
                      onCheckedChange={() => toggleMember(selectedMidia, setSelectedMidia, member.id)}
                    />
                    <label htmlFor={`midia-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createSchedule.isPending || updateSchedule.isPending}>
                {createSchedule.isPending || updateSchedule.isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
