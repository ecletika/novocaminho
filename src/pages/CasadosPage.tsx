import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar, MapPin, Camera, ArrowRight, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import casadosImage from "@/assets/casados-para-sempre.jpg";
import { usePublishedCasadosPosts } from "@/hooks/useCasadosPosts";
import { useCasadosGallery } from "@/hooks/useCasadosGallery";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function CasadosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { data: posts = [] } = usePublishedCasadosPosts();
  const { data: gallery = [] } = useCasadosGallery();
  const { data: allEvents = [] } = useEvents();

  const casadosEvents = allEvents.filter(
    (e) => e.category?.toLowerCase().includes("casado") && e.is_active
  );
  const churchEvents = allEvents.filter((e) => e.is_active).slice(0, 3);
  const displayEvents = casadosEvents.length > 0 ? casadosEvents : churchEvents;

  const latestPost = posts[0];
  const olderPosts = posts.slice(1);

  const filteredOlderPosts = olderPosts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleOlderPosts = showAllPosts ? filteredOlderPosts : filteredOlderPosts.slice(0, 5);

  const displayGallery = gallery.length > 0
    ? gallery.map((g) => ({ src: g.image_url, caption: g.caption }))
    : Array(6).fill(null).map(() => ({ src: casadosImage, caption: null }));

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
              <img src={casadosImage} alt="Casados Para Sempre" className="rounded-2xl shadow-card w-full" />
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
                através de encontros, estudos bíblicos e momentos de comunhão.
              </p>
              <ul className="space-y-4">
                {["Encontros mensais para casais", "Estudos bíblicos sobre família", "Aconselhamento pastoral", "Retiros anuais de casais", "Comunhão e apoio mútuo"].map((item) => (
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

      {/* Palavra para o Casamento */}
      {latestPost && (
        <section className="section-padding bg-muted/50">
          <div className="container-church">
            <div className="text-center mb-12">
              <span className="text-secondary font-medium text-sm uppercase tracking-wider">Devocional</span>
              <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
                Palavra para o Casamento
              </h2>
            </div>

            {/* Latest Post */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8">
              {latestPost.image_url && (
                <img src={latestPost.image_url} alt={latestPost.title} className="w-full h-64 object-cover" />
              )}
              <div className="p-8">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(latestPost.created_at), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-2 mb-4">{latestPost.title}</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: latestPost.content }} />
              </div>
            </div>

            {/* Older Posts History */}
            {olderPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-lg">Histórico de Palavras</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {visibleOlderPosts.map((post) => (
                    <details key={post.id} className="bg-card rounded-xl shadow-soft group">
                      <summary className="p-5 cursor-pointer flex items-center justify-between list-none">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{post.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(post.created_at), "dd/MM/yyyy", { locale: pt })}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        {post.image_url && (
                          <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                        )}
                        <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: post.content }} />
                      </div>
                    </details>
                  ))}
                </div>
                {filteredOlderPosts.length > 5 && !showAllPosts && (
                  <div className="text-center mt-4">
                    <Button variant="outline" onClick={() => setShowAllPosts(true)}>
                      Ver todas ({filteredOlderPosts.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="section-padding">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Agenda</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
              {casadosEvents.length > 0 ? "Próximas Reuniões" : "Próximos Eventos da Igreja"}
            </h2>
          </div>

          {displayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date), "dd/MM/yyyy", { locale: pt })} às {event.time}</span>
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
          ) : (
            <p className="text-center text-muted-foreground">Nenhum evento agendado no momento.</p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-muted/50">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Galeria</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
              Momentos Especiais
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayGallery.map((img, index) => (
              <div
                key={index}
                className={`aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 ${index === 0 ? "md:col-span-2 md:row-span-2 aspect-auto md:aspect-square" : ""
                  }`}
              >
                <img
                  src={img.src}
                  alt={img.caption || `Galeria ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer CTA (Modified) */}
      <section className="section-padding gradient-hero">
        <div className="container-church text-center text-primary-foreground">
          <Heart className="w-12 h-12 mx-auto mb-6 text-secondary fill-secondary" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Dúvidas ou Informações?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Fale connosco para saber mais sobre o ministério ou como participar das turmas.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/contacto">
              Entre em Contacto
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
