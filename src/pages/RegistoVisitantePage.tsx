import { useState } from "react";
import { CheckCircle, Loader2, Heart, HandHeart, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useCreateVisitor,
  ACCOMPANIED_OPTIONS,
  PRAYER_OPTIONS,
} from "@/hooks/useVisitors";
import {
  useVisitorPortalConfig,
  DEFAULT_PORTAL_CONFIG,
} from "@/hooks/useVisitorPortalConfig";
import { CHURCHES } from "@/constants/churches";

const initialForm = {
  church: "" as string,
  name: "",
  birth_date: "",
  address: "",
  phone: "",
  email: "",
  photo_url: "",
  wants_home_visit: null as boolean | null,
  accompanied_by: [] as string[],
  prayer_requests: [] as string[],
};

export default function RegistoVisitantePage() {
  const { data: config = DEFAULT_PORTAL_CONFIG } = useVisitorPortalConfig();
  const createVisitor = useCreateVisitor();
  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const accent = config.accent_color || DEFAULT_PORTAL_CONFIG.accent_color;

  const toggleInList = (key: "accompanied_by" | "prayer_requests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+\s]/g, "");
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `visitors/${fileName}`;
      const { error } = await supabase.storage.from("photos").upload(filePath, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      toast.success("Foto carregada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao carregar foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.church) {
      toast.error("Por favor, selecione a igreja.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Por favor, indique o seu nome.");
      return;
    }
    try {
      await createVisitor.mutateAsync({
        church: formData.church || null,
        name: formData.name.trim(),
        birth_date: formData.birth_date || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        photo_url: formData.photo_url || null,
        wants_home_visit: formData.wants_home_visit === true,
        accompanied_by: formData.accompanied_by,
        prayer_requests: formData.prayer_requests,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar. Tente novamente.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 mx-auto" style={{ color: accent }} />
          <h2 className="font-display text-2xl font-bold text-foreground">Registo concluído!</h2>
          <p className="text-muted-foreground">{config.success_message}</p>
          <Button
            className="w-full"
            style={{ backgroundColor: accent }}
            onClick={() => {
              setSubmitted(false);
              setFormData(initialForm);
            }}
          >
            Registar outra pessoa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          {config.logo_url ? (
            <img
              src={config.logo_url}
              alt="Logo"
              className="h-16 w-auto object-contain mx-auto mb-4"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${accent}1a` }}
            >
              <Heart className="w-8 h-8" style={{ color: accent }} />
            </div>
          )}
          <h1 className="font-display text-2xl font-bold text-foreground">{config.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{config.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Igreja ── */}
          <div className="space-y-2">
            <Label>Qual a igreja que está a visitar? *</Label>
            <div className="grid grid-cols-2 gap-3">
              {CHURCHES.map((c) => {
                const active = formData.church === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, church: c.key })}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      active
                        ? "text-white"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                    style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Quem esteve consigo ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: accent }} />
              Quem esteve consigo nesta visita?
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOMPANIED_OPTIONS.map((opt) => {
                const active = formData.accompanied_by.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleInList("accompanied_by", opt.key)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      active
                        ? "text-white"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                    style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Nome ── */}
          <div className="space-y-2">
            <Label>Nome completo *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="O seu nome"
              required
            />
          </div>

          {/* ── Data de aniversário ── */}
          <div className="space-y-2">
            <Label>Data de aniversário</Label>
            <Input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          {/* ── Telefone ── */}
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="912 345 678"
            />
          </div>

          {/* ── Email ── */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>

          {/* ── Morada ── */}
          <div className="space-y-2">
            <Label>Endereço / Morada</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="A sua morada"
            />
          </div>

          {/* ── Foto ── */}
          <div className="space-y-2">
            <Label>Foto</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="upload" className="text-xs">
                  Ficheiro
                </TabsTrigger>
                <TabsTrigger value="link" className="text-xs">
                  Link da Foto
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              </TabsContent>
              <TabsContent value="link">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                />
              </TabsContent>
            </Tabs>
            {uploading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> A carregar...
              </div>
            )}
            {formData.photo_url && !uploading && (
              <div className="mt-2 flex justify-center">
                <img
                  src={formData.photo_url}
                  alt="Pré-visualização"
                  className="w-20 h-20 rounded-full object-cover border-2"
                  style={{ borderColor: `${accent}33` }}
                />
              </div>
            )}
          </div>

          {/* ── Visita em casa ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Home className="w-4 h-4" style={{ color: accent }} />
              Desejo receber visitas em minha casa
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sim", value: true },
                { label: "Não", value: false },
              ].map((opt) => {
                const active = formData.wants_home_visit === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, wants_home_visit: opt.value })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      active
                        ? "text-white"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                    style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Pedidos de oração ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HandHeart className="w-4 h-4" style={{ color: accent }} />
              Iremos orar por si. Gostaria de receber oração pelo quê?
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/10">
              {PRAYER_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  htmlFor={`prayer-${opt.key}`}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    id={`prayer-${opt.key}`}
                    checked={formData.prayer_requests.includes(opt.key)}
                    onCheckedChange={() => toggleInList("prayer_requests", opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 text-white"
            style={{ backgroundColor: accent }}
            disabled={createVisitor.isPending || uploading}
          >
            {createVisitor.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {config.button_label}
          </Button>
        </form>
      </div>
    </div>
  );
}
