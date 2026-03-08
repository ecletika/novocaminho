import { useState, useMemo } from "react";
import { Cake, Heart, CheckCircle, Loader2, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMinistries } from "@/hooks/useMinistries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SLUG_CASADOS = ["casados", "casal", "casais", "casados-para-sempre"];

function isCasaisMinistry(m: { slug: string; title: string }) {
  const slug = m.slug.toLowerCase();
  const title = m.title.toLowerCase();
  return (
    SLUG_CASADOS.some((s) => slug.includes(s)) ||
    title.includes("casado") ||
    title.includes("casal") ||
    title.includes("casais")
  );
}

const initialForm = {
  woman_name: "",
  man_name: "",
  birthday_date: "",
  birthday_type: "personal" as "personal" | "wedding",
  photo_url: "",
  phone: "",
  email: "",
  address: "",
  woman_birthday: "",
  man_birthday: "",
  leader_name: "",
  man_phone: "",
  woman_phone: "",
  ministry_ids: [] as string[],
};

export default function RegistoAniversarioPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: ministries = [] } = useMinistries();
  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  // Ministérios filtrados conforme o tipo de registo
  const visibleMinistries = useMemo(() => {
    const active = ministries.filter((m) => m.is_active);
    if (formData.birthday_type === "wedding") {
      // Casamento → mostra APENAS o ministério de casais
      return active.filter(isCasaisMinistry);
    }
    // Pessoal → mostra todos
    return active;
  }, [ministries, formData.birthday_type]);

  // Ao mudar o tipo, limpa os ministérios seleccionados e pré-selecciona casais se for wedding
  const handleTypeChange = (v: "personal" | "wedding") => {
    if (v === "wedding") {
      const casaisIds = ministries
        .filter((m) => m.is_active && isCasaisMinistry(m))
        .map((m) => m.id);
      setFormData((prev) => ({ ...prev, birthday_type: v, ministry_ids: casaisIds }));
    } else {
      setFormData((prev) => ({ ...prev, birthday_type: v, ministry_ids: [] }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error } = await supabase.storage.from("photos").upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      toast.success("Foto carregada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao carregar foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleMinistry = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      ministry_ids: prev.ministry_ids.includes(id)
        ? prev.ministry_ids.filter((m) => m !== id)
        : [...prev.ministry_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Independentemente do tipo de registo, o registo de casamento é guardado
      // como registo normal — o campo birthday_type indica a origem para o admin
      // poder associar depois a outros ministérios.
      const { error } = await supabase.functions.invoke("public-birthday-register", {
        body: formData,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-foreground">Registo realizado!</h2>
          <p className="text-muted-foreground">
            Obrigado por se registar. Os seus dados foram guardados com sucesso.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData(initialForm);
            }}
          >
            Fazer outro registo
          </Button>
        </div>
      </div>
    );
  }

  const isWedding = formData.birthday_type === "wedding";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isWedding ? (
              <Heart className="w-8 h-8 text-primary" />
            ) : (
              <Cake className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Registo de Aniversário
          </h1>
          <p className="text-muted-foreground mt-1">
            Preencha os seus dados para registar o aniversário
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Tipo de Registo ── */}
          <div className="space-y-2">
            <Label>Tipo de Registo</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("personal")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${!isWedding
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">Pessoal</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("wedding")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isWedding
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm font-medium">Casamento</span>
              </button>
            </div>
            {isWedding && (
              <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                💡 O registo de casamento é guardado individualmente para cada cônjuge.
                O pastor/líder irá associá-los a outros ministérios depois.
              </p>
            )}
          </div>

          {/* ── Campos por tipo ── */}
          {isWedding ? (
            <>
              {/* Nomes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Marido *</Label>
                  <Input
                    value={formData.man_name}
                    onChange={(e) => setFormData({ ...formData, man_name: e.target.value })}
                    placeholder="Nome do marido"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome da Mulher *</Label>
                  <Input
                    value={formData.woman_name}
                    onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })}
                    placeholder="Nome da mulher"
                    required
                  />
                </div>
              </div>

              {/* Datas de nascimento individuais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aniversário do Marido *</Label>
                  <Input
                    type="date"
                    value={formData.man_birthday}
                    onChange={(e) => setFormData({ ...formData, man_birthday: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aniversário da Mulher *</Label>
                  <Input
                    type="date"
                    value={formData.woman_birthday}
                    onChange={(e) => setFormData({ ...formData, woman_birthday: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Telemóveis */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telemóvel do Marido</Label>
                  <Input
                    value={formData.man_phone}
                    onChange={(e) => setFormData({ ...formData, man_phone: e.target.value })}
                    placeholder="9xx xxx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telemóvel da Mulher</Label>
                  <Input
                    value={formData.woman_phone}
                    onChange={(e) => setFormData({ ...formData, woman_phone: e.target.value })}
                    placeholder="9xx xxx xxx"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.woman_name || formData.man_name}
                  onChange={(e) =>
                    setFormData({ ...formData, woman_name: e.target.value, man_name: "" })
                  }
                  placeholder="O seu nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Telemóvel</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="912 345 678"
                />
              </div>
            </>
          )}

          {/* ── Data Principal ── */}
          <div className="space-y-2">
            <Label>{isWedding ? "Data do Casamento *" : "Data de Aniversário *"}</Label>
            <Input
              type="date"
              value={formData.birthday_date}
              onChange={(e) => setFormData({ ...formData, birthday_date: e.target.value })}
              required
            />
          </div>

          {/* ── Foto ── */}
          <div className="space-y-2">
            <Label>Foto {isWedding ? "(foto do casal)" : ""}</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="upload" className="text-xs">Ficheiro</TabsTrigger>
                <TabsTrigger value="link" className="text-xs">Link da Foto</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
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
            {formData.photo_url && (
              <p className="text-xs text-green-600 font-medium">✓ Foto selecionada!</p>
            )}
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
            <Label>Morada</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="A sua morada"
            />
          </div>

          {/* ── Líder ── */}
          <div className="space-y-2">
            <Label>Líder / Supervisor</Label>
            <Input
              value={formData.leader_name}
              onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
              placeholder="Nome do seu líder (se souber)"
            />
          </div>

          {/* ── Ministérios ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {isWedding ? "Ministério" : "Ministérios"}
            </Label>

            {isWedding && visibleMinistries.length === 0 && (
              <p className="text-xs text-muted-foreground italic border rounded-lg p-3 bg-muted/20">
                Nenhum ministério de casais encontrado. Será associado pelo líder.
              </p>
            )}

            {visibleMinistries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg bg-muted/10">
                {!isWedding && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Checkbox
                      id="ministry-none"
                      checked={formData.ministry_ids.length === 0}
                      onCheckedChange={() => setFormData({ ...formData, ministry_ids: [] })}
                    />
                    <label htmlFor="ministry-none" className="text-sm cursor-pointer text-muted-foreground italic">
                      Sem Ministério
                    </label>
                  </div>
                )}
                {visibleMinistries.map((ministry) => (
                  <div key={ministry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`pub-ministry-${ministry.id}`}
                      checked={formData.ministry_ids.includes(ministry.id)}
                      onCheckedChange={() => toggleMinistry(ministry.id)}
                      // No modo casamento o ministério é pré-seleccionado e não deve ser desmarcado
                      disabled={isWedding}
                    />
                    <label
                      htmlFor={`pub-ministry-${ministry.id}`}
                      className={`text-sm ${isWedding ? "text-foreground font-medium" : "cursor-pointer"}`}
                    >
                      {ministry.title}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting || uploading}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Registar
          </Button>
        </form>
      </div>
    </div>
  );
}
