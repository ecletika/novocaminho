import { useState } from "react";
import { Cake, Heart, CheckCircle, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PublicBirthdayRegister() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: ministries = [] } = useMinistries();

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
      const { data, error } = await supabase.functions.invoke("public-birthday-register", {
        body: formData,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-foreground">Cadastro realizado!</h2>
          <p className="text-muted-foreground">
            Obrigado por se cadastrar. Seus dados foram salvos com sucesso.
          </p>
          <Button onClick={() => { setSubmitted(false); setFormData({ woman_name: "", man_name: "", birthday_date: "", birthday_type: "personal", phone: "", email: "", address: "", ministry_ids: [] }); }}>
            Fazer outro cadastro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Cake className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Cadastro de Aniversário</h1>
          <p className="text-muted-foreground mt-1">Preencha seus dados para registrar seu aniversário</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {formData.birthday_type === "wedding" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Marido</Label>
                <Input
                  value={formData.man_name}
                  onChange={(e) => setFormData({ ...formData, man_name: e.target.value })}
                  placeholder="Nome do marido"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome da Mulher</Label>
                <Input
                  value={formData.woman_name}
                  onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })}
                  placeholder="Nome da mulher"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.woman_name || formData.man_name}
                onChange={(e) => setFormData({ ...formData, woman_name: e.target.value, man_name: "" })}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Data de Aniversário *</Label>
            <Input
              type="date"
              value={formData.birthday_date}
              onChange={(e) => setFormData({ ...formData, birthday_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Seu endereço"
            />
          </div>

          <div className="space-y-2">
            <Label>Ministérios</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ministry-none"
                  checked={formData.ministry_ids.length === 0}
                  onCheckedChange={() => setFormData({ ...formData, ministry_ids: [] })}
                />
                <label htmlFor="ministry-none" className="text-sm cursor-pointer">Sem Ministério</label>
              </div>
              {ministries.filter((m) => m.is_active).map((ministry) => (
                <div key={ministry.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`pub-ministry-${ministry.id}`}
                    checked={formData.ministry_ids.includes(ministry.id)}
                    onCheckedChange={() => toggleMinistry(ministry.id)}
                  />
                  <label htmlFor={`pub-ministry-${ministry.id}`} className="text-sm cursor-pointer">
                    {ministry.title}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
}
