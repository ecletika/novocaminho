import { Plus, ChevronLeft, ChevronRight, Calendar, Share2, Edit, Trash2, Mic, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isSameDay, subMonths, addMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { GeneralSchedule } from "@/hooks/useGeneralSchedules";

interface SchedulesTabProps {
  isAdmin: boolean;
  resetGeneralScheduleForm: () => void;
  setIsNewScheduleDialogOpen: (open: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  monthStart: Date;
  daysInMonth: Date[];
  getScheduleForDay: (day: Date) => GeneralSchedule | undefined;
  schedulesInMonth: GeneralSchedule[];
  handleEditGeneralSchedule: (schedule: GeneralSchedule) => void;
  shareScheduleWhatsApp: (schedule: GeneralSchedule) => void;
  openDeleteDialog: (id: string, type: "schedule") => void;
}

export function SchedulesTab({
  isAdmin,
  resetGeneralScheduleForm,
  setIsNewScheduleDialogOpen,
  currentMonth,
  setCurrentMonth,
  monthStart,
  daysInMonth,
  getScheduleForDay,
  schedulesInMonth,
  handleEditGeneralSchedule,
  shareScheduleWhatsApp,
  openDeleteDialog
}: SchedulesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Escalas de Louvor</h2>
        {isAdmin && (
          <Button onClick={() => { resetGeneralScheduleForm(); setIsNewScheduleDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Escala
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 justify-center">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-display text-xl font-semibold text-foreground min-w-[200px] text-center">
          {format(currentMonth, "MMMM yyyy", { locale: pt })}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-soft p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="aspect-square" />
          ))}
          {daysInMonth.map((day) => {
            const schedule = getScheduleForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors ${schedule
                  ? 'bg-primary/20 hover:bg-primary/30 cursor-pointer'
                  : 'hover:bg-muted/50'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                onClick={() => schedule && handleEditGeneralSchedule(schedule)}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, "d")}
                </span>
                {schedule && (
                  <div className="mt-1 w-full">
                    <div className="text-[10px] text-primary font-medium truncate text-center">
                      {schedule.type.split(' ')[0]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4">
        {schedulesInMonth.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-xl">
            Nenhuma escala neste mês
          </div>
        ) : (
          schedulesInMonth
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((schedule) => {
              const ministrantes = schedule.team_members?.filter(tm => tm.role === "ministrante") || [];
              const louvor = schedule.team_members?.filter(tm => tm.role === "louvor") || [];
              const musicos = schedule.team_members?.filter(tm => tm.role === "musicos") || [];

              return (
                <div
                  key={schedule.id}
                  className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{schedule.type}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                          <span>{format(new Date(schedule.date), "EEEE, dd 'de' MMMM", { locale: pt })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => shareScheduleWhatsApp(schedule)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditGeneralSchedule(schedule)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => { openDeleteDialog(schedule.id, "schedule"); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                    {ministrantes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 underline decoration-primary/30 underline-offset-4">
                          <Mic className="w-4 h-4 text-primary" />
                          Ministrante
                        </div>
                        <div className="space-y-1">
                          {ministrantes.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground font-medium">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {louvor.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 underline decoration-secondary/30 underline-offset-4">
                          <Music className="w-4 h-4 text-secondary" />
                          Vocais
                        </div>
                        <div className="space-y-1">
                          {louvor.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {musicos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 underline decoration-accent/30 underline-offset-4">
                          <Music className="w-4 h-4 text-accent" />
                          Instrumental
                        </div>
                        <div className="space-y-1">
                          {musicos.map((tm) => (
                            <span key={tm.id} className="block text-sm text-muted-foreground">
                              {tm.member?.name} <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">{tm.instrument}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {schedule.songs && schedule.songs.length > 0 && (
                      <div className="col-span-1 sm:border-l sm:pl-4 border-border">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 underline decoration-primary/30 underline-offset-4">
                          <Music className="w-4 h-4 text-primary" />
                          Músicas
                        </div>
                        <div className="space-y-2">
                          {schedule.songs.map((ss, idx) => (
                            <div key={ss.id} className="flex items-center justify-between gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/40 group">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-bold text-primary bg-primary/10 w-4 h-4 flex items-center justify-center rounded-full shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-foreground font-medium truncate">
                                  {ss.song?.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-black text-primary bg-background px-1.5 py-0.5 rounded shadow-sm border border-primary/10 whitespace-nowrap">
                                {ss.key}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
