import { useState } from "react";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { pt } from "date-fns/locale";

const categoryColors: Record<string, string> = {
  "Culto": "bg-primary/10 text-primary",
  "Louvor": "bg-secondary/20 text-secondary-foreground",
  "Casados Para Sempre": "bg-accent/20 text-accent-foreground",
  "Especial": "bg-amber-100 text-amber-800",
  "Retiro": "bg-green-100 text-green-800",
  "Conferência": "bg-blue-100 text-blue-800",
  "Estudo": "bg-purple-100 text-purple-800",
  "Jovens": "bg-pink-100 text-pink-800",
  "Crianças": "bg-orange-100 text-orange-800",
};

export default function EventosPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: events = [], isLoading } = useUpcomingEvents();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 gradient-hero">
        <div className="container-church text-center text-primary-foreground">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
            Agenda da Igreja
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
            Eventos
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Confira nossa programação e participe dos nossos encontros
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-church">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-display text-2xl font-semibold text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: pt })}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before the first day */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {daysInMonth.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square rounded-xl p-1 transition-colors ${isToday
                            ? "bg-primary text-primary-foreground"
                            : dayEvents.length > 0
                              ? "bg-secondary/10 hover:bg-secondary/20"
                              : "hover:bg-muted"
                          }`}
                      >
                        <div className="h-full flex flex-col">
                          <span className={`text-sm font-medium ${isToday ? "" : "text-foreground"}`}>
                            {format(day, "d")}
                          </span>
                          {dayEvents.length > 0 && (
                            <div className="flex-1 flex items-end">
                              <div className="flex gap-0.5">
                                {dayEvents.slice(0, 3).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-secondary" : "bg-secondary"
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Próximos Eventos
              </h3>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento programado
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="bg-card rounded-xl p-5 shadow-soft hover:shadow-card transition-all duration-300"
                    >
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-3 ${categoryColors[event.category] || "bg-muted text-muted-foreground"}`}>
                        {event.category}
                      </span>
                      <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                      {event.description && (
                        <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(event.date), "dd 'de' MMMM", { locale: pt })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
