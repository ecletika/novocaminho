
import { useState, useMemo } from "react";
import { Users, Shield, Loader2, UserCheck } from "lucide-react";
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
import { toast } from "sonner";

export default function LeadershipPage() {
    const [selectedMinistryId, setSelectedMinistryId] = useState<string>("");

    const { data: birthdays = [], isLoading: loadingBirthdays } = useBirthdays();
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
                <p className="text-muted-foreground mt-1">Visualize os membros por ministério</p>
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
                        {ministryMembers.map((member) => (
                            <div key={member.id} className="bg-card rounded-xl p-5 border border-border flex flex-col sm:flex-row sm:items-center gap-6 group hover:shadow-md transition-all">
                                <div className="flex-1 space-y-1">
                                    <span className="font-bold text-lg">{getName(member)}</span>
                                    <p className="text-xs text-muted-foreground">{member.email || "Sem email registado"}</p>
                                </div>
                            </div>
                        ))}

                        {ministryMembers.length === 0 && (
                            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                                <Users className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
                                <p className="text-muted-foreground">Nenhum membro associado a este ministério.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-border">
                    <UserCheck className="mx-auto text-muted-foreground mb-4 opacity-30" size={64} />
                    <p className="text-muted-foreground text-lg">Selecione um ministério para visualizar os membros</p>
                </div>
            )}
        </div>
    );
}
