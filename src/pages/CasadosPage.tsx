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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CASADOS_COURSES, CASADOS_RESOURCES } from "@/constants/casadosData";
import { FileText, GraduationCap, ClipboardList, BookOpen, UserPlus, Link as LinkIcon } from "lucide-react";
import CouplesStudy from "@/components/CouplesStudy";

const resourceIconMap: Record<string, React.ElementType> = {
  FileText,
  GraduationCap,
  ClipboardList,
  BookOpen,
  UserPlus
};

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

      {/* Inscrições e Recursos Section */}
      <section id="inscricao" className="section-padding bg-card border-t border-border">
        <div className="container-church">
          <div className="text-center mb-12">
            <span className="text-secondary font-medium text-sm uppercase tracking-wider">Participe</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3 mb-4">
              Inscrições e Recursos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Confira as próximas turmas e acesse os materiais necessários para o seu crescimento.
            </p>
          </div>

          <Tabs defaultValue="cursos" className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="cursos" className="px-4 md:px-8">Cursos</TabsTrigger>
                <TabsTrigger value="estudos" className="px-4 md:px-8">Estudos Bíblicos</TabsTrigger>
                <TabsTrigger value="recursos" className="px-4 md:px-8">Recursos</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="estudos" className="animate-in fade-in duration-500">
              <CouplesStudy />
            </TabsContent>

            <TabsContent value="cursos" className="space-y-6">
              <div className="grid gap-6">
                {CASADOS_COURSES.map((course) => (
                  <div
                    key={course.id}
                    className="bg-muted/30 rounded-2xl p-6 border border-border flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-display text-xl font-bold text-foreground">{course.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" /> Próxima turma: {course.startDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${course.status === 'Inscrições Abertas'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-secondary/10 text-secondary'
                        }`}>
                        {course.status}
                      </span>
                      <Button asChild size="lg">
                        <a href={course.link} target="_blank" rel="noopener noreferrer">
                          Fazer Inscrição
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recursos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CASADOS_RESOURCES.map((resource) => {
                  const Icon = resourceIconMap[resource.icon] || FileText;
                  return (
                    <a
                      key={resource.title}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted/30 rounded-2xl p-6 border border-border hover:border-secondary transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-primary-foreground transition-all`}>
                          <Icon className="w-6 h-6 text-secondary group-hover:text-inherit" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground transition-colors">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                          <div className="flex items-center gap-2 mt-3 text-xs font-medium text-secondary">
                            <span>Acessar Material</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
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
            Fale conosco para saber mais sobre o ministério ou como participar das turmas.
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
