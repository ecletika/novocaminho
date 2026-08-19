import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Trash2,
  Edit,
  Users,
  FileText,
  QrCode,
  Palette,
  Link2,
  Copy,
  Printer,
  Home,
  Phone,
  Mail,
  MapPin,
  Cake,
  HandHeart,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  useVisitors,
  useUpdateVisitor,
  useDeleteVisitor,
  ACCOMPANIED_OPTIONS,
  PRAYER_OPTIONS,
  labelFor,
  Visitor,
} from "@/hooks/useVisitors";
import {
  useVisitorPortalConfig,
  useUpdateVisitorPortalConfig,
  DEFAULT_PORTAL_CONFIG,
  VisitorPortalConfig,
} from "@/hooks/useVisitorPortalConfig";
import { format } from "date-fns";
import { toast } from "sonner";
import { CHURCHES, churchLabel } from "@/constants/churches";

const emptyEdit = {
  church: "",
  name: "",
  birth_date: "",
  address: "",
  phone: "",
  email: "",
  photo_url: "",
  wants_home_visit: false,
  accompanied_by: [] as string[],
  prayer_requests: [] as string[],
  notes: "",
};

export default function AdminVisitantesPage() {
  const { data: visitors = [], isLoading } = useVisitors();
  const updateVisitor = useUpdateVisitor();
  const deleteVisitor = useDeleteVisitor();
  const { data: config } = useVisitorPortalConfig();
  const updateConfig = useUpdateVisitorPortalConfig();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Visitor | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<VisitorPortalConfig>(DEFAULT_PORTAL_CONFIG);
  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const registrationUrl = `${window.location.origin}/registo-visitante`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
    registrationUrl,
  )}`;

  const filtered = visitors.filter((v) => {
    const s = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(s) ||
      (v.phone || "").includes(search) ||
      (v.email || "").toLowerCase().includes(s)
    );
  });

  const openEdit = (v: Visitor) => {
    setEditing(v);
    setEditForm({
      church: v.church || "",
      name: v.name,
      birth_date: v.birth_date || "",
      address: v.address || "",
      phone: v.phone || "",
      email: v.email || "",
      photo_url: v.photo_url || "",
      wants_home_visit: v.wants_home_visit,
      accompanied_by: v.accompanied_by || [],
      prayer_requests: v.prayer_requests || [],
      notes: v.notes || "",
    });
  };

  const toggleEditList = (key: "accompanied_by" | "prayer_requests", value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleEditPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(`visitors/${fileName}`, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(`visitors/${fileName}`);
      setEditForm((prev) => ({ ...prev, photo_url: publicUrl }));
      toast.success("Foto carregada!");
    } catch (err: any) {
      toast.error("Erro ao carregar foto: " + err.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateVisitor.mutateAsync({
        id: editing.id,
        church: editForm.church || null,
        name: editForm.name.trim(),
        birth_date: editForm.birth_date || null,
        address: editForm.address || null,
        phone: editForm.phone || null,
        email: editForm.email || null,
        photo_url: editForm.photo_url || null,
        wants_home_visit: editForm.wants_home_visit,
        accompanied_by: editForm.accompanied_by,
        prayer_requests: editForm.prayer_requests,
        notes: editForm.notes || null,
      });
      toast.success("Visitante atualizado!");
      setEditing(null);
    } catch (err: any) {
      toast.error("Erro ao guardar: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteVisitor.mutateAsync(deleteId);
    setDeleteId(null);
    toast.success("Visitante removido.");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    toast.success("Link copiado!");
  };

  const printQr = () => {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>QR Code - Registo de Visitantes</title>
        <style>
          body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#111}
          h1{font-size:28px;margin-bottom:8px}
          p{font-size:18px;color:#444;margin-top:0}
          img{margin:32px auto;display:block}
          .hint{font-size:16px;color:#666;margin-top:24px}
        </style></head>
        <body>
          <h1>${form.title || "Seja bem-vindo!"}</h1>
          <p>Aponte a câmara do telemóvel para o código e faça o seu registo</p>
          <img src="${qrSrc}" width="320" height="320" alt="QR Code" />
          <p class="hint">${registrationUrl}</p>
        </body>
      </html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfig.mutateAsync(form);
      toast.success("Portal personalizado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao guardar: " + err.message);
    }
  };

  const homeVisitCount = visitors.filter((v) => v.wants_home_visit).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Visitantes</h1>
          <p className="text-muted-foreground mt-1">
            {visitors.length} registados · {homeVisitCount} querem receber visita em casa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyLink}>
            <Link2 className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
          <Button asChild>
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
              Abrir Portal
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="flex w-full overflow-x-auto no-scrollbar justify-start mb-4">
          <TabsTrigger value="list" className="flex-1 sm:flex-none">
            <Users className="w-4 h-4 mr-2" /> Lista
          </TabsTrigger>
          <TabsTrigger value="report" className="flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2" /> Relatório
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex-1 sm:flex-none">
            <QrCode className="w-4 h-4 mr-2" /> QR Code
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1 sm:flex-none">
            <Palette className="w-4 h-4 mr-2" /> Personalizar
          </TabsTrigger>
        </TabsList>

        {/* ── Lista ── */}
        <TabsContent value="list" className="space-y-4">
          <div className="bg-card rounded-xl shadow-soft p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, telefone ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filtered.map((v) => (
              <div key={v.id} className="bg-card rounded-xl p-5 shadow-soft flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {v.photo_url ? (
                    <img src={v.photo_url} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-xl font-bold text-primary">
                      {v.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{v.name}</h3>
                    {v.church && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                        {churchLabel(v.church)}
                      </span>
                    )}
                    {v.wants_home_visit && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                        <Home className="w-3 h-3" /> Visita em casa
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    {v.birth_date && (
                      <span className="flex items-center gap-1">
                        <Cake className="w-3 h-3" /> {format(new Date(v.birth_date + "T12:00:00"), "dd/MM/yyyy")}
                      </span>
                    )}
                    {v.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {v.phone}
                      </span>
                    )}
                    {v.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {v.email}
                      </span>
                    )}
                    {v.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {v.address}
                      </span>
                    )}
                  </div>
                  {v.accompanied_by.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-muted-foreground mr-1">Acompanhado por:</span>
                      {v.accompanied_by.map((k) => (
                        <span key={k} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                          {labelFor(ACCOMPANIED_OPTIONS, k)}
                        </span>
                      ))}
                    </div>
                  )}
                  {v.prayer_requests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                        <HandHeart className="w-3 h-3" /> Oração:
                      </span>
                      {v.prayer_requests.map((k) => (
                        <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {labelFor(PRAYER_OPTIONS, k)}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Registado em {format(new Date(v.created_at), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(v.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum visitante encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Relatório ── */}
        <TabsContent value="report">
          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Igreja</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Aniversário</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Telefone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Morada</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Visita casa</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Acompanhado</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Oração</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Registo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3 font-medium text-foreground">{v.name}</td>
                      <td className="p-3 text-muted-foreground">{churchLabel(v.church)}</td>
                      <td className="p-3 text-muted-foreground">
                        {v.birth_date ? format(new Date(v.birth_date + "T12:00:00"), "dd/MM/yyyy") : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">{v.phone || "—"}</td>
                      <td className="p-3 text-muted-foreground">{v.email || "—"}</td>
                      <td className="p-3 text-muted-foreground">{v.address || "—"}</td>
                      <td className="p-3">
                        {v.wants_home_visit ? (
                          <span className="text-green-700 font-medium">Sim</span>
                        ) : (
                          <span className="text-muted-foreground">Não</span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {v.accompanied_by.map((k) => labelFor(ACCOMPANIED_OPTIONS, k)).join(", ") || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {v.prayer_requests.map((k) => labelFor(PRAYER_OPTIONS, k)).join(", ") || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(v.created_at), "dd/MM/yyyy HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado.</p>
              </div>
            )}
            <div className="p-3 border-t border-border text-sm text-muted-foreground">
              {filtered.length} resultado(s)
            </div>
          </div>
        </TabsContent>

        {/* ── QR Code ── */}
        <TabsContent value="qr">
          <div className="bg-card rounded-xl shadow-soft p-6 max-w-xl mx-auto text-center space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                QR Code do Portal de Visitantes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Imprima e coloque na igreja. Os visitantes apontam a câmara e registam-se.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src={qrSrc}
                alt="QR Code de registo de visitantes"
                width={280}
                height={280}
                className="rounded-xl border border-border p-2 bg-white"
              />
            </div>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <code className="text-xs bg-muted px-3 py-2 rounded-lg break-all">{registrationUrl}</code>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copiar Link
              </Button>
              <Button onClick={printQr}>
                <Printer className="w-4 h-4 mr-2" /> Imprimir QR Code
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Personalizar ── */}
        <TabsContent value="custom">
          <div className="bg-card rounded-xl shadow-soft p-6 max-w-2xl space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Personalizar Portal
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize o que os visitantes veem na página de registo.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Seja bem-vindo!"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtítulo / Mensagem de boas-vindas</Label>
              <Textarea
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor principal</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                    className="h-10 w-14 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={form.accent_color}
                    onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto do botão</Label>
                <Input
                  value={form.button_label}
                  onChange={(e) => setForm({ ...form, button_label: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL do logótipo (opcional)</Label>
              <Input
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem de agradecimento (após registo)</Label>
              <Textarea
                value={form.success_message}
                onChange={(e) => setForm({ ...form, success_message: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label className="text-sm">Mostrar "Visitantes do Dia" publicamente</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se desligado, a página pública mostra apenas o convite ao registo (fotos ocultas).
                </p>
              </div>
              <Switch
                checked={form.show_daily_public}
                onCheckedChange={(v) => setForm({ ...form, show_daily_public: v })}
              />
            </div>

            <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
              {updateConfig.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Personalização
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Visitante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Igreja</Label>
              <div className="grid grid-cols-2 gap-2">
                {CHURCHES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, church: editForm.church === c.key ? "" : c.key })}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      editForm.church === c.key
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de aniversário</Label>
                <Input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Morada</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={handleEditPhoto} className="text-xs" />
              {editForm.photo_url && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={editForm.photo_url}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label className="text-sm">Deseja receber visitas em casa</Label>
              <Switch
                checked={editForm.wants_home_visit}
                onCheckedChange={(v) => setEditForm({ ...editForm, wants_home_visit: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Quem esteve com o visitante</Label>
              <div className="flex flex-wrap gap-3 p-3 border rounded-lg">
                {ACCOMPANIED_OPTIONS.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={editForm.accompanied_by.includes(opt.key)}
                      onCheckedChange={() => toggleEditList("accompanied_by", opt.key)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pedidos de oração</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                {PRAYER_OPTIONS.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={editForm.prayer_requests.includes(opt.key)}
                      onCheckedChange={() => toggleEditList("prayer_requests", opt.key)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={2}
                placeholder="Observações da equipa (não visível ao visitante)"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={updateVisitor.isPending}>
                {updateVisitor.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover visitante?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
