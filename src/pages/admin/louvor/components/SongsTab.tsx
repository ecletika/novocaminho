import { Search, Plus, Mic, Music, Youtube, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorshipSong, SongMinisterAssignment } from "@/hooks/useWorship";

interface SongsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredSongs: WorshipSong[];
  assignments: SongMinisterAssignment[];
  isAdmin: boolean;
  setIsAssignSongDialogOpen: (open: boolean) => void;
  setIsNewSongDialogOpen: (open: boolean) => void;
  openViewLyricsInNewTab: (song: WorshipSong) => void;
  openEditSongDialog: (song: WorshipSong) => void;
  openDeleteDialog: (id: string, type: "song") => void;
}

export function SongsTab({
  searchTerm,
  setSearchTerm,
  filteredSongs,
  assignments,
  isAdmin,
  setIsAssignSongDialogOpen,
  setIsNewSongDialogOpen,
  openViewLyricsInNewTab,
  openEditSongDialog,
  openDeleteDialog
}: SongsTabProps) {
  return (
    <div className="space-y-6">
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
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsAssignSongDialogOpen(true)}>
                <Mic className="w-4 h-4 mr-2" />
                Associar a Ministrante
              </Button>
              <Button onClick={() => setIsNewSongDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Música
              </Button>
            </>
          )}
        </div>
      </div>

      {filteredSongs.length === 0 ? (
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
                              title="Abrir cifra em ecrã inteira"
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
    </div>
  );
}
