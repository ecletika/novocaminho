import { Link } from "react-router-dom";
import { Music, Tv, Heart, BookOpen, Users, Mic2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import worshipImage from "@/assets/ministry-worship.jpg";
import techImage from "@/assets/ministry-tech.jpg";
import casadosImage from "@/assets/casados-para-sempre.jpg";

const ministries = [
  {
    id: "louvor",
    title: "Ministério de Louvor",
    description: "Nosso ministério de louvor é formado por músicos e cantores dedicados a conduzir a congregação em adoração. Através da música, proclamamos a grandeza de Deus e criamos um ambiente de comunhão espiritual.",
    image: worshipImage,
    icon: Music,
    features: ["Ensaios semanais", "Escalas mensais", "Formação musical", "Retiros de louvor"],
  },
  {
    id: "tech",
    title: "Mesa de Som & Mídia",
    description: "O ministério de mídia é responsável por toda a parte técnica dos cultos, incluindo som, transmissão ao vivo, projeção e gravações. Uma equipe dedicada a levar a palavra de Deus além das paredes da igreja.",
    image: techImage,
    icon: Tv,
    features: ["Transmissões ao vivo", "Controle de som", "Projeção", "Edição de vídeos"],
  },
  {
    id: "casados",
    title: "Casados Para Sempre",
    description: "Um ministério dedicado a fortalecer os casamentos através de encontros, estudos bíblicos e aconselhamento. Acreditamos que famílias saudáveis são a base de uma igreja forte.",
    image: casadosImage,
    icon: Heart,
    features: ["Encontros mensais", "Aconselhamento", "Retiros de casais", "Grupos de estudo"],
  },
  {
    id: "ensino",
    title: "Ministério de Ensino",
    description: "Responsável pela formação bíblica da igreja através de estudos, cursos e discipulado. Equipamos os membros para crescerem na fé e no conhecimento da Palavra de Deus.",
    image: worshipImage,
    icon: BookOpen,
    features: ["Escola Bíblica", "Cursos temáticos", "Discipulado", "Material didático"],
  },
  {
    id: "acolhimento",
    title: "Ministério de Acolhimento",
    description: "Nossa equipe de acolhimento é o primeiro contato dos visitantes com a igreja. Com alegria e amor, recebemos todos que chegam, fazendo-os sentir-se em casa.",
    image: techImage,
    icon: Users,
    features: ["Recepção", "Integração", "Visitação", "Café pós-culto"],
  },
  {
    id: "oracao",
    title: "Ministério de Oração",
    description: "A base espiritual da nossa igreja. Mantemos uma cobertura de oração constante, intercedendo pela liderança, membros e necessidades da comunidade.",
    image: casadosImage,
    icon: Mic2,
    features: ["Vigílias", "Corrente de oração", "Intercessão", "Oração pelos enfermos"],
  },
];

export default function MinisteriosPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 gradient-hero">
        <div className="container-church text-center text-primary-foreground">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
            Sirva com seus dons
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
            Nossos Ministérios
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Descubra como você pode fazer parte da nossa equipe e usar seus talentos para o Reino de Deus
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="section-padding">
        <div className="container-church">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ministries.map((ministry, index) => (
              <div
                key={ministry.id}
                className={`group bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all duration-500 animate-fade-up delay-${(index % 4 + 1) * 100}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square md:aspect-auto overflow-hidden">
                    <img
                      src={ministry.image}
                      alt={ministry.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <ministry.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                      {ministry.title}
                    </h3>
                    <p className="text-muted-foreground text-sm flex-1 mb-4">
                      {ministry.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {ministry.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="self-start">
                      Saber Mais
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-muted/50">
        <div className="container-church text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Quer fazer parte de um ministério?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Entre em contato conosco e descubra como você pode usar seus dons para servir a Deus e à comunidade
          </p>
          <Button variant="default" size="lg" asChild>
            <Link to="/contato">
              Fale Conosco
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
