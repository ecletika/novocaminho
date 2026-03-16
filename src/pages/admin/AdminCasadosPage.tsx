import { useState, useRef, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Loader2, Eye, Image, Heart, Camera, Save, Info, ClipboardList, GraduationCap, BookOpen, UserPlus, Calendar as CalendarIcon, ExternalLink, Link as LinkIcon, FileText, GraduationCap as GradIcon, Lock } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { pt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CASADOS_COURSES, CASADOS_RESOURCES, CASADOS_PORTAL_LOGINS } from "@/constants/casadosData";

const resourceIconMap: Record<string, React.ElementType> = {
  FileText,
  BookOpen,
  GraduationCap: GradIcon,
  ClipboardList,
  Lock
};

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

  // New Management State (Using shared data as initial state)
  const [courses, setCourses] = useState(CASADOS_COURSES);
  const [students, setStudents] = useState([
    { id: "1", name: "João Silva & Maria Silva", phone: "(11) 99999-9999", courseId: "1", status: "Confirmado", link: "https://exemplo.com/aluno/joao-maria" },
    { id: "2", name: "Pedro Santos & Ana Santos", phone: "(11) 88888-8888", courseId: "1", status: "Confirmado", link: "https://exemplo.com/aluno/pedro-ana" },
  ]);

  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState({ name: "", startDate: "", status: "Inscrições Abertas", link: "" });
  const [studentFormData, setStudentFormData] = useState({ name: "", phone: "", courseId: "", status: "Confirmado", link: "" });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

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

      <Tabs defaultValue="sobre">
        <TabsList>
          <TabsTrigger value="sobre">
            <Info className="w-4 h-4 mr-1" />
            Sobre
          </TabsTrigger>
          <TabsTrigger value="palavras">Palavras</TabsTrigger>
          <TabsTrigger value="galeria">Galeria</TabsTrigger>
          <TabsTrigger value="inscricoes">
            <ClipboardList className="w-4 h-4 mr-1" />
            Inscrições
          </TabsTrigger>
        </TabsList>

        {/* SOBRE TAB */}
        <TabsContent value="sobre" className="space-y-6 mt-6">
          <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
            <div className="space-y-2">
              <Label htmlFor="about-title">Título da Página</Label>
              <Input
                id="about-title"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                placeholder="Ex: Casados Para Sempre"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo da Página</Label>
              {aboutLoaded && (
                <RichTextEditor
                  content={aboutContent}
                  onChange={setAboutContent}
                />
              )}
            </div>
            <Button onClick={saveAboutContent} disabled={isSavingAbout}>
              {isSavingAbout ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Página
            </Button>
          </div>
        </TabsContent>

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
                    {format(new Date(post.created_at), "dd/MM/yyyy", { locale: pt })}
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

        {/* INSCRIÇÕES TAB */}
        <TabsContent value="inscricoes" className="space-y-6 mt-6">
          <Tabs defaultValue="cursos">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="cursos" className="text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="alunos" className="text-xs">
                <GraduationCap className="w-3 h-3 mr-1" />
                Alunos
              </TabsTrigger>
              <TabsTrigger value="recursos" className="text-xs">
                <LinkIcon className="w-3 h-3 mr-1" />
                Recursos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cursos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cursos Casados Para Sempre</h3>
                <Button size="sm" onClick={() => { setEditingCourseId(null); setCourseFormData({ name: "", startDate: "", status: "Inscrições Abertas", link: "" }); setIsCourseDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Novo Curso
                </Button>
              </div>
              <div className="grid gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{course.name}</h4>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3" /> Início: {course.startDate}
                        </p>
                        {course.link && (
                          <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Link de Registo
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.status === 'Inscrições Abertas' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {course.status}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          setEditingCourseId(course.id);
                          setCourseFormData({ name: course.name, startDate: course.startDate, status: course.status, link: course.link || "" });
                          setIsCourseDialogOpen(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCourses(courses.filter(c => c.id !== course.id))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alunos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Alunos Matriculados</h3>
                <Button size="sm" onClick={() => { setEditingStudentId(null); setStudentFormData({ name: "", phone: "", courseId: "", status: "Confirmado", link: "" }); setIsStudentDialogOpen(true); }}>
                  <UserPlus className="w-4 h-4 mr-1" /> Novo Aluno
                </Button>
              </div>
              <div className="grid gap-4">
                {students.map(student => {
                  const course = courses.find(c => c.id === student.courseId);
                  return (
                    <div key={student.id} className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.phone} • {course?.name || "Sem curso"}</p>
                        {student.link && (
                          <a href={student.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Link do Aluno
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                          {student.status}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setEditingStudentId(student.id);
                            setStudentFormData({ name: student.name, phone: student.phone, courseId: student.courseId, status: student.status, link: student.link || "" });
                            setIsStudentDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setStudents(students.filter(s => s.id !== student.id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="recursos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Links e Recursos do Curso</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {CASADOS_PORTAL_LOGINS.map((portal) => (
                  <a key={portal.title} href={portal.link} target="_blank" rel="noopener noreferrer" className="bg-card rounded-xl p-5 shadow-soft border-2 border-primary/20 hover:border-primary transition-all group lg:col-span-2 bg-primary/5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg">
                        <Lock className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{portal.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{portal.description} Utilize seu e-mail e palavra-passe de acesso.</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-primary">
                          <span>Aceder Login</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}

                {CASADOS_RESOURCES.map((resource) => {
                  const Icon = resourceIconMap[resource.icon] || FileText;
                  return (
                    <a key={resource.title} href={resource.link} target="_blank" rel="noopener noreferrer" className="bg-card rounded-xl p-5 shadow-soft border border-border hover:border-primary transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-${resource.color || 'primary'}/10 flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 text-${resource.color || 'primary'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold group-hover:text-primary transition-colors">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={(open) => { setIsPostDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
                {selectedPost ? "Guardar" : "Criar"}
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

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourseId ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Nome do Curso</Label>
              <Input id="courseName" value={courseFormData.name} onChange={e => setCourseFormData({ ...courseFormData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDate">Data de Início</Label>
              <Input id="courseDate" type="date" value={courseFormData.startDate} onChange={e => setCourseFormData({ ...courseFormData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseLink">Link de Registo (Externo)</Label>
              <Input id="courseLink" value={courseFormData.link} onChange={e => setCourseFormData({ ...courseFormData, link: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={courseFormData.status} onValueChange={v => setCourseFormData({ ...courseFormData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (editingCourseId) {
                setCourses(courses.map(c => c.id === editingCourseId ? { ...c, ...courseFormData } : c));
              } else {
                setCourses([...courses, { id: Math.random().toString(), ...courseFormData }]);
              }
              setIsCourseDialogOpen(false);
            }}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudentId ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Nome do Casal</Label>
              <Input id="studentName" value={studentFormData.name} onChange={e => setStudentFormData({ ...studentFormData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentPhone">Telefone</Label>
              <Input id="studentPhone" value={studentFormData.phone} onChange={e => setStudentFormData({ ...studentFormData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentLink">Link Personalizado do Aluno</Label>
              <Input id="studentLink" value={studentFormData.link} onChange={e => setStudentFormData({ ...studentFormData, link: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={studentFormData.courseId} onValueChange={v => setStudentFormData({ ...studentFormData, courseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsStudentDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (editingStudentId) {
                setStudents(students.map(s => s.id === editingStudentId ? { ...s, ...studentFormData } : s));
              } else {
                setStudents([...students, { id: Math.random().toString(), ...studentFormData }]);
              }
              setIsStudentDialogOpen(false);
            }}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
