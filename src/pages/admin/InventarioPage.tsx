import { useState, useEffect, useRef } from "react";
import { Plus, Search, Package, MapPin, Eye, Edit, Trash2, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useInventoryItems,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  uploadInventoryPhoto,
  InventoryItem,
} from "@/hooks/useInventory";

const categories = [
  "Todos",
  "Instrumentos",
  "Equipamentos de Som",
  "Móveis",
  "Informática",
  "Iluminação",
  "Outros",
];

const locations = [
  "Todos",
  "Templo Principal",
  "Sala de Ensaio",
  "Depósito",
  "Estúdio",
  "Secretaria",
  "Cozinha",
];

const conditions = ["Excelente", "Bom", "Regular", "Necessita Reparo"];

const conditionColors: Record<string, string> = {
  "Excelente": "bg-green-100 text-green-800",
  "Bom": "bg-blue-100 text-blue-800",
  "Regular": "bg-yellow-100 text-yellow-800",
  "Necessita Reparo": "bg-red-100 text-red-800",
};

export default function InventarioPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [locationFilter, setLocationFilter] = useState("Todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    purpose: "",
    condition: "",
    notes: "",
  });
  const [itemPhoto, setItemPhoto] = useState<File | null>(null);
  const [itemPhotoPreview, setItemPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading } = useInventoryItems();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  // Open dialog if new=true in URL
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todos" || item.category === categoryFilter;
    const matchesLocation = locationFilter === "Todos" || item.location === locationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      location: "",
      purpose: "",
      condition: "",
      notes: "",
    });
    setSelectedItem(null);
    setIsEditing(false);
    setItemPhoto(null);
    setItemPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedItem) {
        let imageUrl = selectedItem.image_url;
        if (itemPhoto) {
          imageUrl = await uploadInventoryPhoto(itemPhoto);
        }

        await updateItem.mutateAsync({
          id: selectedItem.id,
          ...formData,
          image_url: imageUrl,
        });
      } else {
        let imageUrl = null;
        if (itemPhoto) {
          imageUrl = await uploadInventoryPhoto(itemPhoto);
        }

        await createItem.mutateAsync({
          name: formData.name,
          category: formData.category,
          location: formData.location,
          purpose: formData.purpose || null,
          condition: formData.condition,
          notes: formData.notes || null,
          image_url: imageUrl,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar item:", error);
      toast.error("Erro ao salvar item: " + (error.message || "Tente novamente"));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      location: item.location,
      purpose: item.purpose || "",
      condition: item.condition,
      notes: item.notes || "",
    });
    setItemPhotoPreview(item.image_url);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteItemId) {
      await deleteItem.mutateAsync(deleteItemId);
      setDeleteItemId(null);
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
          <h1 className="font-display text-3xl font-bold text-foreground">Inventário</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os bens e equipamentos da igreja
          </p>
        </div>
        <Button variant="default" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-soft p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Local" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden"
          >
            <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${conditionColors[item.condition]}`}>
                  {item.condition}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              </div>
              {item.purpose && (
                <p className="text-sm text-muted-foreground mb-4">{item.purpose}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(item)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteItemId(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum item encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou adicione um novo item ao inventário.
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {isEditing ? "Editar Item" : "Adicionar Item ao Inventário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div
                className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden border-2 border-dashed border-muted-foreground/20"
                onClick={() => fileInputRef.current?.click()}
              >
                {itemPhotoPreview ? (
                  <img src={itemPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Clique para adicionar foto</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setItemPhoto(file);
                    setItemPhotoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {itemPhotoPreview && (
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Alterar Foto
                </Button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome do Item *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Guitarra Fender"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoria *
                </label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Local *
                </label>
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.slice(1).map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Finalidade
              </label>
              <Input
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Para que está sendo utilizado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estado de Conservação *
              </label>
              <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Observações
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" variant="default" className="flex-1" disabled={createItem.isPending || updateItem.isPending}>
                {createItem.isPending || updateItem.isPending ? "Salvando..." : isEditing ? "Salvar" : "Adicionar Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              {selectedItem.image_url && (
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <p className="font-medium text-foreground">{selectedItem.category}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Local</span>
                  <p className="font-medium text-foreground">{selectedItem.location}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${conditionColors[selectedItem.condition]}`}>
                    {selectedItem.condition}
                  </span>
                </div>
              </div>
              {selectedItem.purpose && (
                <div>
                  <span className="text-sm text-muted-foreground">Finalidade</span>
                  <p className="font-medium text-foreground">{selectedItem.purpose}</p>
                </div>
              )}
              {selectedItem.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Observações</span>
                  <p className="font-medium text-foreground">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
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
