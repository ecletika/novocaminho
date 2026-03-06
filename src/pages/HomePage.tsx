import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Calendar, ArrowRight, Users, Music, Tv, BookOpen, Heart, Radio, Cake } from "lucide-react";
import heroImage from "@/assets/hero-church.jpg";
import worshipImage from "@/assets/ministry-worship.jpg";
import techImage from "@/assets/ministry-tech.jpg";
import casadosImage from "@/assets/casados-para-sempre.jpg";
import RadioPlayer from "@/components/RadioPlayer";
import BirthdayCard from "@/components/BirthdayCard";
import FacebookLiveModal from "@/components/FacebookLiveModal";
import PhotoGallery from "@/components/PhotoGallery";
import DailyVerse from "@/components/DailyVerse";
import { useMonthlyBirthdays } from "@/hooks/useBirthdays";

const ministries = [
  {
    title: "Ministério de Louvor",
    description: "Adoração que transforma corações através da música e do louvor.",
    image: worshipImage,
    icon: Music,
    href: "/ministerios/louvor",
  },
  {
    title: "Mesa de Som & Mídia",
    description: "Tecnologia a serviço do Reino, transmitindo a palavra ao mundo.",
    image: techImage,
    icon: Tv,
    href: "/ministerios/tech",
  },
  {
    title: "Casados Para Sempre",
    description: "Fortalecendo casamentos e famílias através do amor de Deus.",
    image: casadosImage,
    icon: Heart,
    href: "/casados",
  },
];

const upcomingEvents = [
  {
    title: "Culto de Domingo",
    date: "22 Dez",
    time: "10:00",
    description: "Venha adorar conosco e receber a palavra de Deus.",
  },
  {
    title: "Reunião de Casais",
    date: "24 Dez",
    time: "19:30",
    description: "Momento especial para casais fortalecerem seus laços.",
  },
  {
    title: "Celebração de Natal",
    date: "25 Dez",
    time: "18:00",
    description: "Grande celebração em família, comemorando o nascimento de Jesus.",
  },
];

import { useMinistries } from "@/hooks/useMinistries";

const iconMap: Record<string, any> = {
  Music: Music,
  Tv: Tv,
  Heart: Heart,
  Users: Users,
};

export default function HomePage() {
  const { data: monthlyBirthdays = [] } = useMonthlyBirthdays();
  const { data: dbMinistries = [] } = useMinistries();
  const [showLive, setShowLive] = useState(false);

  const activeMinistries = dbMinistries.filter(m => m.is_active).slice(0, 3);
  const getIcon = (iconName: string) => iconMap[iconName] || Users;
  const getHref = (m: any) => m.slug === 'casados' ? '/casados' : `/ministerios`;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background opacity-95" />
        </div>

        {/* Geometric Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <svg className="absolute -top-24 -right-24 w-[600px] h-[600px] text-white" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="100" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="100" cy="0" r="100" fill="none" stroke="currentColor" strokeWidth="0.2" />
          </svg>
          <svg className="absolute -bottom-24 -left-24 w-[600px] h-[600px] text-white" viewBox="0 0 100 100">
            <circle cx="0" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="0" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="0" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <circle cx="0" cy="100" r="100" fill="none" stroke="currentColor" strokeWidth="0.2" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 container-church text-center text-primary-foreground pt-32">
          <div className="animate-fade-up">
            <span className="inline-block px-5 py-2 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-sm">
              Uma Igreja Relevante para a Cidade
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 animate-fade-up delay-100 flex flex-col gap-1 tracking-tighter uppercase">
            <span className="text-white">Resista a esse medo,</span>
            <span className="text-white">Resista a esse sofrimento,</span>
            <span className="text-white/80 italic font-serif lowercase">busque o</span>
            <span className="text-white">Novo Caminho,</span>
            <span className="text-white">Busque a Deus.</span>
          </h1>

          <div className="max-w-3xl mx-auto mb-12 animate-fade-up delay-200">
            <DailyVerse />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-300">
            <Button className="bg-white text-primary hover:bg-primary-foreground transition-all duration-500 rounded-full px-10 py-7 uppercase tracking-widest text-xs font-bold shadow-lg shadow-black/20" asChild>
              <Link to="/contato">
                Visite-nos
              </Link>
            </Button>
            <Button className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-500 rounded-full px-10 py-7 uppercase tracking-widest text-xs font-bold backdrop-blur-sm" onClick={() => setShowLive(true)}>
              Assistir ao Vivo
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float opacity-50">
            <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </section>

      {/* Quick Info Bar + Radio Player */}
      <section className="relative -mt-8 z-20">
        <div className="container-church space-y-6">
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cultos aos Domingos</h3>
                <p className="text-muted-foreground text-sm">10:00 e 18:00</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Células às Quartas</h3>
                <p className="text-muted-foreground text-sm">19:30</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
                <Radio className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Rádio Online</h3>
                <p className="text-muted-foreground text-sm">24 horas no ar</p>
              </div>
            </div>
          </div>

          {/* Radio Player */}
          <RadioPlayer />
        </div>
      </section>

      {/* Ministries Section */}
      <section className="section-padding">
        <div className="container-church">
          <div className="text-center mb-16">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Nossos Ministérios</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
              Servindo com Amor
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra como você pode fazer parte dos nossos ministérios e usar seus dons para o Reino de Deus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeMinistries.map((ministry, index) => {
              const IconComp = getIcon(ministry.icon);
              return (
                <Link
                  key={ministry.id}
                  to={getHref(ministry)}
                  className={`group relative overflow-hidden rounded-2xl shadow-card hover:shadow-xl transition-all duration-500 animate-fade-up delay-${(index + 1) * 100}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={ministry.image_url || worshipImage}
                      alt={ministry.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-2">{ministry.title}</h3>
                    <p className="text-primary-foreground/80 text-sm line-clamp-2">{ministry.description}</p>
                    <div className="mt-4 flex items-center text-secondary text-sm font-medium">
                      Saiba mais
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/ministerios">
                Ver Todos os Ministérios
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-church">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Agenda</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
                Próximos Eventos
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Participe dos nossos encontros e fortaleça sua fé em comunidade
              </p>
              <Button variant="default" size="lg" asChild>
                <Link to="/eventos">
                  Ver Calendário Completo
                  <Calendar className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.title}
                  className={`bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300 animate-fade-up delay-${(index + 1) * 100}`}
                >
                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-xl gradient-gold flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-foreground/70">{event.date.split(" ")[1]}</span>
                      <span className="text-2xl font-bold text-foreground">{event.date.split(" ")[0]}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{event.description}</p>
                      <span className="text-secondary font-medium text-sm">{event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Birthdays Section */}
      {monthlyBirthdays.length > 0 && (
        <section className="section-padding">
          <div className="container-church">
            <div className="text-center mb-12">
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Celebrações</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
                Aniversários do Mês
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Celebramos com alegria os aniversários da nossa família
              </p>
            </div>

            <BirthdayCard birthdays={monthlyBirthdays} title="Aniversários do Mês" />
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Nossos Momentos</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
              Galeria de Fotos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Acompanhe o que tem acontecido nos eventos e cultos da nossa igreja
            </p>
          </div>

          <PhotoGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container-church relative z-10 text-center text-primary-foreground">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Faça Parte da Nossa Família
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Você é bem-vindo aqui. Venha conhecer nossa igreja e experimentar o amor de Deus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/contato">
                Entre em Contato
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/ministerios">
                Conheça os Ministérios
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <FacebookLiveModal open={showLive} onOpenChange={setShowLive} />
    </>
  );
}
