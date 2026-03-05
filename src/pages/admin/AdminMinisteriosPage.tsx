import { useState } from "react";
import { useMinistries, useCreateMinistry, useUpdateMinistry, useDeleteMinistry, Ministry, MinistryInsert } from "@/hooks/useMinistries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Edit, Trash2, Loader2, Users, Music, Tv, Heart, BookOpen, Mic2 } from "lucide-react";

const iconOptions = [
  { value: "Users", label: "Pessoas", Icon: Users },
  { value: "Music", label: "Música", Icon: Music },
  { value: "Tv", label: "Mídia", Icon: Tv },
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
    icon: "Users",
    features: "",
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      description: "",
      icon: "Users",
      features: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingMinistry(null);
  };

  const openEditDialog = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      slug: ministry.slug,
      title: ministry.title,
      description: ministry.description || "",
      icon: ministry.icon,
      features: (ministry.features || []).join(", "),
      is_active: ministry.is_active,
      sort_order: ministry.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ministryData: MinistryInsert = {
      slug: formData.slug,
      title: formData.title,
      description: formData.description || null,
      icon: formData.icon,
      image_url: null,
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
          <DialogContent className="max-w-lg">
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
                  rows={3}
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
                        className={`p-2 rounded-lg border transition-colors ${
                          formData.icon === opt.value
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
                  {editingMinistry ? "Salvar" : "Criar"}
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
              className="bg-card rounded-xl p-6 shadow-soft flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
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
            Nenhum ministério cadastrado ainda.
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
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
