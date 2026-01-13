import { Link } from "react-router-dom";
import { Music, Tv, Heart, BookOpen, Users, Mic2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMinistries } from "@/hooks/useMinistries";
import worshipImage from "@/assets/ministry-worship.jpg";
import techImage from "@/assets/ministry-tech.jpg";
import casadosImage from "@/assets/casados-para-sempre.jpg";

const iconMap: Record<string, React.ElementType> = {
  Music,
  Tv,
  Heart,
  BookOpen,
  Users,
  Mic2,
};

// Default images for ministries without image_url
const defaultImages: Record<string, string> = {
  louvor: worshipImage,
  tech: techImage,
  casados: casadosImage,
  ensino: worshipImage,
  acolhimento: techImage,
  oracao: casadosImage,
  edificados: worshipImage,
};

export default function MinisteriosPage() {
  const { data: ministries, isLoading } = useMinistries();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeMinistries = ministries?.filter(m => m.is_active) || [];

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
          {activeMinistries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum ministério encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeMinistries.map((ministry, index) => {
                const IconComponent = iconMap[ministry.icon] || Users;
                const imageUrl = ministry.image_url || defaultImages[ministry.slug] || worshipImage;
                
                return (
                  <div
                    key={ministry.id}
                    className={`group bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-xl transition-all duration-500 animate-fade-up`}
                    style={{ animationDelay: `${(index % 4 + 1) * 100}ms` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="aspect-square md:aspect-auto overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={ministry.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6 md:p-8 flex flex-col">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                          {ministry.title}
                        </h3>
                        <p className="text-muted-foreground text-sm flex-1 mb-4">
                          {ministry.description}
                        </p>
                        {ministry.features && ministry.features.length > 0 && (
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
                        )}
                        <Button variant="outline" size="sm" className="self-start" asChild>
                          <Link to={`/ministerios/${ministry.slug}`}>
                            Saber Mais
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
