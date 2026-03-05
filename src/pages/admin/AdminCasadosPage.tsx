import { useState, useRef, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Loader2, Eye, Image, Heart, Camera, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useCasadosPosts,
  useCreateCasadosPost,
  useUpdateCasadosPost,
  useDeleteCasadosPost,
  CasadosPost,
} from "@/hooks/useCasadosPosts";
import {
  useCasadosGallery,
  useAddGalleryImage,
  useDeleteGalleryImage,
  uploadGalleryImage,
} from "@/hooks/useCasadosGallery";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminCasadosPage() {
  const { toast } = useToast();

  // About page state
  const [aboutContent, setAboutContent] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutLoaded, setAboutLoaded] = useState(false);

  // Posts state
  const [searchTerm, setSearchTerm] = useState("");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CasadosPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: null as string | null,
    published: true,
  });
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  const postFileRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [galleryCaption, setGalleryCaption] = useState("");
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Load about content from site_config
  useEffect(() => {
    const loadAbout = async () => {
      const { data: titleData } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "casados_about_title")
        .maybeSingle();
      const { data: contentData } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "casados_about_content")
        .maybeSingle();
      if (titleData) setAboutTitle(titleData.value);
      if (contentData) setAboutContent(contentData.value);
      setAboutLoaded(true);
    };
    loadAbout();
  }, []);

  const saveAboutContent = async () => {
    setIsSavingAbout(true);
    try {
      for (const { key, value } of [
        { key: "casados_about_title", value: aboutTitle },
        { key: "casados_about_content", value: aboutContent },
      ]) {
        const { data: existing } = await supabase
          .from("site_config")
          .select("id")
          .eq("key", key)
          .maybeSingle();
        if (existing) {
          await supabase.from("site_config").update({ value }).eq("key", key);
        } else {
          await supabase.from("site_config").insert({ key, value });
        }
      }
      toast({ title: "Página salva", description: "O conteúdo da página Sobre foi atualizado." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingAbout(false);
    }
  };

  const { data: posts = [], isLoading: postsLoading } = useCasadosPosts();
  const createPost = useCreateCasadosPost();
  const updatePost = useUpdateCasadosPost();
  const deletePost = useDeleteCasadosPost();

  const { data: gallery = [], isLoading: galleryLoading } = useCasadosGallery();
  const addGalleryImg = useAddGalleryImage();
  const deleteGalleryImg = useDeleteGalleryImage();

  const resetForm = () => {
    setFormData({ title: "", content: "", image_url: null, published: true });
    setSelectedPost(null);
  };

  const openEditDialog = (post: CasadosPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      published: post.published,
    });
    setIsPostDialogOpen(true);
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPost(true);
    try {
      const url = await uploadGalleryImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingPost(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost) {
      await updatePost.mutateAsync({ id: selectedPost.id, ...formData });
    } else {
      await createPost.mutateAsync(formData);
    }
    setIsPostDialogOpen(false);
    resetForm();
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadGalleryImage(file);
        await addGalleryImg.mutateAsync({ image_url: url, caption: galleryCaption || undefined });
      }
      setGalleryCaption("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (postsLoading || galleryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Heart className="w-8 h-8 text-secondary fill-secondary" />
          Casados Para Sempre
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie palavras e galeria do ministério de casais</p>
      </div>

      <Tabs defaultValue="palavras">
        <TabsList>
          <TabsTrigger value="palavras">Palavras</TabsTrigger>
          <TabsTrigger value="galeria">Galeria</TabsTrigger>
        </TabsList>

        {/* PALAVRAS TAB */}
        <TabsContent value="palavras" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar palavras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => { resetForm(); setIsPostDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Palavra
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-xl p-5 shadow-soft flex items-start gap-4">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    {!post.published && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">Rascunho</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setIsViewDialogOpen(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletePostId(post.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma palavra publicada ainda.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* GALERIA TAB */}
        <TabsContent value="galeria" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Legenda (opcional)"
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
              className="max-w-md"
            />
            <input ref={galleryFileRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            <Button onClick={() => galleryFileRef.current?.click()} disabled={isUploadingGallery}>
              {isUploadingGallery ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              Adicionar Fotos
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden shadow-soft">
                <img src={img.image_url} alt={img.caption || "Galeria"} className="w-full h-full object-cover" />
                {img.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm">{img.caption}</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => setDeleteGalleryId(img.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma foto na galeria.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={(open) => { setIsPostDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedPost ? "Editar Palavra" : "Nova Palavra"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePostSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Título</Label>
              <Input id="post-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <input ref={postFileRef} type="file" accept="image/*" onChange={handlePostImageUpload} className="hidden" />
              {formData.image_url ? (
                <div className="relative">
                  <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <Button type="button" variant="outline" size="sm" className="absolute bottom-2 right-2" onClick={() => postFileRef.current?.click()} disabled={isUploadingPost}>
                    Trocar
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full h-32" onClick={() => postFileRef.current?.click()} disabled={isUploadingPost}>
                  {isUploadingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Image className="w-5 h-5 mr-2" />Adicionar Imagem</>}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <RichTextEditor content={formData.content} onChange={(content) => setFormData({ ...formData, content })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="post-published" checked={formData.published} onCheckedChange={(c) => setFormData({ ...formData, published: c })} />
              <Label htmlFor="post-published">Publicar</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsPostDialogOpen(false); resetForm(); }}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={createPost.isPending || updatePost.isPending}>
                {(createPost.isPending || updatePost.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedPost ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="mt-4">
              {selectedPost.image_url && <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Post */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir palavra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deletePostId) { await deletePost.mutateAsync(deletePostId); setDeletePostId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Gallery */}
      <AlertDialog open={!!deleteGalleryId} onOpenChange={() => setDeleteGalleryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteGalleryId) { await deleteGalleryImg.mutateAsync(deleteGalleryId); setDeleteGalleryId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
