import { Link } from "react-router-dom";
import { Heart, Calendar, MapPin, Camera, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import casadosImage from "@/assets/casados-para-sempre.jpg";

const upcomingMeetings = [
  {
    date: "28 Dez 2024",
    time: "19:30",
    location: "Salão de Eventos",
    topic: "Comunicação no Casamento",
  },
  {
    date: "11 Jan 2025",
    time: "19:30",
    location: "Salão de Eventos",
    topic: "Finanças a Dois",
  },
  {
    date: "25 Jan 2025",
    time: "19:30",
    location: "Salão de Eventos",
    topic: "Criando Filhos com Propósito",
  },
];

const galleryImages = [
  casadosImage,
  casadosImage,
  casadosImage,
  casadosImage,
  casadosImage,
  casadosImage,
];

export default function CasadosPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container-church relative z-10 text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
            <Heart className="w-4 h-4 fill-secondary" />
            Ministério de Casais
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
            Casados Para Sempre
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Fortalecendo casamentos e famílias através do amor de Deus e da comunhão entre casais
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="#inscricao">
              Inscreva-se
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="section-padding">
        <div className="container-church">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src={casadosImage}
                alt="Casados Para Sempre"
                className="rounded-2xl shadow-card w-full"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl gradient-gold flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-foreground">50+</span>
                  <span className="text-sm text-foreground/70">Casais</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Sobre o Ministério</span>
              <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-6">
                Casamentos Fortalecidos na Fé
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                O Casados Para Sempre é um ministério dedicado a fortalecer os laços matrimoniais 
                através de encontros, estudos bíblicos e momentos de comunhão. Acreditamos que 
                casamentos saudáveis são a base de famílias e igrejas fortes.
              </p>
              <ul className="space-y-4">
                {[
                  "Encontros mensais para casais",
                  "Estudos bíblicos sobre família",
                  "Aconselhamento pastoral",
                  "Retiros anuais de casais",
                  "Comunhão e apoio mútuo",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-secondary fill-secondary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Meetings */}
      <section className="section-padding bg-muted/50">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Agenda</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
              Próximas Reuniões
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Participe dos nossos encontros e fortaleça seu casamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={meeting.date}
                className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300 animate-fade-up delay-${(index + 1) * 100}`}
              >
                <div className="w-14 h-14 rounded-xl gradient-gold flex flex-col items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{meeting.topic}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{meeting.date} às {meeting.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{meeting.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Galeria</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
              Momentos Especiais
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 ${
                  index === 0 ? "md:col-span-2 md:row-span-2 aspect-auto md:aspect-square" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`Galeria ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section id="inscricao" className="section-padding gradient-hero">
        <div className="container-church text-center text-primary-foreground">
          <Heart className="w-12 h-12 mx-auto mb-6 text-secondary fill-secondary" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Faça Parte do Casados Para Sempre
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Inscreva-se para participar dos nossos encontros e fortalecer seu casamento
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/contato">
              Entre em Contato
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
