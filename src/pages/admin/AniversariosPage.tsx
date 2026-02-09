import { useState } from "react";
import { Plus, Search, Cake, Heart, Trash2, Edit, Loader2, Calendar, Phone, Mail, MapPin, FileText, Link2, Copy } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";

export default function AniversariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<BirthdayWithMinistries | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState("");
  const [reportMinistryFilter, setReportMinistryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    woman_name: "",
    man_name: "",
    birthday_date: "",
    birthday_type: "personal" as "personal" | "wedding",
    phone: "",
    email: "",
    address: "",
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
      phone: "",
      email: "",
      address: "",
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
      phone: (birthday as any).phone || "",
      email: (birthday as any).email || "",
      address: (birthday as any).address || "",
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
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
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

  const reportBirthdays = birthdays.filter((b) => {
    const name = (b.woman_name || "") + " " + (b.man_name || "");
    const matchesSearch = name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      ((b as any).phone || "").includes(reportSearch) ||
      ((b as any).email || "").toLowerCase().includes(reportSearch.toLowerCase());

    if (reportMinistryFilter === "all") return matchesSearch;
    if (reportMinistryFilter === "none") {
      return matchesSearch && (!b.ministries || b.ministries.length === 0);
    }
    return matchesSearch && b.ministries?.some((m) => m.ministry_id === reportMinistryFilter);
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

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/cadastro-aniversario`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
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
          <p className="text-muted-foreground mt-1">Gerencie os aniversários e bodas da igreja</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyRegistrationLink}>
            <Link2 className="w-4 h-4 mr-2" />
            Copiar Link de Cadastro
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Aniversário
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <Cake className="w-4 h-4 mr-2" />
            Aniversários
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
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

          <div className="grid gap-4">
            {filteredBirthdays.map((birthday) => (
              <div key={birthday.id} className="bg-card rounded-xl p-5 shadow-soft flex items-center gap-4">
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
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(birthday as any).phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {(birthday as any).phone}
                      </span>
                    )}
                    {(birthday as any).email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {(birthday as any).email}
                      </span>
                    )}
                  </div>
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
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(birthday.id)}>
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
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          <div className="bg-card rounded-xl shadow-soft p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, telefone ou email..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={reportMinistryFilter} onValueChange={setReportMinistryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar ministério" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="none">Sem Ministério</SelectItem>
                {ministries.filter((m) => m.is_active).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Telefone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Endereço</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Ministérios</th>
                  </tr>
                </thead>
                <tbody>
                  {reportBirthdays.map((b) => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3 font-medium text-foreground">{getName(b)}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(b.birthday_date)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.birthday_type === "wedding" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {b.birthday_type === "wedding" ? "Casamento" : "Pessoal"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{(b as any).phone || "—"}</td>
                      <td className="p-3 text-muted-foreground">{(b as any).email || "—"}</td>
                      <td className="p-3 text-muted-foreground">{(b as any).address || "—"}</td>
                      <td className="p-3">
                        {b.ministries && b.ministries.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.ministries.map((m) => {
                              const ministry = ministries.find((min) => min.id === m.ministry_id);
                              return ministry ? (
                                <span key={m.ministry_id} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                                  {ministry.title}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem ministério</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportBirthdays.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado.</p>
              </div>
            )}
            <div className="p-3 border-t border-border text-sm text-muted-foreground">
              {reportBirthdays.length} resultado(s)
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedBirthday ? "Editar Aniversário" : "Novo Aniversário"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.birthday_type}
                onValueChange={(v) => setFormData({ ...formData, birthday_type: v as "personal" | "wedding" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Aniversário Pessoal</SelectItem>
                  <SelectItem value="wedding">Aniversário de Casamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.birthday_type === "wedding" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Marido</Label>
                  <Input value={formData.man_name} onChange={(e) => setFormData({ ...formData, man_name: e.target.value })} placeholder="Nome do marido" />
                </div>
                <div className="space-y-2">
                  <Label>Nome da Mulher</Label>
                  <Input value={formData.woman_name} onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })} placeholder="Nome da mulher" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.woman_name || formData.man_name} onChange={(e) => setFormData({ ...formData, woman_name: e.target.value, man_name: "" })} placeholder="Nome da pessoa" required />
              </div>
            )}

            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={formData.birthday_date} onChange={(e) => setFormData({ ...formData, birthday_date: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Endereço completo" />
            </div>

            <div className="space-y-2">
              <Label>Ministérios</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {ministries.filter((m) => m.is_active).map((ministry) => (
                  <div key={ministry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`ministry-${ministry.id}`}
                      checked={formData.ministry_ids.includes(ministry.id)}
                      onCheckedChange={() => toggleMinistry(ministry.id)}
                    />
                    <label htmlFor={`ministry-${ministry.id}`} className="text-sm cursor-pointer">{ministry.title}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancelar</Button>
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
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
