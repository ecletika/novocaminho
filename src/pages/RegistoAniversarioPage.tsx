import { useState } from "react";
import { Cake, Heart, CheckCircle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMinistries } from "@/hooks/useMinistries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CHURCHES } from "@/constants/churches";
import { toast } from "sonner";

const initialForm = {
  church: "" as string,
  name: "",
  gender: "" as "male" | "female" | "",
  birthday_date: "",
  wedding_date: "",
  photo_url: "",
  phone: "",
  email: "",
  address: "",
  leader_name: "",
  ministry_ids: [] as string[],
};

export default function RegistoAniversarioPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: ministries = [] } = useMinistries();
  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  const visibleMinistries = ministries.filter((m) => m.is_active);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.church) {
      toast.error("Por favor, selecione a igreja.");
      return;
    }
    if (!formData.gender) {
      toast.error("Por favor, selecione o género.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Por favor, preencha o seu nome.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { ministry_ids } = formData;
      const name = formData.name.trim();

      // Registo sempre pessoal. A data de casamento é opcional e individual.
      const payload: any = {
        birthday_type: "personal",
        birthday_date: null,
        church: formData.church || null,
        photo_url: formData.photo_url || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        leader_name: formData.leader_name || null,
        wedding_date: formData.wedding_date || null,
      };

      if (formData.gender === "male") {
        payload.man_name = name;
        payload.man_birthday = formData.birthday_date;
        payload.woman_name = null;
        payload.woman_birthday = null;
      } else {
        payload.woman_name = name;
        payload.woman_birthday = formData.birthday_date;
        payload.man_name = null;
        payload.man_birthday = null;
      }

      // 1. Inserir o aniversário.
      //    Rede de segurança: se a coluna wedding_date ainda não existir na BD,
      //    o registo grava na mesma (sem a data de casamento) em vez de falhar.
      let { data: birthday, error: insertError } = await supabase
        .from("birthdays")
        .insert(payload)
        .select()
        .single();

      if (insertError && (insertError.code === "PGRST204" || /wedding_date/i.test(insertError.message || ""))) {
        const { wedding_date, ...withoutWedding } = payload;
        ({ data: birthday, error: insertError } = await supabase
          .from("birthdays")
          .insert(withoutWedding)
          .select()
          .single());
      }

      if (insertError) throw insertError;

      // 2. Associar ministérios (se houver)
      if (ministry_ids.length > 0) {
        const relationships = ministry_ids.map((id) => ({
          birthday_id: birthday.id,
          ministry_id: id,
        }));
        const { error: relError } = await supabase
          .from("birthday_ministries")
          .insert(relationships);
        if (relError) console.error("Erro ao associar ministérios:", relError);
      }

      toast.success("Registo concluído com sucesso!");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission error:", err);
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
            className="w-full"
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Cake className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Registo de Aniversário
          </h1>
          <p className="text-muted-foreground mt-1">
            Preencha os seus dados para registar o seu aniversário
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Igreja ── */}
          <div className="space-y-2">
            <Label>Qual a sua igreja? *</Label>
            <div className="grid grid-cols-2 gap-3">
              {CHURCHES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, church: c.key })}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${formData.church === c.key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Género ── */}
          <div className="space-y-2">
            <Label>Género *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "male" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.gender === "male"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
              >
                <span className="text-2xl">👨</span>
                <span className="text-sm font-medium">Homem</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "female" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.gender === "female"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
              >
                <span className="text-2xl">👩</span>
                <span className="text-sm font-medium">Mulher</span>
              </button>
            </div>
          </div>

          {/* ── Nome ── */}
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="O seu nome completo"
              required
            />
          </div>

          {/* ── Data de Aniversário ── */}
          <div className="space-y-2">
            <Label>Data de Aniversário *</Label>
            <Input
              type="date"
              value={formData.birthday_date}
              onChange={(e) => setFormData({ ...formData, birthday_date: e.target.value })}
              required
            />
          </div>

          {/* ── Data de Aniversário de Casamento (opcional) ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Data de Aniversário de Casamento
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              type="date"
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Se for casado(a), indique a data do seu casamento para celebrarmos as bodas.
            </p>
          </div>

          {/* ── Telemóvel ── */}
          <div className="space-y-2">
            <Label>Telemóvel</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="912 345 678"
            />
          </div>

          {/* ── Foto ── */}
          <div className="space-y-2">
            <Label>Foto</Label>
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
              Ministérios
            </Label>
            {visibleMinistries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg bg-muted/10">
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
                {visibleMinistries.map((ministry) => (
                  <div key={ministry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`pub-ministry-${ministry.id}`}
                      checked={formData.ministry_ids.includes(ministry.id)}
                      onCheckedChange={() => toggleMinistry(ministry.id)}
                    />
                    <label
                      htmlFor={`pub-ministry-${ministry.id}`}
                      className="text-sm cursor-pointer"
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
