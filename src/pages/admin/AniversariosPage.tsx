import { useState, useRef } from "react";
import { Plus, Search, Cake, Heart, Trash2, Edit, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useBirthdays,
  useCreateBirthday,
  useUpdateBirthday,
  useDeleteBirthday,
  BirthdayWithMinistries,
} from "@/hooks/useBirthdays";
import { useMinistries } from "@/hooks/useMinistries";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AniversariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<BirthdayWithMinistries | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    woman_name: "",
    man_name: "",
    birthday_date: "",
    birthday_type: "personal" as "personal" | "wedding",
    ministry_ids: [] as string[],
  });

  const { data: birthdays = [], isLoading } = useBirthdays();
  const { data: ministries = [] } = useMinistries();
  const createBirthday = useCreateBirthday();
  const updateBirthday = useUpdateBirthday();
  const deleteBirthday = useDeleteBirthday();

  const resetForm = () => {
    setFormData({
      woman_name: "",
      man_name: "",
      birthday_date: "",
      birthday_type: "personal",
      ministry_ids: [],
    });
    setSelectedBirthday(null);
  };

  const openEditDialog = (birthday: BirthdayWithMinistries) => {
    setSelectedBirthday(birthday);
    setFormData({
      woman_name: birthday.woman_name || "",
      man_name: birthday.man_name || "",
      birthday_date: birthday.birthday_date,
      birthday_type: birthday.birthday_type as "personal" | "wedding",
      ministry_ids: birthday.ministries?.map((m) => m.ministry_id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      woman_name: formData.woman_name || null,
      man_name: formData.man_name || null,
      birthday_date: formData.birthday_date,
      birthday_type: formData.birthday_type,
      ministry_ids: formData.ministry_ids,
    };

    if (selectedBirthday) {
      await updateBirthday.mutateAsync({ id: selectedBirthday.id, ...data });
    } else {
      await createBirthday.mutateAsync(data);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBirthday.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const toggleMinistry = (ministryId: string) => {
    setFormData((prev) => ({
      ...prev,
      ministry_ids: prev.ministry_ids.includes(ministryId)
        ? prev.ministry_ids.filter((id) => id !== ministryId)
        : [...prev.ministry_ids, ministryId],
    }));
  };

  const filteredBirthdays = birthdays.filter((b) => {
    const name = b.woman_name || b.man_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const getName = (birthday: BirthdayWithMinistries) => {
    if (birthday.birthday_type === "wedding") {
      const names = [birthday.man_name, birthday.woman_name].filter(Boolean);
      return names.join(" & ");
    }
    return birthday.woman_name || birthday.man_name || "";
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
          <h1 className="font-display text-3xl font-bold text-foreground">Aniversários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os aniversários e bodas da igreja
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Aniversário
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl shadow-soft p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredBirthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="bg-card rounded-xl p-5 shadow-soft flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {birthday.birthday_type === "wedding" ? (
                <Heart className="w-6 h-6 text-primary" />
              ) : (
                <Cake className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{getName(birthday)}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  birthday.birthday_type === "wedding"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {birthday.birthday_type === "wedding" ? "Casamento" : "Pessoal"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(birthday.birthday_date)}
              </p>
              {birthday.ministries && birthday.ministries.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {birthday.ministries.map((m) => {
                    const ministry = ministries.find((min) => min.id === m.ministry_id);
                    return ministry ? (
                      <span key={m.ministry_id} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                        {ministry.title}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEditDialog(birthday)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(birthday.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {filteredBirthdays.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Cake className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum aniversário cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedBirthday ? "Editar Aniversário" : "Novo Aniversário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Type */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.birthday_type}
                onValueChange={(v) => setFormData({ ...formData, birthday_type: v as "personal" | "wedding" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Aniversário Pessoal</SelectItem>
                  <SelectItem value="wedding">Aniversário de Casamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Names */}
            {formData.birthday_type === "wedding" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="man_name">Nome do Marido</Label>
                  <Input
                    id="man_name"
                    value={formData.man_name}
                    onChange={(e) => setFormData({ ...formData, man_name: e.target.value })}
                    placeholder="Nome do marido"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="woman_name">Nome da Mulher</Label>
                  <Input
                    id="woman_name"
                    value={formData.woman_name}
                    onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })}
                    placeholder="Nome da mulher"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.woman_name || formData.man_name}
                  onChange={(e) => setFormData({ ...formData, woman_name: e.target.value, man_name: "" })}
                  placeholder="Nome da pessoa"
                  required
                />
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.birthday_date}
                onChange={(e) => setFormData({ ...formData, birthday_date: e.target.value })}
                required
              />
            </div>

            {/* Ministries */}
            <div className="space-y-2">
              <Label>Ministérios</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {ministries.filter(m => m.is_active).map((ministry) => (
                  <div key={ministry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ministry-${ministry.id}`}
                      checked={formData.ministry_ids.includes(ministry.id)}
                      onCheckedChange={() => toggleMinistry(ministry.id)}
                    />
                    <label htmlFor={`ministry-${ministry.id}`} className="text-sm cursor-pointer">
                      {ministry.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createBirthday.isPending || updateBirthday.isPending}>
                {(createBirthday.isPending || updateBirthday.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedBirthday ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aniversário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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
