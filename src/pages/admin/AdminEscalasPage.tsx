import { useState } from "react";
import {
    Calendar,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Share2,
    Edit,
    Trash2,
    Users,
    Music,
    Tv
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useGeneralSchedules,
    useCreateGeneralSchedule,
    useUpdateGeneralSchedule,
    useDeleteGeneralSchedule,
    GeneralSchedule
} from "@/hooks/useGeneralSchedules";
import {
    useWorshipMembers,
} from "@/hooks/useWorship";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const scheduleTypes = ["Culto Domingo", "Culto Quarta", "Culto de Oração", "Escola Bíblica", "Evento Especial"];

export default function AdminEscalasPage() {
    const { isAdmin } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<GeneralSchedule | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form states
    const [formDate, setFormDate] = useState("");
    const [formType, setFormType] = useState("");
    const [selectedMinistrantes, setSelectedMinistrantes] = useState<string[]>([]);
    const [selectedLouvor, setSelectedLouvor] = useState<string[]>([]);
    const [selectedMusicos, setSelectedMusicos] = useState<{ member_id: string; instrument: string }[]>([]);
    const [selectedSom, setSelectedSom] = useState<string[]>([]);
    const [selectedMidia, setSelectedMidia] = useState<string[]>([]);

    // Queries
    const { data: schedules = [], isLoading: schedulesLoading } = useGeneralSchedules();
    const { data: members = [] } = useWorshipMembers();

    // Mutations
    const createSchedule = useCreateGeneralSchedule();
    const updateSchedule = useUpdateGeneralSchedule();
    const deleteSchedule = useDeleteGeneralSchedule();

    const handleCreateNew = () => {
        setSelectedSchedule(null);
        setFormDate(format(new Date(), "yyyy-MM-dd"));
        setFormType(scheduleTypes[0]);
        setSelectedMinistrantes([]);
        setSelectedLouvor([]);
        setSelectedMusicos([]);
        setSelectedSom([]);
        setSelectedMidia([]);
        setIsDialogOpen(true);
    };

    const handleEdit = (schedule: GeneralSchedule) => {
        setSelectedSchedule(schedule);
        setFormDate(schedule.date);
        setFormType(schedule.type);

        const team = schedule.team_members || [];
        setSelectedMinistrantes(team.filter(tm => tm.role === "ministrante").map(tm => tm.member_id));
        setSelectedLouvor(team.filter(tm => tm.role === "louvor").map(tm => tm.member_id));
        setSelectedMusicos(team.filter(tm => tm.role === "musicos").map(tm => ({ member_id: tm.member_id, instrument: tm.instrument || "" })));
        setSelectedSom(team.filter(tm => tm.role === "som").map(tm => tm.member_id));
        setSelectedMidia(team.filter(tm => tm.role === "midia").map(tm => tm.member_id));

        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const team_assignments: any[] = [];

        selectedMinistrantes.forEach(id => team_assignments.push({ member_id: id, role: "ministrante" }));
        selectedLouvor.forEach(id => team_assignments.push({ member_id: id, role: "louvor" }));
        selectedMusicos.forEach(m => team_assignments.push({ member_id: m.member_id, role: "musicos", instrument: m.instrument }));
        selectedSom.forEach(id => team_assignments.push({ member_id: id, role: "som" }));
        selectedMidia.forEach(id => team_assignments.push({ member_id: id, role: "midia" }));

        try {
            if (selectedSchedule) {
                await updateSchedule.mutateAsync({
                    id: selectedSchedule.id,
                    date: formDate,
                    type: formType,
                    team_assignments,
                });
            } else {
                await createSchedule.mutateAsync({
                    date: formDate,
                    type: formType,
                    team_assignments,
                });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteSchedule.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const toggleMember = (list: string[], setList: (val: string[]) => void, id: string) => {
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    const toggleMusician = (memberId: string, instrument: string) => {
        const existing = selectedMusicos.find(m => m.member_id === memberId);
        if (existing) {
            setSelectedMusicos(selectedMusicos.filter(m => m.member_id !== memberId));
        } else {
            setSelectedMusicos([...selectedMusicos, { member_id: memberId, instrument }]);
        }
    };

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getScheduleForDay = (day: Date) => {
        return schedules.find(s => isSameDay(new Date(s.date), day));
    };

    const shareWhatsApp = (schedule: GeneralSchedule) => {
        const dateStr = format(new Date(schedule.date), "EEEE, d 'de' MMMM", { locale: pt });
        let msg = `📅 *Escala Novo Caminho*\n📍 ${schedule.type}\n🗓️ ${dateStr}\n`;

        const team = schedule.team_members || [];

        const ministrantes = team.filter(tm => tm.role === "ministrante");
        if (ministrantes.length > 0) {
            msg += `\n🎤 *Ministrante(s):*\n`;
            ministrantes.forEach(m => msg += `  • ${m.member?.name}\n`);
        }

        const louvor = team.filter(tm => tm.role === "louvor");
        if (louvor.length > 0) {
            msg += `\n🎶 *Louvor:*\n`;
            louvor.forEach(m => msg += `  • ${m.member?.name}\n`);
        }

        const musicos = team.filter(tm => tm.role === "musicos");
        if (musicos.length > 0) {
            msg += `\n🎸 *Músicos:*\n`;
            musicos.forEach(m => msg += `  • ${m.member?.name} (${m.instrument})\n`);
        }

        const tech = team.filter(tm => ["som", "midia", "transmissao", "camera"].includes(tm.role));
        if (tech.length > 0) {
            msg += `\n📺 *Técnica:*\n`;
            tech.forEach(m => msg += `  • ${m.role.toUpperCase()}: ${m.member?.name}\n`);
        }

        msg += `\n_Deus abençoe o nosso serviço!_ 🙏`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Escalas Gerais</h1>
                    <p className="text-muted-foreground mt-1">
                        Cronograma completo de todas as equipes (Louvor e Técnica)
                    </p>
                </div>
                <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Escala
                </Button>
            </div>

            {/* Calendar Header */}
            <div className="bg-card rounded-xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-foreground capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: pt })}
                        </h2>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                        <div key={day} className="bg-muted/50 py-3 text-center text-sm font-semibold text-muted-foreground">
                            {day}
                        </div>
                    ))}
                    {daysInMonth.map((day, idx) => {
                        const schedule = getScheduleForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isSelectedMonth = isSameMonth(day, currentMonth);

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[140px] bg-card p-2 transition-colors hover:bg-muted/30 ${!isSelectedMonth ? 'opacity-40' : ''}`}
                                style={idx === 0 ? { gridColumnStart: day.getDay() + 1 } : {}}
                            >
                                <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full mb-2 ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                                    {format(day, "d")}
                                </span>

                                {schedule && (
                                    <div className="space-y-1">
                                        <div
                                            className="text-[10px] p-1.5 rounded bg-primary/10 text-primary font-bold cursor-pointer hover:bg-primary/20 transition-colors"
                                            onClick={() => handleEdit(schedule)}
                                        >
                                            {schedule.type}
                                        </div>
                                        <div className="flex items-center gap-1 px-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground"
                                                onClick={() => shareWhatsApp(schedule)}
                                            >
                                                <Share2 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => setDeleteId(schedule.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedSchedule ? "Editar Escala" : "Criar Nova Escala"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Culto</Label>
                                <Select value={formType} onValueChange={setFormType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {scheduleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Ministry Selections */}
                        <div className="space-y-6">
                            <section className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-1">
                                    <Music className="w-4 h-4" /> Louvor
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Ministrantes</Label>
                                        <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                                            {members.filter(m => m.primary_function?.name?.toLowerCase().includes("ministrante")).map(m => (
                                                <div key={m.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`min-${m.id}`}
                                                        checked={selectedMinistrantes.includes(m.id)}
                                                        onCheckedChange={() => toggleMember(selectedMinistrantes, setSelectedMinistrantes, m.id)}
                                                    />
                                                    <Label htmlFor={`min-${m.id}`} className="text-sm font-normal cursor-pointer">{m.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Vocais</Label>
                                        <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                                            {members.filter(m => m.primary_function?.name?.toLowerCase().includes("vocal")).map(m => (
                                                <div key={m.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`vocal-${m.id}`}
                                                        checked={selectedLouvor.includes(m.id)}
                                                        onCheckedChange={() => toggleMember(selectedLouvor, setSelectedLouvor, m.id)}
                                                    />
                                                    <Label htmlFor={`vocal-${m.id}`} className="text-sm font-normal cursor-pointer">{m.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-1">
                                    <Tv className="w-4 h-4" /> Técnica
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Mesa de Som</Label>
                                        <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                                            {members.filter(m => m.primary_function?.name?.toLowerCase().includes("som")).map(m => (
                                                <div key={m.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`som-${m.id}`}
                                                        checked={selectedSom.includes(m.id)}
                                                        onCheckedChange={() => toggleMember(selectedSom, setSelectedSom, m.id)}
                                                    />
                                                    <Label htmlFor={`som-${m.id}`} className="text-sm font-normal cursor-pointer">{m.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Mídia / Projeção</Label>
                                        <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                                            {members.filter(m => m.primary_function?.name?.toLowerCase().includes("mídia") || m.primary_function?.name?.toLowerCase().includes("midia")).map(m => (
                                                <div key={m.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`midia-${m.id}`}
                                                        checked={selectedMidia.includes(m.id)}
                                                        onCheckedChange={() => toggleMember(selectedMidia, setSelectedMidia, m.id)}
                                                    />
                                                    <Label htmlFor={`midia-${m.id}`} className="text-sm font-normal cursor-pointer">{m.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex gap-3 pt-6 border-t mt-6">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                Salvar Escala
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Escala?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover esta escala? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
