import { useParams, Link } from "react-router-dom";
import { useWorshipSong } from "@/hooks/useWorship";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Music, Youtube, ExternalLink } from "lucide-react";

export default function SongViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { data: song, isLoading, error } = useWorshipSong(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground mb-4">Música não encontrada</h1>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      {/* Header Fixo/Flutuante */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 dark:bg-slate-900/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
                {song.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  Tom: {song.original_key}
                </span>
                {song.content_type === "cifra" && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                    Cifra
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {song.youtube_url && (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex rounded-full">
                <a href={song.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4 mr-2 text-red-600" />
                  YouTube
                </a>
              </Button>
            )}
            {song.chords_url && (
              <Button variant="outline" size="sm" asChild className="hidden sm:flex rounded-full">
                <a href={song.chords_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Externo
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Toolbar para troca de tom (futuro) ou info */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Visualização Limpa</span>
            </div>
            <div className="text-xs text-slate-400">
              {song.content_type === "cifra" ? "Exibindo Cifra" : "Exibindo Letra"}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <pre className="font-mono text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200 selection:bg-primary/20">
              {song.lyrics || "Nenhum conteúdo registado para esta música."}
            </pre>
          </div>
        </div>

        {/* Links Mobile */}
        <div className="mt-6 flex flex-wrap gap-4 sm:hidden">
          {song.youtube_url && (
            <Button variant="secondary" className="flex-1 rounded-xl" asChild>
              <a href={song.youtube_url} target="_blank" rel="noopener noreferrer">
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </a>
            </Button>
          )}
          {song.chords_url && (
            <Button variant="outline" className="flex-1 rounded-xl" asChild>
              <a href={song.chords_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Original
              </a>
            </Button>
          )}
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-400 text-xs px-4">
        <p>© Igreja Novo Caminho - Ministério de Louvor</p>
        <p className="mt-1">Página otimizada para visualização rápida sem anúncios.</p>
      </footer>
    </div>
  );
}
