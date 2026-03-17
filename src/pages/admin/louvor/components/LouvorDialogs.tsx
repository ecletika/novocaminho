import { useRef } from "react";
import { Music, Eye, Edit, Trash2, Upload, Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { WorshipMember, WorshipSong, WorshipFunction, WorshipSchedule } from "@/hooks/useWorship";

interface LouvorDialogsProps {
  // Members
  isNewMemberDialogOpen: boolean;
  setIsNewMemberDialogOpen: (open: boolean) => void;
  isEditMemberDialogOpen: boolean;
  setIsEditMemberDialogOpen: (open: boolean) => void;
  handleAddMember: (e: React.FormEvent) => void;
  handleEditMember: (e: React.FormEvent) => void;
  resetMemberForm: () => void;
  newMemberName: string;
  setNewMemberName: (val: string) => void;
  newMemberPhone: string;
  setNewMemberPhone: (val: string) => void;
  newMemberPhotoPreview: string | null;
  newMemberPhotoUrl: string;
  setNewMemberPhotoUrl: (val: string) => void;
  setNewMemberPhotoPreview: (val: string | null) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingPhoto: boolean;
  newMemberPrimaryFunctionId: string;
  setNewMemberPrimaryFunctionId: (val: string) => void;
  newMemberSecondaryFunctionIds: string[];
  toggleSecondaryFunction: (id: string) => void;
  newMemberUserId: string;
  setNewMemberUserId: (val: string) => void;
  profiles: any[];
  functions: WorshipFunction[];
  isAdmin: boolean;
  createMemberPending: boolean;
  updateMemberPending: boolean;

  // Songs
  isViewLyricsDialogOpen: boolean;
  setIsViewLyricsDialogOpen: (open: boolean) => void;
  selectedSong: WorshipSong | null;
  isEditSongDialogOpen: boolean;
  setIsEditSongDialogOpen: (open: boolean) => void;
  handleEditSong: (e: React.FormEvent) => void;
  editSongName: string;
  setEditSongName: (val: string) => void;
  editSongKey: string;
  setEditSongKey: (val: string) => void;
  editSongContentType: "cifra" | "letra";
  setEditSongContentType: (val: "cifra" | "letra") => void;
  editSongYoutubeUrl: string;
  setEditSongYoutubeUrl: (val: string) => void;
  editSongLyrics: string;
  setEditSongLyrics: (val: string) => void;
  MUSICAL_KEYS: string[];
  updateSongPending: boolean;
  
  isNewSongDialogOpen: boolean;
  setIsNewSongDialogOpen: (open: boolean) => void;
  handleAddSong: (e: React.FormEvent) => void;
  newSongName: string;
  setNewSongName: (val: string) => void;
  newSongKey: string;
  setNewSongKey: (val: string) => void;
  newSongLyrics: string;
  setNewSongLyrics: (val: string) => void;
  newSongContentType: "cifra" | "letra";
  setNewSongContentType: (val: "cifra" | "letra") => void;
  newSongYoutubeUrl: string;
  setNewSongYoutubeUrl: (val: string) => void;
  newSongMinisterId: string;
  setNewSongMinisterId: (val: string) => void;
  newSongMinisterKey: string;
  setNewSongMinisterKey: (val: string) => void;
  ministers: WorshipMember[];
  createSongPending: boolean;

  // Assignments
  isAssignSongDialogOpen: boolean;
  setIsAssignSongDialogOpen: (open: boolean) => void;
  handleAssignSong: (e: React.FormEvent) => void;
  assignSongId: string;
  setAssignSongId: (val: string) => void;
  assignMinisterId: string;
  setAssignMinisterId: (val: string) => void;
  assignKey: string;
  setAssignKey: (val: string) => void;
  songs: WorshipSong[];
  createAssignmentPending: boolean;

  // Schedules
  isNewScheduleDialogOpen: boolean;
  setIsNewScheduleDialogOpen: (open: boolean) => void;
  isEditScheduleDialogOpen: boolean;
  setIsEditScheduleDialogOpen: (open: boolean) => void;
  selectedSchedule: any;
  handleGeneralScheduleSubmit: (e: React.FormEvent) => void;
  resetGeneralScheduleForm: () => void;
  formDate: string;
  setFormDate: (val: string) => void;
  formType: string;
  setFormType: (val: string) => void;
  scheduleTypes: string[];
  selectedMinistrantes: string[];
  setSelectedMinistrantes: (val: string[]) => void;
  selectedLouvor: string[];
  setSelectedLouvor: (val: string[]) => void;
  selectedMusicos: { member_id: string; instrument: string }[];
  setSelectedMusicos: (val: { member_id: string; instrument: string }[]) => void;
  selectedSongs: { song_id: string; key: string; sort_order: number }[];
  setSelectedSongs: (val: { song_id: string; key: string; sort_order: number }[]) => void;
  assignments: any[];
  toggleLouvorMember: (list: string[], setList: (val: string[]) => void, id: string) => void;
  members: WorshipMember[];
  vocalMembers: WorshipMember[];
  generalSchedulePending: boolean;

  // Functions
  isNewFunctionDialogOpen: boolean;
  setIsNewFunctionDialogOpen: (open: boolean) => void;
  handleAddFunction: (e: React.FormEvent) => void;
  newFunctionName: string;
  setNewFunctionName: (val: string) => void;
  createFunctionPending: boolean;

  // Deletion
  deleteItemId: string | null;
  setDeleteItemId: (id: string | null) => void;
  deleteType: any;
  setDeleteType: (type: any) => void;
  handleConfirmDelete: () => void;
}

export function LouvorDialogs({
  // Members
  isNewMemberDialogOpen,
  setIsNewMemberDialogOpen,
  isEditMemberDialogOpen,
  setIsEditMemberDialogOpen,
  handleAddMember,
  handleEditMember,
  resetMemberForm,
  newMemberName,
  setNewMemberName,
  newMemberPhone,
  setNewMemberPhone,
  newMemberPhotoPreview,
  newMemberPhotoUrl,
  setNewMemberPhotoUrl,
  setNewMemberPhotoPreview,
  handlePhotoChange,
  isUploadingPhoto,
  newMemberPrimaryFunctionId,
  setNewMemberPrimaryFunctionId,
  newMemberSecondaryFunctionIds,
  toggleSecondaryFunction,
  newMemberUserId,
  setNewMemberUserId,
  profiles,
  functions,
  isAdmin,
  createMemberPending,
  updateMemberPending,

  // Songs
  isViewLyricsDialogOpen,
  setIsViewLyricsDialogOpen,
  selectedSong,
  isEditSongDialogOpen,
  setIsEditSongDialogOpen,
  handleEditSong,
  editSongName,
  setEditSongName,
  editSongKey,
  setEditSongKey,
  editSongContentType,
  setEditSongContentType,
  editSongYoutubeUrl,
  setEditSongYoutubeUrl,
  editSongLyrics,
  setEditSongLyrics,
  MUSICAL_KEYS,
  updateSongPending,

  isNewSongDialogOpen,
  setIsNewSongDialogOpen,
  handleAddSong,
  newSongName,
  setNewSongName,
  newSongKey,
  setNewSongKey,
  newSongLyrics,
  setNewSongLyrics,
  newSongContentType,
  setNewSongContentType,
  newSongYoutubeUrl,
  setNewSongYoutubeUrl,
  newSongMinisterId,
  setNewSongMinisterId,
  newSongMinisterKey,
  setNewSongMinisterKey,
  ministers,
  createSongPending,

  // Assignments
  isAssignSongDialogOpen,
  setIsAssignSongDialogOpen,
  handleAssignSong,
  assignSongId,
  setAssignSongId,
  assignMinisterId,
  setAssignMinisterId,
  assignKey,
  setAssignKey,
  songs,
  createAssignmentPending,

  // Schedules
  isNewScheduleDialogOpen,
  setIsNewScheduleDialogOpen,
  isEditScheduleDialogOpen,
  setIsEditScheduleDialogOpen,
  selectedSchedule,
  handleGeneralScheduleSubmit,
  resetGeneralScheduleForm,
  formDate,
  setFormDate,
  formType,
  setFormType,
  scheduleTypes,
  selectedMinistrantes,
  setSelectedMinistrantes,
  selectedLouvor,
  setSelectedLouvor,
  selectedMusicos,
  setSelectedMusicos,
  selectedSongs,
  setSelectedSongs,
  assignments,
  toggleLouvorMember,
  members,
  vocalMembers,
  generalSchedulePending,

  // Functions
  isNewFunctionDialogOpen,
  setIsNewFunctionDialogOpen,
  handleAddFunction,
  newFunctionName,
  setNewFunctionName,
  createFunctionPending,

  // Deletion
  deleteItemId,
  setDeleteItemId,
  deleteType,
  setDeleteType,
  handleConfirmDelete
}: LouvorDialogsProps) {
  const newMemberFileInputRef = useRef<HTMLInputElement>(null);
  const editMemberFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
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
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Button type="submit" className="flex-1" disabled={updateSongPending}>
                {updateSongPending ? "Salvando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New/Edit Schedule Dialog */}
      <Dialog open={isNewScheduleDialogOpen || isEditScheduleDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsNewScheduleDialogOpen(false);
          setIsEditScheduleDialogOpen(false);
          resetGeneralScheduleForm();
        }
      }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedSchedule ? "Editar Escala" : "Criar Nova Escala"}
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

            {/* Ministrante */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Ministrante
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {ministers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ministrante-${member.id}`}
                      checked={selectedMinistrantes.includes(member.id)}
                      onCheckedChange={() => toggleLouvorMember(selectedMinistrantes, setSelectedMinistrantes, member.id)}
                    />
                    <label htmlFor={`ministrante-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Louvor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Music className="w-4 h-4 text-secondary" />
                Louvor (Vocal)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {vocalMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`louvor-${member.id}`}
                      checked={selectedLouvor.includes(member.id)}
                      onCheckedChange={() => toggleLouvorMember(selectedLouvor, setSelectedLouvor, member.id)}
                    />
                    <label htmlFor={`louvor-${member.id}`} className="text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Músicos */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Músicos
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {members.filter(m => {
                  const skills = [
                    m.primary_function?.name?.toLowerCase(),
                    ...(m.secondary_functions?.map(sf => sf.function?.name?.toLowerCase()) || [])
                  ].filter(Boolean);
                  return skills.some(s => ["teclado", "violão", "violao", "bateria", "baixo", "guitarra"].some(instr => s?.includes(instr)));
                }).map((member) => {
                  const selected = selectedMusicos.find(sm => sm.member_id === member.id);
                  const skills = [
                    member.primary_function?.name?.toLowerCase(),
                    ...(member.secondary_functions?.map(sf => sf.function?.name?.toLowerCase()) || [])
                  ].filter(Boolean);

                  const hasSkill = (name: string) => skills.some(s => s?.includes(name));

                  return (
                    <div key={member.id} className="flex items-center gap-4 py-1 border-b last:border-0 border-border/40">
                      <Checkbox
                        id={`musico-${member.id}`}
                        checked={!!selected}
                        onCheckedChange={() => {
                          if (selected) {
                            setSelectedMusicos(selectedMusicos.filter(m => m.member_id !== member.id));
                          } else {
                            let defaultInstrument = "";
                            const instrList = ["teclado", "violão", "bateria", "baixo", "guitarra"];
                            for (const instr of instrList) {
                              if (hasSkill(instr)) {
                                defaultInstrument = instr === "violão" ? "violao" : instr;
                                break;
                              }
                            }
                            setSelectedMusicos([...selectedMusicos, { member_id: member.id, instrument: defaultInstrument }]);
                          }
                        }}
                      />
                      <label htmlFor={`musico-${member.id}`} className="text-sm flex-1">{member.name}</label>
                      {selected && (
                        <Select
                          value={selected.instrument}
                          onValueChange={(v) => {
                            setSelectedMusicos(selectedMusicos.map(m =>
                              m.member_id === member.id ? { ...m, instrument: v } : m
                            ));
                          }}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue placeholder="Instr." />
                          </SelectTrigger>
                          <SelectContent>
                            {hasSkill("teclado") && <SelectItem value="teclado">Teclado</SelectItem>}
                            {(hasSkill("violão") || hasSkill("violao")) && <SelectItem value="violao">Violão</SelectItem>}
                            {hasSkill("bateria") && <SelectItem value="bateria">Bateria</SelectItem>}
                            {hasSkill("baixo") && <SelectItem value="baixo">Baixo</SelectItem>}
                            {hasSkill("guitarra") && <SelectItem value="guitarra">Guitarra</SelectItem>}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Músicas */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Músicas da Escala
              </label>
              
              <div className="flex gap-2">
                <Select onValueChange={(songId) => {
                  const song = songs?.find(s => s.id === songId);
                  if (song && !selectedSongs?.some(ss => ss.song_id === song.id)) {
                    // Check if there is an assignment for the first selected ministrante
                    const ministerId = selectedMinistrantes?.[0];
                    const assignment = assignments?.find(a => a.song_id === songId && a.minister_id === ministerId);
                    const key = assignment?.key || song.original_key || "";
                    setSelectedSongs([...(selectedSongs || []), { song_id: song.id, key, sort_order: (selectedSongs || []).length }]);
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar música..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Priority for Minister's Songs */}
                    {selectedMinistrantes?.length > 0 && (assignments || []).filter(a => selectedMinistrantes.includes(a.minister_id)).length > 0 && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30">
                        Repertório do Ministrante
                      </div>
                    )}
                    {selectedMinistrantes?.length > 0 && (assignments || [])
                      .filter(a => selectedMinistrantes.includes(a.minister_id))
                      .map(a => (
                        <SelectItem key={`dialog-song-rep-${a.id}`} value={a.song_id}>
                          {a.song?.name} ({a.key})
                        </SelectItem>
                      ))
                    }
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30">
                      Todas as Músicas
                    </div>
                    {(songs || []).map(song => (
                      <SelectItem key={`dialog-song-all-${song.id}`} value={song.id}>
                        {song.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSongs.length > 0 && (
                <div className="space-y-2 border rounded-md p-2 bg-muted/10">
                  {selectedSongs?.map((ss, index) => {
                    const song = songs?.find(s => s.id === ss.song_id);
                    return (
                      <div key={`sel-song-${ss.song_id}`} className="flex items-center gap-3 bg-background p-2 rounded border border-border/50 group">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{song?.name}</span>
                        <Select
                          value={ss.key}
                          onValueChange={(newKey) => {
                            setSelectedSongs(selectedSongs.map((item, i) => 
                              i === index ? { ...item, key: newKey } : item
                            ));
                          }}
                        >
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MUSICAL_KEYS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedSongs(selectedSongs.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => {
                setIsNewScheduleDialogOpen(false);
                setIsEditScheduleDialogOpen(false);
                resetGeneralScheduleForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={generalSchedulePending}>
                {generalSchedulePending ? "Salvando..." : selectedSchedule ? "Guardar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Member Dialog */}
      <Dialog open={isNewMemberDialogOpen} onOpenChange={setIsNewMemberDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Adicionar Integrante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Foto do Integrante</label>
              <div className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="upload" className="text-xs">Ficheiro</TabsTrigger>
                    <TabsTrigger value="link" className="text-xs">Link da Foto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                        {newMemberPhotoPreview ? (
                          <img src={newMemberPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        ref={newMemberFileInputRef}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingPhoto}
                        onClick={() => newMemberFileInputRef.current?.click()}
                      >
                        {isUploadingPhoto ? "Carregando..." : "Selecionar Foto"}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="link">
                    <div className="space-y-2">
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        value={newMemberPhotoUrl}
                        onChange={(e) => {
                          setNewMemberPhotoUrl(e.target.value);
                          setNewMemberPhotoPreview(e.target.value);
                        }}
                        className="text-xs"
                      />
                      {newMemberPhotoPreview && (
                        <div className="flex justify-center">
                          <img src={newMemberPhotoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
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
                placeholder="Ex: +351 912 345 678"
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
                  {functions.filter(f => f.id).map((func) => (
                    <SelectItem key={`new-func-${func.id}`} value={func.id}>{func.name}</SelectItem>
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
                    {profiles.filter(p => p.user_id && p.id).map((profile) => (
                      <SelectItem key={`new-user-${profile.id}`} value={profile.user_id as string}>{profile.full_name || 'Sem nome'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Funções Secundárias</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {functions
                  .filter(f => f.id !== newMemberPrimaryFunctionId && f.id)
                  .map((func) => (
                    <div key={`new-sec-func-${func.id}`} className="flex items-center gap-2">
                      <Checkbox
                        id={`new-func-${func.id}`}
                        checked={newMemberSecondaryFunctionIds.includes(func.id)}
                        onCheckedChange={() => toggleSecondaryFunction(func.id)}
                      />
                      <label htmlFor={`new-func-${func.id}`} className="text-sm">{func.name}</label>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewMemberDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createMemberPending}>
                {createMemberPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={(open) => { setIsEditMemberDialogOpen(open); if (!open) resetMemberForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Integrante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Foto do Integrante</label>
              <div className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="upload" className="text-xs">Ficheiro</TabsTrigger>
                    <TabsTrigger value="link" className="text-xs">Link da Foto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                        {newMemberPhotoPreview ? (
                          <img src={newMemberPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        ref={editMemberFileInputRef}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingPhoto}
                        onClick={() => editMemberFileInputRef.current?.click()}
                      >
                        {isUploadingPhoto ? "Carregando..." : "Alterar Foto"}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="link">
                    <div className="space-y-2">
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        value={newMemberPhotoUrl}
                        onChange={(e) => {
                          setNewMemberPhotoUrl(e.target.value);
                          setNewMemberPhotoPreview(e.target.value);
                        }}
                        className="text-xs"
                      />
                      {newMemberPhotoPreview && (
                        <div className="flex justify-center">
                          <img src={newMemberPhotoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
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
                placeholder="Ex: +351 912 345 678"
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
                  {functions.filter(f => f.id).map((func) => (
                    <SelectItem key={`edit-func-${func.id}`} value={func.id}>{func.name}</SelectItem>
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
                    {profiles.filter(p => p.user_id && p.id).map((profile) => (
                      <SelectItem key={`edit-user-${profile.id}`} value={profile.user_id as string}>{profile.full_name || 'Sem nome'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <Button type="submit" className="flex-1" disabled={updateMemberPending}>
                {updateMemberPending ? "Salvando..." : "Guardar"}
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

      {/* Assign Song Dialog */}
      <Dialog open={isAssignSongDialogOpen} onOpenChange={setIsAssignSongDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                  {songs.filter(s => s.id).map((song) => (
                    <SelectItem key={`assign-song-${song.id}`} value={song.id}>{song.name}</SelectItem>
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
                  {ministers.filter(m => m.id).map((minister) => (
                    <SelectItem key={`assign-minister-${minister.id}`} value={minister.id}>{minister.name}</SelectItem>
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
                    <SelectItem key={`assign-key-${key}`} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAssignSongDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createAssignmentPending}>
                {createAssignmentPending ? "Associando..." : "Associar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Song Dialog */}
      <Dialog open={isNewSongDialogOpen} onOpenChange={setIsNewSongDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      <SelectItem key={`new-song-key-${key}`} value={key}>{key}</SelectItem>
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
                    <SelectItem value="none">Nenhum</SelectItem>
                    {ministers.filter(m => m.id).map((minister) => (
                      <SelectItem key={`new-song-minister-${minister.id}`} value={minister.id}>{minister.name}</SelectItem>
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
                      <SelectItem key={`new-song-min-key-${key}`} value={key}>{key}</SelectItem>
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
              <Button type="submit" className="flex-1" disabled={createSongPending}>
                {createSongPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Function Dialog */}
      <Dialog open={isNewFunctionDialogOpen} onOpenChange={setIsNewFunctionDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              <Button type="submit" className="flex-1" disabled={createFunctionPending}>
                {createFunctionPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
