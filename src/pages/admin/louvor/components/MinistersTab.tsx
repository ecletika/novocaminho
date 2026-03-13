import { Mic, Eye, Edit, Trash2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorshipMember, SongMinisterAssignment, WorshipSong } from "@/hooks/useWorship";

interface MinistersTabProps {
  selectedMinisterId: string | null;
  setSelectedMinisterId: (id: string | null) => void;
  ministers: WorshipMember[];
  assignments: SongMinisterAssignment[];
  ministerSongs: SongMinisterAssignment[];
  membersLoading: boolean;
  openViewLyricsInNewTab: (song: WorshipSong) => void;
  openEditSongDialog: (song: WorshipSong) => void;
  openDeleteDialog: (id: string, type: "minister" | "assignment") => void;
}

export function MinistersTab({
  selectedMinisterId,
  setSelectedMinisterId,
  ministers,
  assignments,
  ministerSongs,
  membersLoading,
  openViewLyricsInNewTab,
  openEditSongDialog,
  openDeleteDialog
}: MinistersTabProps) {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {membersLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Carregando...</div>
        ) : ministers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhum ministrante registado. Adicione membros com a função "Ministrante" na aba Membros.
          </div>
        ) : (
          ministers.map((minister) => {
            const ministerAssignments = assignments.filter(a =>
              a.minister_id === minister.id ||
              a.minister?.name?.toLowerCase() === minister.name?.toLowerCase()
            );
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
    </div>
  );
}
