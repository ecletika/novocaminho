import { useState } from "react";
import { Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const events = [
  {
    id: 1,
    title: "Culto de Domingo",
    date: "2024-12-22",
    time: "10:00",
    location: "Templo Principal",
    category: "Culto",
    description: "Culto dominical com louvor e pregação da Palavra.",
  },
  {
    id: 2,
    title: "Culto de Domingo (Noite)",
    date: "2024-12-22",
    time: "18:00",
    location: "Templo Principal",
    category: "Culto",
    description: "Culto noturno com foco em oração e comunhão.",
  },
  {
    id: 3,
    title: "Reunião de Casais",
    date: "2024-12-24",
    time: "19:30",
    location: "Salão de Eventos",
    category: "Casados Para Sempre",
    description: "Encontro especial de Natal para casais.",
  },
  {
    id: 4,
    title: "Celebração de Natal",
    date: "2024-12-25",
    time: "18:00",
    location: "Templo Principal",
    category: "Especial",
    description: "Grande celebração em família comemorando o nascimento de Jesus Cristo.",
  },
  {
    id: 5,
    title: "Ensaio do Louvor",
    date: "2024-12-28",
    time: "15:00",
    location: "Sala de Ensaio",
    category: "Louvor",
    description: "Preparação das músicas para o culto de Ano Novo.",
  },
  {
    id: 6,
    title: "Vigília de Ano Novo",
    date: "2024-12-31",
    time: "22:00",
    location: "Templo Principal",
    category: "Especial",
    description: "Vigília de gratidão e oração para receber o novo ano.",
  },
];

const categoryColors: Record<string, string> = {
  "Culto": "bg-primary/10 text-primary",
  "Louvor": "bg-secondary/20 text-secondary-foreground",
  "Casados Para Sempre": "bg-accent/20 text-accent-foreground",
  "Especial": "bg-gold/20 text-gold-dark",
};

export default function EventosPage() {
  const [currentMonth, setCurrentMonth] = useState(11); // December (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

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
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {months[currentMonth]} {currentYear}
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
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = day === 21 && currentMonth === 11 && currentYear === 2024;

                    return (
                      <div
                        key={day}
                        className={`aspect-square rounded-xl p-1 transition-colors ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : dayEvents.length > 0
                            ? "bg-secondary/10 hover:bg-secondary/20"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="h-full flex flex-col">
                          <span className={`text-sm font-medium ${isToday ? "" : "text-foreground"}`}>
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <div className="flex-1 flex items-end">
                              <div className="flex gap-0.5">
                                {dayEvents.slice(0, 3).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isToday ? "bg-secondary" : "bg-secondary"
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
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-card rounded-xl p-5 shadow-soft hover:shadow-card transition-all duration-300"
                  >
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-3 ${categoryColors[event.category] || "bg-muted text-muted-foreground"}`}>
                      {event.category}
                    </span>
                    <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                    <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
