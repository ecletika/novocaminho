import { useState, useRef } from "react";
import { Plus, Search, FileText, Trash2, Edit, Loader2, Eye, Image, Video, History, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  useAfricaContents,
  useCreateAfricaContent,
  useUpdateAfricaContent,
  useDeleteAfricaContent,
  uploadAfricaMedia,
  AfricaContent,
  AfricaContentType,
} from "@/hooks/useAfricaContent";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminAfricaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<AfricaContent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'image' as AfricaContentType,
    title: "",
    description: "",
    content: "",
    media_url: "",
    sort_order: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: contents = [], isLoading } = useAfricaContents();
  const createContent = useCreateAfricaContent();
  const updateContent = useUpdateAfricaContent();
  const deleteContent = useDeleteAfricaContent();

  const resetForm = () => {
    setFormData({
      type: 'image',
      title: "",
      description: "",
      content: "",
      media_url: "",
      sort_order: contents.length,
    });
    setSelectedContent(null);
  };

  const openEditDialog = (content: AfricaContent) => {
    setSelectedContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      description: content.description || "",
      content: content.content || "",
      media_url: content.media_url || "",
      sort_order: content.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadAfricaMedia(file);
      setFormData((prev) => ({ ...prev, media_url: url }));
    } catch (error) {
      console.error("Error uploading media:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedContent) {
      await updateContent.mutateAsync({ 
        id: selectedContent.id, 
        updates: formData 
      });
    } else {
      await createContent.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteContent.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleMove = async (content: AfricaContent, direction: 'up' | 'down') => {
    const index = contents.findIndex(c => c.id === content.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === contents.length - 1) return;

    const otherContent = direction === 'up' ? contents[index - 1] : contents[index + 1];
    
    await Promise.all([
      updateContent.mutateAsync({ id: content.id, updates: { sort_order: otherContent.sort_order } }),
      updateContent.mutateAsync({ id: otherContent.id, updates: { sort_order: content.sort_order } })
    ]);
  };

  const filteredContents = contents.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: AfricaContentType) => {
    switch (type) {
      case 'history': return <History className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Novo Caminho África</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a história, imagens e vídeos da igreja na África
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl shadow-soft p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por título ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredContents.map((content) => (
          <div
            key={content.id}
            className="bg-card rounded-xl p-5 shadow-soft flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              {getIcon(content.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{content.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  {content.type === 'history' ? 'História' : content.type === 'image' ? 'Imagem' : 'Vídeo'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {content.description || "Sem descrição"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase mt-2">
                Criado em {format(new Date(content.created_at), "dd MMM yyyy", { locale: pt })}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex flex-col gap-1 mr-2 border-r pr-2 border-border/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleMove(content, 'up')}
                >
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleMove(content, 'down')}
                >
                  <MoveDown className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="ghost" size="icon" onClick={() => openEditDialog(content)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteId(content.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {filteredContents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border-2 border-dashed border-border/50">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum conteúdo registado para a África.</p>
            <Button variant="link" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              Adicionar o primeiro conteúdo
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedContent ? "Editar Conteúdo" : "Novo Conteúdo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: AfricaContentType) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="history">História da Igreja</SelectItem>
                    <SelectItem value="image">Imagem / Foto</SelectItem>
                    <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Nossa Chegada em Luanda"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Curta</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Uma breve descrição que aparecerá na galeria ou listagem"
              />
            </div>

            {/* Media Upload or URL */}
            {formData.type === 'image' && (
              <div className="space-y-2">
                <Label>Upload de Imagem</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                {formData.media_url ? (
                  <div className="relative group">
                    <img
                      src={formData.media_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Trocar Imagem
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image className="w-8 h-8 opacity-40" />
                        <span>Clique para carregar imagem</span>
                      </div>
                    )}
                  </Button>
                )}
              </div>
            )}

            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="media_url">URL do Vídeo (YouTube/Vimeo)</Label>
                <Input
                  id="media_url"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            )}

            {/* Content (Rich Text for History) */}
            {formData.type === 'history' && (
              <div className="space-y-2">
                <Label>Texto da História</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createContent.isPending || updateContent.isPending}>
                {(createContent.isPending || updateContent.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedContent ? "Guardar Alterações" : "Criar Conteúdo"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O conteúdo será removido permanentemente da página Novo Caminho África.
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
