import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Music, Users, Calendar, Mic, Trash2, Edit, Volume2, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useWorshipFunctions,
  useCreateWorshipFunction,
  useDeleteWorshipFunction,
  uploadMemberPhoto,
  WorshipSong,
  WorshipMember,
} from "@/hooks/useWorship";
import {
  useGeneralSchedules,
  useCreateGeneralSchedule,
  useUpdateGeneralSchedule,
  useDeleteGeneralSchedule,
  GeneralSchedule,
} from "@/hooks/useGeneralSchedules";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles, useMyPermissions } from "@/hooks/useUserPermissions";

// Modular Components
import { MembersTab } from "./louvor/components/MembersTab";
import { SongsTab } from "./louvor/components/SongsTab";
import { MinistersTab } from "./louvor/components/MinistersTab";
import { SchedulesTab } from "./louvor/components/SchedulesTab";
import { FunctionsTab } from "./louvor/components/FunctionsTab";
import { LouvorDialogs } from "./louvor/components/LouvorDialogs";

const MUSICAL_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const scheduleTypes = ["Culto Domingo", "Culto Quarta", "Culto de Oração", "Evento Especial"];

export default function LouvorPage() {
  const { isAdmin: authIsAdmin, user: currentUser } = useAuth();
  const { data: myPermissions = [] } = useMyPermissions();

  const isAdmin = authIsAdmin || myPermissions.includes("louvor") || myPermissions.includes("admin");
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
  const [selectedSchedule, setSelectedSchedule] = useState<GeneralSchedule | null>(null);

  // Form states - Member
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPhotoPreview, setNewMemberPhotoPreview] = useState<string | null>(null);
  const [newMemberPhotoUrl, setNewMemberPhotoUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newMemberPrimaryFunctionId, setNewMemberPrimaryFunctionId] = useState("");
  const [newMemberSecondaryFunctionIds, setNewMemberSecondaryFunctionIds] = useState<string[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState<string>("");

  const [newSongName, setNewSongName] = useState("");
  const [newSongKey, setNewSongKey] = useState("");
  const [newSongLyrics, setNewSongLyrics] = useState("");
  const [newSongContentType, setNewSongContentType] = useState<"cifra" | "letra">("cifra");
  const [newSongYoutubeUrl, setNewSongYoutubeUrl] = useState("");
  const [newSongChordsUrl, setNewSongChordsUrl] = useState("");
  const [newSongMinisterId, setNewSongMinisterId] = useState("");
  const [newSongMinisterKey, setNewSongMinisterKey] = useState("");

  const [editSongName, setEditSongName] = useState("");
  const [editSongKey, setEditSongKey] = useState("");
  const [editSongLyrics, setEditSongLyrics] = useState("");
  const [editSongContentType, setEditSongContentType] = useState<"cifra" | "letra">("cifra");
  const [editSongYoutubeUrl, setEditSongYoutubeUrl] = useState("");
  const [editSongChordsUrl, setEditSongChordsUrl] = useState("");

  const [assignSongId, setAssignSongId] = useState("");
  const [assignMinisterId, setAssignMinisterId] = useState("");
  const [assignKey, setAssignKey] = useState("");

  const [newFunctionName, setNewFunctionName] = useState("");

  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState("");
  const [selectedMinistrantes, setSelectedMinistrantes] = useState<string[]>([]);
  const [selectedLouvor, setSelectedLouvor] = useState<string[]>([]);
  const [selectedMusicos, setSelectedMusicos] = useState<{ member_id: string; instrument: string }[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<{ song_id: string; key: string; sort_order: number }[]>([]);

  // Queries
  const { data: members = [], isLoading: membersLoading } = useWorshipMembers();
  const { data: songs = [], isLoading: songsLoading } = useWorshipSongs();
  const { data: assignments = [] } = useSongMinisterAssignments();
  const { data: profiles = [] } = useProfiles();
  const { data: generalSchedules = [] } = useGeneralSchedules();
  const { data: functions = [], isLoading: functionsLoading } = useWorshipFunctions();

  // Derived variables for access/rendering
  const ministranteFunctionId = useMemo(() => functions.find(f => f.name?.toLowerCase()?.includes("ministrante"))?.id, [functions]);
  const tecladoFunctionId = useMemo(() => functions.find(f => f.name?.toLowerCase()?.includes("teclado"))?.id, [functions]);
  const violaoFunctionId = useMemo(() => functions.find(f => f.name?.toLowerCase()?.includes("violão") || f.name?.toLowerCase()?.includes("violao"))?.id, [functions]);
  const bateriaFunctionId = useMemo(() => functions.find(f => f.name?.toLowerCase()?.includes("bateria"))?.id, [functions]);
  const vocalFunctionId = useMemo(() => functions.find(f => f.name?.toLowerCase()?.includes("vocal") || f.name?.toLowerCase()?.includes("back"))?.id, [functions]);

  const vocalMembers = useMemo(() => 
    members.filter(m => 
      m.primary_function_id === vocalFunctionId ||
      m.secondary_functions?.some(sf => sf.function_id === vocalFunctionId) ||
      m.primary_function_id === ministranteFunctionId ||
      m.secondary_functions?.some(sf => sf.function_id === ministranteFunctionId)
    ),
  [members, vocalFunctionId, ministranteFunctionId]);

  const ministers = useMemo(() => 
    members.filter(m => 
      m.primary_function_id === ministranteFunctionId ||
      m.secondary_functions?.some(sf => sf.function_id === ministranteFunctionId) ||
      m.primary_function?.name?.toLowerCase()?.includes("ministrante") ||
      m.secondary_functions?.some(sf => sf.function?.name?.toLowerCase()?.includes("ministrante"))
    ),
  [members, ministranteFunctionId]);

  const myMemberProfile = useMemo(() => members.find(m => m.user_id === currentUser?.id), [members, currentUser]);
  const myFunctions = useMemo(() => [
    myMemberProfile?.primary_function?.name?.toLowerCase(),
    ...(myMemberProfile?.secondary_functions?.map(sf => sf.function?.name?.toLowerCase()) || [])
  ].filter(Boolean), [myMemberProfile]);

  const isMusician = myFunctions.some(f => ["teclado", "violão", "violao", "bateria", "baixo", "guitarra"].some(instr => f?.toLowerCase()?.includes(instr)));
  const isMinister = myFunctions.some(f => f?.toLowerCase()?.includes("ministrante"));
  const isVocal = myFunctions.some(f => f?.toLowerCase()?.includes("vocal") || f?.toLowerCase()?.includes("back"));
  const hasLouvorAccess = isAdmin || isMusician || isMinister || isVocal;

  // Mutations
  const createMember = useCreateWorshipMember();
  const updateMember = useUpdateWorshipMember();
  const deleteMember = useDeleteWorshipMember();
  const createSong = useCreateWorshipSong();
  const updateSong = useUpdateWorshipSong();
  const deleteSong = useDeleteWorshipSong();
  const createAssignment = useCreateSongMinisterAssignment();
  const deleteAssignment = useDeleteSongMinisterAssignment();
  const createGeneralSchedule = useCreateGeneralSchedule();
  const updateGeneralSchedule = useUpdateGeneralSchedule();
  const deleteGeneralSchedule = useDeleteGeneralSchedule();
  const createFunction = useCreateWorshipFunction();
  const deleteFunction = useDeleteWorshipFunction();

  // Filtered data
  const filteredMembers = useMemo(() => 
    members.filter(m => (m.name || "").toLowerCase().includes(searchTerm.toLowerCase())),
  [members, searchTerm]);

  const filteredSongs = useMemo(() => 
    songs.filter(s => (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())),
  [songs, searchTerm]);

  const ministerSongs = useMemo(() => 
    selectedMinisterId ? assignments.filter(a => a.minister_id === selectedMinisterId) : [],
  [assignments, selectedMinisterId]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const schedulesInMonth = generalSchedules.filter(s => {
    const date = new Date(s.date);
    return isSameMonth(date, currentMonth);
  });

  const getScheduleForDay = (day: Date) => 
    generalSchedules.find(s => isSameDay(new Date(s.date), day));

  // Handlers
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      try {
        const url = await uploadMemberPhoto(file);
        setNewMemberPhotoUrl(url);
        setNewMemberPhotoPreview(url);
      } catch (error: any) {
        toast.error("Erro ao carregar foto: " + error.message);
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPrimaryFunctionId) return;
    await createMember.mutateAsync({
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      photo_url: newMemberPhotoUrl.trim() || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      user_id: newMemberUserId || undefined,
      secondary_function_ids: newMemberSecondaryFunctionIds
    });
    setIsNewMemberDialogOpen(false);
    resetMemberForm();
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !newMemberName.trim() || !newMemberPrimaryFunctionId) return;
    await updateMember.mutateAsync({
      id: selectedMember.id,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      photo_url: newMemberPhotoUrl.trim() || selectedMember.photo_url || undefined,
      primary_function_id: newMemberPrimaryFunctionId,
      user_id: newMemberUserId || null,
      secondary_function_ids: newMemberSecondaryFunctionIds
    });
    setIsEditMemberDialogOpen(false);
    resetMemberForm();
  };

  const resetMemberForm = () => {
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberPhotoPreview(null);
    setNewMemberPhotoUrl("");
    setNewMemberPrimaryFunctionId("");
    setNewMemberSecondaryFunctionIds([]);
    setNewMemberUserId("");
    setSelectedMember(null);
  };

  const openEditMemberDialog = (member: WorshipMember) => {
    setSelectedMember(member);
    setNewMemberName(member.name || "");
    setNewMemberPhone(member.phone || "");
    setNewMemberPhotoPreview(member.photo_url || null);
    setNewMemberPhotoUrl(member.photo_url || "");
    setNewMemberPrimaryFunctionId(member.primary_function_id || "");
    setNewMemberSecondaryFunctionIds(member.secondary_functions?.map(sf => sf.function_id).filter(Boolean) as string[] || []);
    setNewMemberUserId(member.user_id || "");
    setIsEditMemberDialogOpen(true);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongName.trim() || !newSongKey) return;
    const song = await createSong.mutateAsync({
      name: newSongName.trim(),
      original_key: newSongKey,
      lyrics: newSongLyrics || undefined,
      has_chords: (newSongContentType === "cifra" && !!newSongLyrics) || !!newSongChordsUrl,
      content_type: newSongContentType,
      youtube_url: newSongYoutubeUrl.trim() || undefined,
      chords_url: newSongChordsUrl.trim() || undefined
    });
    if (newSongMinisterId && newSongMinisterId !== "none") {
      await createAssignment.mutateAsync({
        song_id: song.id,
        minister_id: newSongMinisterId,
        key: newSongMinisterKey || newSongKey
      });
    }
    setIsNewSongDialogOpen(false);
    setNewSongName("");
    setNewSongKey("");
    setNewSongLyrics("");
    setNewSongYoutubeUrl("");
    setNewSongChordsUrl("");
    setNewSongMinisterId("");
    setNewSongMinisterKey("");
  };

  const handleEditSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong || !editSongName.trim() || !editSongKey) return;
    await updateSong.mutateAsync({
      id: selectedSong.id,
      name: editSongName.trim(),
      original_key: editSongKey,
      lyrics: editSongLyrics || null,
      has_chords: (editSongContentType === "cifra" && !!editSongLyrics) || !!editSongChordsUrl,
      content_type: editSongContentType,
      youtube_url: editSongYoutubeUrl.trim() || null,
      chords_url: editSongChordsUrl.trim() || null
    });
    setIsEditSongDialogOpen(false);
  };

  const openEditSongDialog = (song: WorshipSong) => {
    setSelectedSong(song);
    setEditSongName(song.name);
    setEditSongKey(song.original_key);
    setEditSongLyrics(song.lyrics || "");
    setEditSongContentType(song.content_type);
    setEditSongYoutubeUrl((song as any).youtube_url || "");
    setEditSongChordsUrl((song as any).chords_url || "");
    setIsEditSongDialogOpen(true);
  };

  const handleAssignSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSongId || !assignMinisterId || !assignKey) return;
    await createAssignment.mutateAsync({
      song_id: assignSongId,
      minister_id: assignMinisterId,
      key: assignKey
    });
    setIsAssignSongDialogOpen(false);
    setAssignSongId("");
    setAssignMinisterId("");
    setAssignKey("");
  };

  const resetGeneralScheduleForm = () => {
    setFormDate("");
    setFormType("");
    setSelectedMinistrantes([]);
    setSelectedLouvor([]);
    setSelectedMusicos([]);
    setSelectedSongs([]);
    setSelectedSchedule(null);
  };

  const handleGeneralScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const team_assignments: { member_id: string; role: string; instrument?: string }[] = [];
    selectedMinistrantes.forEach(id => team_assignments.push({ member_id: id, role: "ministrante" }));
    selectedLouvor.forEach(id => team_assignments.push({ member_id: id, role: "louvor" }));
    selectedMusicos.forEach(m => team_assignments.push({ member_id: m.member_id, role: "musicos", instrument: m.instrument }));

    const song_assignments = selectedSongs.map((s, index) => ({
      song_id: s.song_id,
      key: s.key,
      sort_order: index
    }));

    if (selectedSchedule) {
      await updateGeneralSchedule.mutateAsync({
        id: selectedSchedule.id,
        date: formDate,
        type: formType,
        team_assignments,
        song_assignments
      });
    } else {
      await createGeneralSchedule.mutateAsync({
        date: formDate,
        type: formType,
        team_assignments,
        song_assignments
      });
    }
    setIsNewScheduleDialogOpen(false);
    setIsEditScheduleDialogOpen(false);
    resetGeneralScheduleForm();
  };

  const handleEditGeneralSchedule = (schedule: GeneralSchedule) => {
    setSelectedSchedule(schedule);
    setFormDate(schedule.date);
    setFormType(schedule.type);
    const teamMembers = schedule.team_members || [];
    setSelectedMinistrantes(teamMembers.filter(tm => tm.role === "ministrante").map(tm => tm.member_id));
    setSelectedLouvor(teamMembers.filter(tm => tm.role === "louvor").map(tm => tm.member_id));
    setSelectedMusicos(teamMembers.filter(tm => tm.role === "musicos").map(tm => ({ member_id: tm.member_id, instrument: tm.instrument || "" })));
    setSelectedSongs(schedule.songs?.map(s => ({ song_id: s.song_id, key: s.key, sort_order: s.sort_order })) || []);
    setIsEditScheduleDialogOpen(true);
  };

  const handleAddFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunctionName.trim()) return;
    await createFunction.mutateAsync({ name: newFunctionName.trim() });
    setIsNewFunctionDialogOpen(false);
    setNewFunctionName("");
  };

  const openDeleteDialog = (id: string, type: any) => {
    setDeleteItemId(id);
    setDeleteType(type);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId || !deleteType) return;
    try {
      if (deleteType === "member") await deleteMember.mutateAsync(deleteItemId);
      if (deleteType === "song") await deleteSong.mutateAsync(deleteItemId);
      if (deleteType === "minister" || deleteType === "assignment") await deleteAssignment.mutateAsync(deleteItemId);
      if (deleteType === "schedule") await deleteGeneralSchedule.mutateAsync(deleteItemId);
      if (deleteType === "function") await deleteFunction.mutateAsync(deleteItemId);
      toast.success("Eliminado com sucesso");
    } catch (error: any) {
      toast.error("Erro ao eliminar: " + error.message);
    } finally {
      setDeleteItemId(null);
      setDeleteType(null);
    }
  };

  const shareScheduleWhatsApp = (schedule: GeneralSchedule) => {
    const dateStr = format(new Date(schedule.date), "EEEE, d 'de' MMMM", { locale: pt });
    let msg = `🎵 *Escala de Louvor*\n📅 ${dateStr}\n📍 ${schedule.type}\n`;
    
    const ministrantes = schedule.team_members?.filter(tm => tm.role === "ministrante") || [];
    const louvor = schedule.team_members?.filter(tm => tm.role === "louvor") || [];
    const musicos = schedule.team_members?.filter(tm => tm.role === "musicos") || [];
    
    if (ministrantes.length > 0) {
      msg += `\n🎤 *Ministrante(s):*\n`;
      ministrantes.forEach(m => { msg += `  • ${m.member?.name || ""}\n`; });
    }
    
    if (louvor.length > 0) {
      msg += `\n🎶 *Vocais:*\n`;
      louvor.forEach(v => { msg += `  • ${v.member?.name || ""}\n`; });
    }
    
    if (musicos.length > 0) {
      msg += `\n🎸 *Instrumental:*\n`;
      musicos.forEach(m => { msg += `  • ${m.member?.name || ""} (${m.instrument || ""})\n`; });
    }

    if (schedule.songs && schedule.songs.length > 0) {
      msg += `\n🎼 *Repertório:*\n`;
      schedule.songs.forEach((ss, idx) => {
        msg += `${idx + 1}. *${ss.song?.name}* [Tom: ${ss.key}]\n`;
        if (ss.song?.youtube_url) {
          msg += `   🎬 YouTube: ${ss.song.youtube_url}\n`;
        }
        // Link interno da cifra/letra (sem anúncios)
        if (ss.song?.id) {
          msg += `   📝 Cifra: ${window.location.origin}/musica/${ss.song.id}\n`;
        }
      });
    }
    
    msg += `\n_Deus abençoe o nosso louvor!_ 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const openViewLyricsInNewTab = (song: WorshipSong) => {
    window.open(`/musica/${song.id}`, '_blank');
  };

  if (!hasLouvorAccess && !membersLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <Volume2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground">
          Não possui habilidades de louvor vinculadas ao seu perfil.
          Entre em contacto com um administrador para configurar seu acesso.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Mistério de Louvor</h1>
            <p className="text-muted-foreground mt-1 text-lg">Gestão de integrantes, músicas e escalas</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="flex w-full overflow-x-auto gap-1 mb-8 bg-muted/50 p-1.5 rounded-2xl scrollbar-hide flex-nowrap min-h-[52px]">
          <TabsTrigger value="members" className="flex-1 whitespace-nowrap rounded-xl flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Users className="w-4 h-4" /> Integrantes</TabsTrigger>
          <TabsTrigger value="songs" className="flex-1 whitespace-nowrap rounded-xl flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Music className="w-4 h-4" /> Músicas</TabsTrigger>
          <TabsTrigger value="ministers" className="flex-1 whitespace-nowrap rounded-xl flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Mic className="w-4 h-4" /> Ministrantes</TabsTrigger>
          <TabsTrigger value="schedules" className="flex-1 whitespace-nowrap rounded-xl flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Calendar className="w-4 h-4" /> Escalas</TabsTrigger>
          <TabsTrigger value="functions" className="flex-1 whitespace-nowrap rounded-xl flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Settings className="w-4 h-4" /> Funções</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            filteredMembers={filteredMembers} 
            isAdmin={isAdmin} 
            setIsNewMemberDialogOpen={setIsNewMemberDialogOpen} 
            openEditMemberDialog={openEditMemberDialog} 
            openDeleteDialog={openDeleteDialog} 
          />
        </TabsContent>

        <TabsContent value="songs">
          <SongsTab 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            filteredSongs={filteredSongs} 
            assignments={assignments} 
            isAdmin={isAdmin} 
            setIsAssignSongDialogOpen={setIsAssignSongDialogOpen} 
            setIsNewSongDialogOpen={setIsNewSongDialogOpen} 
            openViewLyricsInNewTab={openViewLyricsInNewTab} 
            openEditSongDialog={openEditSongDialog} 
            openDeleteDialog={openDeleteDialog} 
          />
        </TabsContent>

        <TabsContent value="ministers">
          <MinistersTab 
            selectedMinisterId={selectedMinisterId} 
            setSelectedMinisterId={setSelectedMinisterId} 
            ministers={ministers} 
            assignments={assignments} 
            ministerSongs={ministerSongs} 
            membersLoading={membersLoading} 
            openViewLyricsInNewTab={openViewLyricsInNewTab} 
            openEditSongDialog={openEditSongDialog} 
            openDeleteDialog={openDeleteDialog} 
          />
        </TabsContent>

        <TabsContent value="schedules">
          <SchedulesTab 
            isAdmin={isAdmin} 
            resetGeneralScheduleForm={resetGeneralScheduleForm} 
            setIsNewScheduleDialogOpen={setIsNewScheduleDialogOpen} 
            currentMonth={currentMonth} 
            setCurrentMonth={setCurrentMonth} 
            monthStart={monthStart} 
            daysInMonth={daysInMonth} 
            getScheduleForDay={getScheduleForDay} 
            schedulesInMonth={schedulesInMonth} 
            handleEditGeneralSchedule={handleEditGeneralSchedule} 
            shareScheduleWhatsApp={shareScheduleWhatsApp} 
            openDeleteDialog={openDeleteDialog} 
          />
        </TabsContent>

        <TabsContent value="functions">
          <FunctionsTab 
            setIsNewFunctionDialogOpen={setIsNewFunctionDialogOpen} 
            functionsLoading={functionsLoading} 
            functions={functions} 
            openDeleteDialog={openDeleteDialog} 
          />
        </TabsContent>
      </Tabs>

      <LouvorDialogs
        isNewMemberDialogOpen={isNewMemberDialogOpen}
        setIsNewMemberDialogOpen={setIsNewMemberDialogOpen}
        isEditMemberDialogOpen={isEditMemberDialogOpen}
        setIsEditMemberDialogOpen={setIsEditMemberDialogOpen}
        handleAddMember={handleAddMember}
        handleEditMember={handleEditMember}
        resetMemberForm={resetMemberForm}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberPhone={newMemberPhone}
        setNewMemberPhone={setNewMemberPhone}
        newMemberPhotoPreview={newMemberPhotoPreview}
        newMemberPhotoUrl={newMemberPhotoUrl}
        setNewMemberPhotoUrl={setNewMemberPhotoUrl}
        setNewMemberPhotoPreview={setNewMemberPhotoPreview}
        handlePhotoChange={handlePhotoChange}
        isUploadingPhoto={isUploadingPhoto}
        newMemberPrimaryFunctionId={newMemberPrimaryFunctionId}
        setNewMemberPrimaryFunctionId={setNewMemberPrimaryFunctionId}
        newMemberSecondaryFunctionIds={newMemberSecondaryFunctionIds}
        toggleSecondaryFunction={(id) => {
          if (newMemberSecondaryFunctionIds.includes(id)) {
            setNewMemberSecondaryFunctionIds(newMemberSecondaryFunctionIds.filter(fid => fid !== id));
          } else {
            setNewMemberSecondaryFunctionIds([...newMemberSecondaryFunctionIds, id]);
          }
        }}
        newMemberUserId={newMemberUserId}
        setNewMemberUserId={setNewMemberUserId}
        profiles={profiles}
        functions={functions}
        isAdmin={isAdmin}
        createMemberPending={createMember.isPending}
        updateMemberPending={updateMember.isPending}
        isViewLyricsDialogOpen={isViewLyricsDialogOpen}
        setIsViewLyricsDialogOpen={setIsViewLyricsDialogOpen}
        selectedSong={selectedSong}
        isEditSongDialogOpen={isEditSongDialogOpen}
        setIsEditSongDialogOpen={setIsEditSongDialogOpen}
        handleEditSong={handleEditSong}
        editSongName={editSongName}
        setEditSongName={setEditSongName}
        editSongKey={editSongKey}
        setEditSongKey={setEditSongKey}
        editSongContentType={editSongContentType}
        setEditSongContentType={setEditSongContentType}
        editSongYoutubeUrl={editSongYoutubeUrl}
        setEditSongYoutubeUrl={setEditSongYoutubeUrl}
        editSongChordsUrl={editSongChordsUrl}
        setEditSongChordsUrl={setEditSongChordsUrl}
        editSongLyrics={editSongLyrics}
        setEditSongLyrics={setEditSongLyrics}
        MUSICAL_KEYS={MUSICAL_KEYS}
        updateSongPending={updateSong.isPending}
        isNewSongDialogOpen={isNewSongDialogOpen}
        setIsNewSongDialogOpen={setIsNewSongDialogOpen}
        handleAddSong={handleAddSong}
        newSongName={newSongName}
        setNewSongName={setNewSongName}
        newSongKey={newSongKey}
        setNewSongKey={setNewSongKey}
        newSongLyrics={newSongLyrics}
        setNewSongLyrics={setNewSongLyrics}
        newSongContentType={newSongContentType}
        setNewSongContentType={setNewSongContentType}
        newSongYoutubeUrl={newSongYoutubeUrl}
        setNewSongYoutubeUrl={setNewSongYoutubeUrl}
        newSongChordsUrl={newSongChordsUrl}
        setNewSongChordsUrl={setNewSongChordsUrl}
        newSongMinisterId={newSongMinisterId}
        setNewSongMinisterId={setNewSongMinisterId}
        newSongMinisterKey={newSongMinisterKey}
        setNewSongMinisterKey={setNewSongMinisterKey}
        ministers={ministers}
        createSongPending={createSong.isPending}
        isAssignSongDialogOpen={isAssignSongDialogOpen}
        setIsAssignSongDialogOpen={setIsAssignSongDialogOpen}
        handleAssignSong={handleAssignSong}
        assignSongId={assignSongId}
        setAssignSongId={setAssignSongId}
        assignMinisterId={assignMinisterId}
        setAssignMinisterId={setAssignMinisterId}
        assignKey={assignKey}
        setAssignKey={setAssignKey}
        songs={songs}
        createAssignmentPending={createAssignment.isPending}
        isNewScheduleDialogOpen={isNewScheduleDialogOpen}
        setIsNewScheduleDialogOpen={setIsNewScheduleDialogOpen}
        isEditScheduleDialogOpen={isEditScheduleDialogOpen}
        setIsEditScheduleDialogOpen={setIsEditScheduleDialogOpen}
        selectedSchedule={selectedSchedule}
        handleGeneralScheduleSubmit={handleGeneralScheduleSubmit}
        resetGeneralScheduleForm={resetGeneralScheduleForm}
        formDate={formDate}
        setFormDate={setFormDate}
        formType={formType}
        setFormType={setFormType}
        scheduleTypes={scheduleTypes}
        selectedMinistrantes={selectedMinistrantes}
        setSelectedMinistrantes={setSelectedMinistrantes}
        selectedLouvor={selectedLouvor}
        setSelectedLouvor={setSelectedLouvor}
        selectedMusicos={selectedMusicos}
        setSelectedMusicos={setSelectedMusicos}
        selectedSongs={selectedSongs}
        setSelectedSongs={setSelectedSongs}
        assignments={assignments}
        toggleLouvorMember={(list: string[], setList: (val: string[]) => void, id: string) => {
          if (list.includes(id)) setList(list.filter(item => item !== id));
          else setList([...list, id]);
        }}
        members={members}
        vocalMembers={vocalMembers}
        generalSchedulePending={createGeneralSchedule.isPending || updateGeneralSchedule.isPending}
        isNewFunctionDialogOpen={isNewFunctionDialogOpen}
        setIsNewFunctionDialogOpen={setIsNewFunctionDialogOpen}
        handleAddFunction={handleAddFunction}
        newFunctionName={newFunctionName}
        setNewFunctionName={setNewFunctionName}
        createFunctionPending={createFunction.isPending}
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        deleteType={deleteType}
        setDeleteType={setDeleteType}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
