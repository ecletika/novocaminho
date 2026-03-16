import { useState } from "react";
import { useMinistries, useCreateMinistry, useUpdateMinistry, useDeleteMinistry, Ministry, MinistryInsert } from "@/hooks/useMinistries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Loader2, Users, Music, Tv, Heart, BookOpen, Mic2, Image as ImageIcon, Upload, Link2 } from "lucide-react";

const iconOptions = [
  { value: "Users", label: "Pessoas", Icon: Users },
  { value: "Music", label: "Música", Icon: Music },
  { value: "Tv", label: "Media", Icon: Tv },
  { value: "Heart", label: "Coração", Icon: Heart },
  { value: "BookOpen", label: "Livro", Icon: BookOpen },
  { value: "Mic2", label: "Microfone", Icon: Mic2 },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find((opt) => opt.value === iconName);
  return found ? found.Icon : Users;
};

export default function AdminMinisteriosPage() {
  const { data: ministries, isLoading } = useMinistries();
  const createMinistry = useCreateMinistry();
  const updateMinistry = useUpdateMinistry();
  const deleteMinistry = useDeleteMinistry();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    bible_verse: "",
    icon: "Users",
    features: "",
    is_active: true,
    sort_order: 0,
    image_url: "",
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      description: "",
      bible_verse: "",
      icon: "Users",
      features: "",
      is_active: true,
      sort_order: 0,
      image_url: "",
    });
    setEditingMinistry(null);
  };

  const openEditDialog = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      slug: ministry.slug,
      title: ministry.title,
      description: ministry.description || "",
      bible_verse: (ministry as any).bible_verse || "",
      icon: ministry.icon,
      features: (ministry.features || []).join(", "),
      is_active: ministry.is_active,
      sort_order: ministry.sort_order,
      image_url: ministry.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ministryData: MinistryInsert = {
      slug: formData.slug,
      title: formData.title,
      description: formData.description || null,
      bible_verse: formData.bible_verse || null,
      icon: formData.icon,
      image_url: formData.image_url || null,
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    };

    if (editingMinistry) {
      await updateMinistry.mutateAsync({
        id: editingMinistry.id,
        updates: ministryData,
      });
    } else {
      await createMinistry.mutateAsync(ministryData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `ministries/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Foto carregada com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao carregar imagem: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMinistry.mutateAsync(deleteId);
      setDeleteId(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Ministérios</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os ministérios da igreja
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Ministério
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMinistry ? "Editar Ministério" : "Novo Ministério"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do ministério
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    required
                    placeholder="ex: louvor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bible_verse">Versículo Bíblico</Label>
                <Textarea
                  id="bible_verse"
                  value={formData.bible_verse}
                  onChange={(e) => setFormData({ ...formData, bible_verse: e.target.value })}
                  rows={2}
                  placeholder="Ex: 'Ide por todo o mundo...' - Marcos 16:15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: opt.value })}
                        className={`p-2 rounded-lg border transition-colors ${formData.icon === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                          }`}
                        title={opt.label}
                      >
                        <opt.Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordem</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Características (separadas por vírgula)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Ensaios, Escalas, Retiros"
                />
              </div>

              <div className="space-y-2">
                <Label>Capa do Ministério</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="upload" className="text-xs">
                      <Upload className="w-3 h-3 mr-2" />
                      Ficheiro
                    </TabsTrigger>
                    <TabsTrigger value="link" className="text-xs">
                      <Link2 className="w-3 h-3 mr-2" />
                      Link Externo
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-3">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        title="Escolher foto"
                      />
                      <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold">Clique ou arraste uma foto</p>
                          <p className="text-xs text-muted-foreground mt-1">Computador ou Telemóvel (JPG, PNG)</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="link">
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="text-xs"
                    />
                  </TabsContent>
                </Tabs>
                {formData.image_url && (
                  <div className="mt-2 relative group aspect-video rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ministério ativo</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMinistry.isPending || updateMinistry.isPending}>
                  {(createMinistry.isPending || updateMinistry.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingMinistry ? "Guardar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ministries List */}
      <div className="grid gap-4">
        {ministries?.map((ministry) => {
          const IconComponent = getIconComponent(ministry.icon);
          return (
            <div
              key={ministry.id}
              className="bg-card rounded-xl shadow-soft flex items-start gap-4 overflow-hidden border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted flex items-center justify-center shrink-0 overflow-hidden relative group">
                {ministry.image_url ? (
                  <img src={ministry.image_url} alt={ministry.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <IconComponent className="w-8 h-8 text-primary/40" />
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => openEditDialog(ministry)}
                >
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 py-4 pr-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{ministry.title}</h3>
                  {!ministry.is_active && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {ministry.description}
                </p>
                {(ministry.features || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(ministry.features || []).slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(ministry)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(ministry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {ministries?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum ministério registado ainda.
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ministério?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O ministério será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
