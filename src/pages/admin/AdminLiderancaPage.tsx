
import { useState, useMemo } from "react";
import { Users, Shield, Save, Loader2, ChevronRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBirthdays, BirthdayWithMinistries } from "@/hooks/useBirthdays";
import { useMinistries } from "@/hooks/useMinistries";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LeadershipPage() {
    const [selectedMinistryId, setSelectedMinistryId] = useState<string>("");
    const [saving, setSaving] = useState<string | null>(null);

    const { data: birthdays = [], isLoading: loadingBirthdays, refetch } = useBirthdays();
    const { data: ministries = [], isLoading: loadingMinistries } = useMinistries();

    const ministryMembers = useMemo(() => {
        if (!selectedMinistryId) return [];
        return birthdays.filter(b =>
            b.ministries?.some(m => m.ministry_id === selectedMinistryId)
        );
    }, [birthdays, selectedMinistryId]);

    const activeMinistries = useMemo(() =>
        ministries.filter(m => m.is_active),
        [ministries]);

    const getName = (b: any) => {
        if (b.birthday_type === "wedding") {
            return `${b.man_name} & ${b.woman_name}`;
        }
        return b.woman_name || b.man_name || "Sem nome";
    };

    const currentMinistry = useMemo(() =>
        activeMinistries.find(m => m.id === selectedMinistryId),
        [activeMinistries, selectedMinistryId]);

    const handleUpdateLeader = async (memberId: string, leaderId: string | null) => {
        setSaving(memberId);
        try {
            const { error } = await supabase
                .from("birthday_ministries")
                .update({ leader_id: leaderId === "none" ? null : leaderId })
                .eq("birthday_id", memberId)
                .eq("ministry_id", selectedMinistryId);

            if (error) throw error;

            toast.success("Líder atualizado com sucesso!");
            refetch();
        } catch (err: any) {
            toast.error("Erro ao atualizar: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    const handleToggleLeaderStatus = async (memberId: string, isLeader: boolean) => {
        setSaving(memberId);
        try {
            const { error } = await supabase
                .from("birthday_ministries")
                .update({ is_leader: isLeader })
                .eq("birthday_id", memberId)
                .eq("ministry_id", selectedMinistryId);

            if (error) throw error;

            toast.success(isLeader ? "Definido como líder" : "Removido status de líder");
            refetch();
        } catch (err: any) {
            toast.error("Erro ao atualizar status: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    if (loadingBirthdays || loadingMinistries) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Gestão de Liderança</h1>
                <p className="text-muted-foreground mt-1">Defina líderes e supervise as associações por ministério</p>
            </div>

            <div className="bg-card rounded-xl shadow-soft p-6 border border-border">
                <div className="max-w-xs space-y-2">
                    <label className="text-sm font-medium">Selecione o Ministério</label>
                    <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um ministério" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeMinistries.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedMinistryId ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="text-primary" />
                            Membros de {currentMinistry?.title}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({ministryMembers.length} pessoas)
                            </span>
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {ministryMembers.map((member) => {
                            const rel = member.ministries.find(m => m.ministry_id === selectedMinistryId);
                            return (
                                <div key={member.id} className="bg-card rounded-xl p-5 border border-border flex flex-col sm:flex-row sm:items-center gap-6 group hover:shadow-md transition-all">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{getName(member)}</span>
                                            {rel?.is_leader && (
                                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Shield size={10} /> Líder
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{member.email || "Sem email cadastrado"}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status de Liderança</p>
                                            <Button
                                                variant={rel?.is_leader ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggleLeaderStatus(member.id, !rel?.is_leader)}
                                                disabled={!!saving}
                                                className="h-9"
                                            >
                                                {rel?.is_leader ? "Remover de Líder" : "Tornar Líder"}
                                            </Button>
                                        </div>

                                        <div className="space-y-1.5 min-w-[200px]">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Liderado por</p>
                                            <Select
                                                value={rel?.leader_id || "none"}
                                                onValueChange={(val) => handleUpdateLeader(member.id, val)}
                                                disabled={!!saving}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Selecione o líder" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Sem Líder Direto</SelectItem>
                                                    {birthdays
                                                        .filter(b => b.id !== member.id) // Can't lead self
                                                        .map(b => (
                                                            <SelectItem key={b.id} value={b.id}>{getName(b)}</SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {saving === member.id && (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="animate-spin text-primary" size={20} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {ministryMembers.length === 0 && (
                            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                                <Users className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
                                <p className="text-muted-foreground">Nenhum membro vinculado a este ministério.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-border">
                    <UserCheck className="mx-auto text-muted-foreground mb-4 opacity-30" size={64} />
                    <p className="text-muted-foreground text-lg">Selecione um ministério para gerenciar a hierarquia</p>
                </div>
            )}
        </div>
    );
}
