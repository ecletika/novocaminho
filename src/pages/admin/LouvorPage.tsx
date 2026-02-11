import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Music, Users, Calendar, Mic, Trash2, Edit, Eye, Upload, Settings, ChevronLeft, ChevronRight, Phone, Share2, Youtube, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useWorshipMembers,
  useCreateWorshipMember,
  useUpdateWorshipMember,
  useDeleteWorshipMember,
  useWorshipSongs,
  useCreateWorshipSong,
  useUpdateWorshipSong,
  useDeleteWorshipSong,
  useSongMinisterAssignments,
  useCreateSongMinisterAssignment,
  useDeleteSongMinisterAssignment,
  useWorshipSchedules,
  useCreateWorshipSchedule,
  useUpdateWorshipSchedule,
  useDeleteWorshipSchedule,
  useWorshipFunctions,
  useCreateWorshipFunction,
  useDeleteWorshipFunction,
  uploadMemberPhoto,
  WorshipSong,
  WorshipSchedule,
  WorshipMember,
} from "@/hooks/useWorship";
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const MUSICAL_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function LouvorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinisterId, setSelectedMinisterId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dialog states
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [isNewSongDialogOpen, setIsNewSongDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorshipMember | null>(null);
  const [isNewScheduleDialogOpen, setIsNewScheduleDialogOpen] = useState(false);
  const [isAssignSongDialogOpen, setIsAssignSongDialogOpen] = useState(false);
  const [isNewFunctionDialogOpen, setIsNewFunctionDialogOpen] = useState(false);
  const [isViewLyricsDialogOpen, setIsViewLyricsDialogOpen] = useState(false);
  const [isEditSongDialogOpen, setIsEditSongDialogOpen] = useState(false);
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);

  // Delete dialog states
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"member" | "song" | "minister" | "schedule" | "assignment" | "function" | null>(null);

  // View/Edit states
  const [selectedSong, setSelectedSong] = useState<WorshipSong | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<WorshipSchedule | null>(null);

  // Form states - Member
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPhoto, setNewMemberPhoto] = useState<File | null>(null);
  const [newMemberPhotoPreview, setNewMemberPhotoPreview] = useState<string | null>(null);
  const [newMemberPrimaryFunctionId, setNewMemberPrimaryFunctionId] = useState("");
  const [newMemberSecondaryFunctionIds, setNewMemberSecondaryFunctionIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - Song
  const [newSongName, setNewSongName] = useState("");
  const [newSongKey, setNewSongKey] = useState("");
  const [newSongLyrics, setNewSongLyrics] = useState("");
  const [newSongContentType, setNewSongContentType] = useState<"cifra" | "letra">("cifra");
  const [newSongYoutubeUrl, setNewSongYoutubeUrl] = useState("");
  const [newSongMinisterId, setNewSongMinisterId] = useState("");
  const [newSongMinisterKey, setNewSongMinisterKey] = useState("");

  // Form states - Edit Song
  const [editSongName, setEditSongName] = useState("");
  const [editSongKey, setEditSongKey] = useState("");
  const [editSongLyrics, setEditSongLyrics] = useState("");
  const [editSongContentType, setEditSongContentType] = useState<"cifra" | "letra">("cifra");
  const [editSongYoutubeUrl, setEditSongYoutubeUrl] = useState("");

  // Form states - Schedule
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [newScheduleMinisterId, setNewScheduleMinisterId] = useState("");
  const [newScheduleVocalistIds, setNewScheduleVocalistIds] = useState<string[]>([]);
  const [newScheduleTecladoId, setNewScheduleTecladoId] = useState("");
  const [newScheduleViolaoId, setNewScheduleViolaoId] = useState("");
  const [newScheduleBateriaId, setNewScheduleBateriaId] = useState("");

  // Form states - Assignment
  const [assignSongId, setAssignSongId] = useState("");
  const [assignMinisterId, setAssignMinisterId] = useState("");
  const [assignKey, setAssignKey] = useState("");

  // Form states - Function
  const [newFunctionName, setNewFunctionName] = useState("");

  // Queries
  const { data: members = [], isLoading: membersLoading } = useWorshipMembers();
  const { data: songs = [], isLoading: songsLoading } = useWorshipSongs();
  const { data: assignments = [] } = useSongMinisterAssignments();
  const { data: schedules = [] } = useWorshipSchedules();
  const { data: functions = [], isLoading: functionsLoading } = useWorshipFunctions();

  // Form states - Minister (using members with Ministrante function)
  const ministranteFunctionId = functions.find(f => f.name.toLowerCase().includes("ministrante"))?.id;
  const ministers = members.filter(m => 
    m.primary_function_id === ministranteFunctionId ||
    m.secondary_functions?.some(sf => sf.function_id === ministranteFunctionId)
  );

  // Mutations
  const createMember = useCreateWorshipMember();
  const updateMember = useUpdateWorshipMember();
  const deleteMember = useDeleteWorshipMember();
  const createSong = useCreateWorshipSong();
  const updateSong = useUpdateWorshipSong();
  const deleteSong = useDeleteWorshipSong();
  const createAssignment = useCreateSongMinisterAssignment();
  const deleteAssignment = useDeleteSongMinisterAssignment();
  const createSchedule = useCreateWorshipSchedule();
  const updateSchedule = useUpdateWorshipSchedule();
  const deleteSchedule = useDeleteWorshipSchedule();
  const createFunction = useCreateWorshipFunction();
  const deleteFunction = useDeleteWorshipFunction();

  // Handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMemberPhoto(file);
      setNewMemberPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPrimaryFunctionId) return;
    
    let photoUrl: string | undefined;
    if (newMemberPhoto) {
      photoUrl = await uploadMemberPhoto(newMemberPhoto);
    }
    
    await createMember.mutateAsync({ 
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      photo_url: photoUrl,
      primary_function_id: newMemberPrimaryFunctionId,
      secondary_function_ids: newMemberSecondaryFunctionIds
    });
    
    resetMemberForm();
    setIsNewMemberDialogOpen(false);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !newMemberName.trim() || !newMemberPrimaryFunctionId) return;
    
    let photoUrl: string | undefined;
    if (newMemberPhoto) {
      photoUrl = await uploadMemberPhoto(newMemberPhoto);
    }
    
    await updateMember.mutateAsync({
      id: selectedMember.id,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      photo_url: photoUrl || selectedMember.photo_url || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      secondary_function_ids: newMemberSecondaryFunctionIds
    });
    
    resetMemberForm();
    setIsEditMemberDialogOpen(false);
  };

  const openEditMemberDialog = (member: WorshipMember) => {
    setSelectedMember(member);
    setNewMemberName(member.name);
    setNewMemberPhone(member.phone || "");
    setNewMemberPhotoPreview(member.photo_url);
    setNewMemberPrimaryFunctionId(member.primary_function_id || "");
    setNewMemberSecondaryFunctionIds(member.secondary_functions?.map(sf => sf.function_id) || []);
    setIsEditMemberDialogOpen(true);
  };

  const resetMemberForm = () => {
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberPhoto(null);
    setNewMemberPhotoPreview(null);
    setNewMemberPrimaryFunctionId("");
    setNewMemberSecondaryFunctionIds([]);
    setSelectedMember(null);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongName.trim() || !newSongKey) return;
    
    const song = await createSong.mutateAsync({ 
      name: newSongName.trim(), 
      original_key: newSongKey,
      lyrics: newSongLyrics || undefined,
      has_chords: newSongContentType === "cifra" && !!newSongLyrics,
      content_type: newSongContentType,
      youtube_url: newSongYoutubeUrl.trim() || undefined
    });

    // If a minister was selected, create the assignment
    if (newSongMinisterId && newSongMinisterKey) {
      await createAssignment.mutateAsync({
        song_id: song.id,
        minister_id: newSongMinisterId,
        key: newSongMinisterKey
      });
    }

    setNewSongName("");
    setNewSongKey("");
    setNewSongLyrics("");
    setNewSongContentType("cifra");
    setNewSongYoutubeUrl("");
    setNewSongMinisterId("");
    setNewSongMinisterKey("");
    setIsNewSongDialogOpen(false);
  };

  const handleEditSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong || !editSongName.trim() || !editSongKey) return;
    
    await updateSong.mutateAsync({
      id: selectedSong.id,
      name: editSongName.trim(),
      original_key: editSongKey,
      lyrics: editSongLyrics || null,
      has_chords: editSongContentType === "cifra" && !!editSongLyrics,
      content_type: editSongContentType,
      youtube_url: editSongYoutubeUrl.trim() || null
    });
    
    setIsEditSongDialogOpen(false);
    setSelectedSong(null);
  };

  const openEditSongDialog = (song: WorshipSong) => {
    setSelectedSong(song);
    setEditSongName(song.name);
    setEditSongKey(song.original_key);
    setEditSongLyrics(song.lyrics || "");
    setEditSongContentType(song.content_type as "cifra" | "letra");
    setEditSongYoutubeUrl((song as any).youtube_url || "");
    setIsEditSongDialogOpen(true);
  };

  const openViewLyricsInNewTab = (song: WorshipSong) => {
    const content = song.lyrics || "Conteúdo não disponível";
    const title = `${song.name} - ${song.content_type === "cifra" ? "Cifra" : "Letra"} (Tom: ${song.original_key})`;
    const youtubeLink = (song as any).youtube_url ? `<p style="margin-bottom:16px"><a href="${(song as any).youtube_url}" target="_blank" style="color:#2563eb;text-decoration:underline">🎬 Assistir no YouTube</a></p>` : '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:monospace;padding:32px;max-width:900px;margin:0 auto;background:#f9fafb}h1{font-size:1.5rem;margin-bottom:8px}pre{white-space:pre-wrap;background:#fff;padding:24px;border-radius:8px;border:1px solid #e5e7eb;font-size:14px;line-height:1.6}</style></head><body><h1>${song.name}</h1><p style="margin-bottom:16px"><span style="background:#e0e7ff;padding:4px 12px;border-radius:999px;font-size:14px">Tom: ${song.original_key}</span></p>${youtubeLink}<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleDate || !newScheduleMinisterId) return;
    
    const musicianAssignments: { member_id: string; instrument: "teclado" | "violao" | "bateria" }[] = [];
    if (newScheduleTecladoId) musicianAssignments.push({ member_id: newScheduleTecladoId, instrument: "teclado" });
    if (newScheduleViolaoId) musicianAssignments.push({ member_id: newScheduleViolaoId, instrument: "violao" });
    if (newScheduleBateriaId) musicianAssignments.push({ member_id: newScheduleBateriaId, instrument: "bateria" });
    
    await createSchedule.mutateAsync({ 
      date: newScheduleDate, 
      minister_id: newScheduleMinisterId,
      vocalist_ids: newScheduleVocalistIds,
      musician_assignments: musicianAssignments
    });
    
    resetScheduleForm();
    setIsNewScheduleDialogOpen(false);
  };

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !newScheduleDate || !newScheduleMinisterId) return;
    
    const musicianAssignments: { member_id: string; instrument: "teclado" | "violao" | "bateria" }[] = [];
    if (newScheduleTecladoId) musicianAssignments.push({ member_id: newScheduleTecladoId, instrument: "teclado" });
    if (newScheduleViolaoId) musicianAssignments.push({ member_id: newScheduleViolaoId, instrument: "violao" });
    if (newScheduleBateriaId) musicianAssignments.push({ member_id: newScheduleBateriaId, instrument: "bateria" });
    
    await updateSchedule.mutateAsync({
      id: selectedSchedule.id,
      date: newScheduleDate,
      minister_id: newScheduleMinisterId,
      vocalist_ids: newScheduleVocalistIds,
      musician_assignments: musicianAssignments
    });
    
    resetScheduleForm();
    setIsEditScheduleDialogOpen(false);
    setSelectedSchedule(null);
  };

  const resetScheduleForm = () => {
    setNewScheduleDate("");
    setNewScheduleMinisterId("");
    setNewScheduleVocalistIds([]);
    setNewScheduleTecladoId("");
    setNewScheduleViolaoId("");
    setNewScheduleBateriaId("");
  };

  const openEditScheduleDialog = (schedule: WorshipSchedule) => {
    setSelectedSchedule(schedule);
    setNewScheduleDate(schedule.date);
    setNewScheduleMinisterId(schedule.minister_id || "");
    setNewScheduleVocalistIds(schedule.vocalists?.map(v => v.member_id) || []);
    
    const teclado = schedule.musicians?.find(m => m.instrument === "teclado");
    const violao = schedule.musicians?.find(m => m.instrument === "violao");
    const bateria = schedule.musicians?.find(m => m.instrument === "bateria");
    
    setNewScheduleTecladoId(teclado?.member_id || "");
    setNewScheduleViolaoId(violao?.member_id || "");
    setNewScheduleBateriaId(bateria?.member_id || "");
    
    setIsEditScheduleDialogOpen(true);
  };

  const handleAssignSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSongId || !assignMinisterId || !assignKey) return;
    
    await createAssignment.mutateAsync({ 
      song_id: assignSongId, 
      minister_id: assignMinisterId, 
      key: assignKey 
    });
    setAssignSongId("");
    setAssignMinisterId("");
    setAssignKey("");
    setIsAssignSongDialogOpen(false);
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
    
    switch (deleteType) {
      case "member":
        await deleteMember.mutateAsync(deleteItemId);
        break;
      case "song":
        await deleteSong.mutateAsync(deleteItemId);
        break;
      case "schedule":
        await deleteSchedule.mutateAsync(deleteItemId);
        break;
      case "assignment":
        await deleteAssignment.mutateAsync(deleteItemId);
        break;
      case "function":
        await deleteFunction.mutateAsync(deleteItemId);
        break;
    }
    
    setDeleteItemId(null);
    setDeleteType(null);
  };

  const openDeleteDialog = (id: string, type: typeof deleteType) => {
    setDeleteItemId(id);
    setDeleteType(type);
  };

  const toggleSecondaryFunction = (functionId: string) => {
    setNewMemberSecondaryFunctionIds(prev => 
      prev.includes(functionId) 
        ? prev.filter(id => id !== functionId)
        : [...prev, functionId]
    );
  };

  const toggleVocalist = (memberId: string) => {
    setNewScheduleVocalistIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Filter songs by selected minister
  const ministerSongs = selectedMinisterId 
    ? assignments.filter(a => a.minister_id === selectedMinisterId)
    : [];

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSongs = songs.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const shareScheduleWhatsApp = (schedule: WorshipSchedule) => {
    const dateStr = format(new Date(schedule.date), "EEEE, d 'de' MMMM", { locale: ptBR });
    let msg = `🎵 *Escala de Louvor*\n📅 ${dateStr}\n`;
    if (schedule.minister?.name) msg += `🎤 *Ministrante:* ${schedule.minister.name}\n`;
    if (schedule.vocalists && schedule.vocalists.length > 0) {
      msg += `\n🎶 *Vocais:*\n`;
      schedule.vocalists.forEach(v => { msg += `  • ${v.member?.name || ""}\n`; });
    }
    if (schedule.musicians && schedule.musicians.length > 0) {
      msg += `\n🎸 *Músicos:*\n`;
      schedule.musicians.forEach(m => { msg += `  • ${m.member?.name || ""} (${m.instrument})\n`; });
    }
    msg += `\n_Deus abençoe o nosso louvor!_ 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Ministério de Louvor</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie integrantes, músicas, ministrantes, escalas e funções
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Integrantes</span>
          </TabsTrigger>
          <TabsTrigger value="songs" className="gap-2">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Músicas</span>
          </TabsTrigger>
          <TabsTrigger value="ministers" className="gap-2">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Ministrantes</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Escalas</span>
          </TabsTrigger>
          <TabsTrigger value="functions" className="gap-2">
            <Settings className="w-4 h-4" />
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
            <Dialog open={isNewMemberDialogOpen} onOpenChange={setIsNewMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Integrante
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Adicionar Integrante</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                  <div className="flex flex-col items-center gap-4">
                    <div 
                      className="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {newMemberPhotoPreview ? (
                        <img src={newMemberPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Escolher Foto
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                    <Input 
                      placeholder="Nome completo" 
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                    <Input 
                      placeholder="Ex: +5511999999999" 
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Função Principal *</label>
                    <Select value={newMemberPrimaryFunctionId} onValueChange={setNewMemberPrimaryFunctionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {functions.map((func) => (
                          <SelectItem key={func.id} value={func.id}>{func.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Funções Secundárias</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {functions
                        .filter(f => f.id !== newMemberPrimaryFunctionId)
                        .map((func) => (
                          <div key={func.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`func-${func.id}`}
                              checked={newMemberSecondaryFunctionIds.includes(func.id)}
                              onCheckedChange={() => toggleSecondaryFunction(func.id)}
                            />
                            <label htmlFor={`func-${func.id}`} className="text-sm">{func.name}</label>
                          </div>
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
          </div>

          {membersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum integrante encontrado</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-card rounded-xl shadow-soft p-4 hover:shadow-card transition-all text-center group relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditMemberDialog(member)}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDeleteDialog(member.id, "member")}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold text-primary text-lg">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm truncate">{member.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {member.primary_function?.name || "Sem função"}
                  </p>
                  {member.phone && (
                    <a href={`https://wa.me/${member.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <Phone className="w-3 h-3" />
                      {member.phone}
                    </a>
                  )}
                  <span className={`inline-block w-2 h-2 rounded-full mt-2 ${member.active ? 'bg-green-500' : 'bg-muted'}`} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar músicas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9" 
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={isAssignSongDialogOpen} onOpenChange={setIsAssignSongDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Mic className="w-4 h-4 mr-2" />
                    Associar a Ministrante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Associar Música a Ministrante</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssignSong} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Música *</label>
                      <Select value={assignSongId} onValueChange={setAssignSongId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a música" />
                        </SelectTrigger>
                        <SelectContent>
                          {songs.map((song) => (
                            <SelectItem key={song.id} value={song.id}>{song.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Ministrante *</label>
                      <Select value={assignMinisterId} onValueChange={setAssignMinisterId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ministrante" />
                        </SelectTrigger>
                        <SelectContent>
                          {ministers.map((minister) => (
                            <SelectItem key={minister.id} value={minister.id}>{minister.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Tom *</label>
                      <Select value={assignKey} onValueChange={setAssignKey}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tom" />
                        </SelectTrigger>
                        <SelectContent>
                          {MUSICAL_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAssignSongDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createAssignment.isPending}>
                        {createAssignment.isPending ? "Associando..." : "Associar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isNewSongDialogOpen} onOpenChange={setIsNewSongDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Música
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Adicionar Música</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSong} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Nome da Música *</label>
                        <Input 
                          placeholder="Nome do hino" 
                          value={newSongName}
                          onChange={(e) => setNewSongName(e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tom Original *</label>
                        <Select value={newSongKey} onValueChange={setNewSongKey}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {MUSICAL_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>{key}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Conteúdo *</label>
                        <Select value={newSongContentType} onValueChange={(v) => setNewSongContentType(v as "cifra" | "letra")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cifra">Cifra</SelectItem>
                            <SelectItem value="letra">Letra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Ministrante (opcional)</label>
                        <Select value={newSongMinisterId} onValueChange={setNewSongMinisterId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ministers.map((minister) => (
                              <SelectItem key={minister.id} value={minister.id}>{minister.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {newSongMinisterId && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tom para o Ministrante</label>
                        <Select value={newSongMinisterKey} onValueChange={setNewSongMinisterKey}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {MUSICAL_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>{key}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Link do YouTube (opcional)</label>
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={newSongYoutubeUrl}
                        onChange={(e) => setNewSongYoutubeUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Cifra / Letra</label>
                      <Textarea 
                        placeholder="Cole aqui a cifra ou letra..." 
                        rows={8}
                        value={newSongLyrics}
                        onChange={(e) => setNewSongLyrics(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewSongDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createSong.isPending}>
                        {createSong.isPending ? "Adicionando..." : "Adicionar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {songsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma música encontrada</div>
          ) : (
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Música</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Tom Original</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Ministrantes</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Cifra / Letra</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSongs.map((song) => {
                      const songAssignments = assignments.filter(a => a.song_id === song.id);
                      return (
                        <tr 
                          key={song.id} 
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => song.lyrics && openViewLyricsInNewTab(song)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <Music className="w-5 h-5 text-secondary" />
                              </div>
                              <span className="font-medium text-foreground">{song.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {song.original_key}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {songAssignments.length > 0 ? (
                                songAssignments.map(a => (
                                  <span key={a.id} className="px-2 py-1 rounded bg-secondary/10 text-secondary-foreground text-xs">
                                    {a.minister?.name} ({a.key})
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm px-2 py-1 rounded ${song.lyrics ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                              {song.lyrics ? (song.content_type === "cifra" ? "Cifra" : "Letra") : "Pendente"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {(song as any).youtube_url && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => window.open((song as any).youtube_url, '_blank')}
                                  title="Assistir no YouTube"
                                >
                                  <Youtube className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                              {song.lyrics && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openViewLyricsInNewTab(song)}
                                  title="Abrir cifra em tela inteira"
                                >
                                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditSongDialog(song)}
                              >
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openDeleteDialog(song.id, "song")}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Ministers Tab */}
        <TabsContent value="ministers" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedMinisterId || ""} onValueChange={(v) => setSelectedMinisterId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ministrante para ver suas músicas" />
                </SelectTrigger>
                <SelectContent>
                  {ministers.map((minister) => (
                    <SelectItem key={minister.id} value={minister.id}>{minister.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground self-center">
              Ministrantes são membros com a função "Ministrante". Adicione-os na aba Membros.
            </p>
          </div>

          {/* Ministers list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membersLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Carregando...</div>
            ) : ministers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Nenhum ministrante cadastrado. Adicione membros com a função "Ministrante" na aba Membros.</div>
            ) : (
              ministers.map((minister) => {
                const ministerAssignments = assignments.filter(a => a.minister_id === minister.id);
                return (
                  <div 
                    key={minister.id} 
                    className={`bg-card rounded-xl shadow-soft p-5 hover:shadow-card transition-all cursor-pointer ${
                      selectedMinisterId === minister.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedMinisterId(minister.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mic className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{minister.name}</h3>
                        <p className="text-sm text-muted-foreground">{ministerAssignments.length} músicas</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(minister.id, "minister");
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected minister's songs */}
          {selectedMinisterId && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Músicas de {ministers.find(m => m.id === selectedMinisterId)?.name}
              </h2>
              {ministerSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-card rounded-xl">
                  Nenhuma música associada a este ministrante
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Música</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Tom</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Tipo</th>
                          <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ministerSongs.map((assignment) => (
                          <tr 
                            key={assignment.id} 
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => assignment.song?.lyrics && openViewLyricsInNewTab(assignment.song)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                  <Music className="w-5 h-5 text-secondary" />
                                </div>
                                <span className="font-medium text-foreground">{assignment.song?.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {assignment.key}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm px-2 py-1 rounded ${assignment.song?.lyrics ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                {assignment.song?.lyrics ? (assignment.song.content_type === "cifra" ? "Cifra" : "Letra") : "Pendente"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {assignment.song?.lyrics && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => assignment.song && openViewLyricsInNewTab(assignment.song)}
                                  >
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                )}
                                {assignment.song && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => assignment.song && openEditSongDialog(assignment.song)}
                                  >
                                    <Edit className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openDeleteDialog(assignment.id, "assignment")}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
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
            <Dialog open={isNewScheduleDialogOpen} onOpenChange={setIsNewScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Escala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Criar Nova Escala</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSchedule} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Data *</label>
                    <Input 
                      type="date" 
                      value={newScheduleDate}
                      onChange={(e) => setNewScheduleDate(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ministrante *</label>
                    <Select value={newScheduleMinisterId} onValueChange={setNewScheduleMinisterId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ministrante" />
                      </SelectTrigger>
                      <SelectContent>
                        {ministers.map((minister) => (
                          <SelectItem key={minister.id} value={minister.id}>{minister.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Vocais</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`vocalist-${member.id}`}
                            checked={newScheduleVocalistIds.includes(member.id)}
                            onCheckedChange={() => toggleVocalist(member.id)}
                          />
                          <label htmlFor={`vocalist-${member.id}`} className="text-sm">{member.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Teclado</label>
                      <Select value={newScheduleTecladoId} onValueChange={setNewScheduleTecladoId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Violão</label>
                      <Select value={newScheduleViolaoId} onValueChange={setNewScheduleViolaoId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Bateria</label>
                      <Select value={newScheduleBateriaId} onValueChange={setNewScheduleBateriaId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsNewScheduleDialogOpen(false); resetScheduleForm(); }}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createSchedule.isPending}>
                      {createSchedule.isPending ? "Criando..." : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
              {/* Empty cells for days before month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="aspect-square" />
              ))}
              {/* Days of the month */}
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
                    onClick={() => schedule && openEditScheduleDialog(schedule)}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, "d")}
                    </span>
                    {schedule && (
                      <div className="mt-1 w-full">
                        <div className="text-[10px] text-primary font-medium truncate text-center">
                          {schedule.minister?.name?.split(' ')[0]}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Escalas de {format(currentMonth, "MMMM", { locale: ptBR })}
            </h3>
            {schedulesInMonth.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-card rounded-xl">
                Nenhuma escala neste mês
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {schedulesInMonth
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((schedule) => (
                    <div key={schedule.id} className="bg-card rounded-xl shadow-soft p-5 hover:shadow-card transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {format(new Date(schedule.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mic className="w-4 h-4 text-primary" />
                            <span className="text-primary font-medium">{schedule.minister?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => shareScheduleWhatsApp(schedule)}
                            title="Compartilhar por WhatsApp"
                          >
                            <Share2 className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditScheduleDialog(schedule)}
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(schedule.id, "schedule")}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {schedule.vocalists && schedule.vocalists.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground">Vocais:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schedule.vocalists.map((v) => (
                                <span key={v.id} className="px-2 py-1 rounded bg-secondary/10 text-secondary-foreground text-xs">
                                  {v.member?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {schedule.musicians && schedule.musicians.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground">Músicos:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schedule.musicians.map((m) => (
                                <span key={m.id} className="px-2 py-1 rounded bg-accent/10 text-accent-foreground text-xs">
                                  {m.member?.name} ({m.instrument})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Functions Tab */}
        <TabsContent value="functions" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Funções</h2>
            <Dialog open={isNewFunctionDialogOpen} onOpenChange={setIsNewFunctionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Função
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Adicionar Função</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFunction} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome da Função *</label>
                    <Input 
                      placeholder="Ex: Vocal, Guitarra, Teclado" 
                      value={newFunctionName}
                      onChange={(e) => setNewFunctionName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewFunctionDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createFunction.isPending}>
                      {createFunction.isPending ? "Adicionando..." : "Adicionar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {functionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : functions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma função cadastrada</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {functions.map((func) => (
                <div key={func.id} className="bg-card rounded-xl shadow-soft p-4 hover:shadow-card transition-all text-center group relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDeleteDialog(func.id, "function")}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{func.name}</h3>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Lyrics Dialog */}
      <Dialog open={isViewLyricsDialogOpen} onOpenChange={setIsViewLyricsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Music className="w-5 h-5" />
              {selectedSong?.name} - {selectedSong?.content_type === "cifra" ? "Cifra" : "Letra"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Tom: {selectedSong?.original_key}
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground bg-muted/30 p-4 rounded-lg">
              {selectedSong?.lyrics || "Conteúdo não disponível"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={isEditSongDialogOpen} onOpenChange={setIsEditSongDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Música</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSong} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome da Música *</label>
                <Input 
                  placeholder="Nome do hino" 
                  value={editSongName}
                  onChange={(e) => setEditSongName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tom Original *</label>
                <Select value={editSongKey} onValueChange={setEditSongKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSICAL_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo de Conteúdo *</label>
              <Select value={editSongContentType} onValueChange={(v) => setEditSongContentType(v as "cifra" | "letra")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cifra">Cifra</SelectItem>
                  <SelectItem value="letra">Letra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Link do YouTube (opcional)</label>
              <Input 
                placeholder="https://youtube.com/watch?v=..." 
                value={editSongYoutubeUrl}
                onChange={(e) => setEditSongYoutubeUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cifra / Letra</label>
              <Textarea 
                placeholder="Cole aqui a cifra ou letra..." 
                rows={8}
                value={editSongLyrics}
                onChange={(e) => setEditSongLyrics(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditSongDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={updateSong.isPending}>
                {updateSong.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditScheduleDialogOpen} onOpenChange={setIsEditScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Escala</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSchedule} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data *</label>
              <Input 
                type="date" 
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ministrante *</label>
              <Select value={newScheduleMinisterId} onValueChange={setNewScheduleMinisterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ministrante" />
                </SelectTrigger>
                <SelectContent>
                  {ministers.map((minister) => (
                    <SelectItem key={minister.id} value={minister.id}>{minister.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vocais</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-vocalist-${member.id}`}
                      checked={newScheduleVocalistIds.includes(member.id)}
                      onCheckedChange={() => toggleVocalist(member.id)}
                    />
                    <label htmlFor={`edit-vocalist-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Teclado</label>
                <Select value={newScheduleTecladoId} onValueChange={setNewScheduleTecladoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Violão</label>
                <Select value={newScheduleViolaoId} onValueChange={setNewScheduleViolaoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bateria</label>
                <Select value={newScheduleBateriaId} onValueChange={setNewScheduleBateriaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsEditScheduleDialogOpen(false); resetScheduleForm(); setSelectedSchedule(null); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={updateSchedule.isPending}>
                {updateSchedule.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={(open) => { setIsEditMemberDialogOpen(open); if (!open) resetMemberForm(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Integrante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {newMemberPhotoPreview ? (
                  <img src={newMemberPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Alterar Foto
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
              <Input 
                placeholder="Nome completo" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
              <Input 
                placeholder="Ex: +5511999999999" 
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Função Principal *</label>
              <Select value={newMemberPrimaryFunctionId} onValueChange={setNewMemberPrimaryFunctionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função principal" />
                </SelectTrigger>
                <SelectContent>
                  {functions.map((func) => (
                    <SelectItem key={func.id} value={func.id}>{func.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Funções Secundárias</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {functions
                  .filter(f => f.id !== newMemberPrimaryFunctionId)
                  .map((func) => (
                    <div key={func.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-func-${func.id}`}
                        checked={newMemberSecondaryFunctionIds.includes(func.id)}
                        onCheckedChange={() => toggleSecondaryFunction(func.id)}
                      />
                      <label htmlFor={`edit-func-${func.id}`} className="text-sm">{func.name}</label>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsEditMemberDialogOpen(false); resetMemberForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={updateMember.isPending}>
                {updateMember.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => { setDeleteItemId(null); setDeleteType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
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
