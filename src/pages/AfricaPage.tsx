import { useState } from "react";
import { useAfricaContents } from "@/hooks/useAfricaContent";
import { Loader2, History, Video, Play, Users } from "lucide-react";
import MemberBadge from "@/components/MemberBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import africaHero from "@/assets/africa-hero.png";

export default function AfricaPage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { data: contents = [], isLoading, error } = useAfricaContents();

  const historyItems = Array.isArray(contents) ? contents.filter(c => c.type === 'history') : [];
  const imageItems = Array.isArray(contents) ? contents.filter(c => c.type === 'image') : [];
  const videoItems = Array.isArray(contents) ? contents.filter(c => c.type === 'video') : [];
  const pastorItems = Array.isArray(contents) ? contents.filter(c => c.type === 'pastor') : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url; // Fallback to original URL if not youtube
  };

  const getYoutubePreviewUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return "";
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar conteúdos</h2>
        <p className="text-muted-foreground mb-6">Por favor, verifique se a base de dados foi configurada corretamente.</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src={africaHero}
            alt="Igreja na África"
            className="w-full h-full object-cover opacity-60"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 container-church text-center text-white">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary/20 backdrop-blur-md text-secondary text-sm font-semibold mb-6 animate-fade-up">
            Missão África
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 animate-fade-up delay-100 italic">
            Novo Caminho <span className="text-secondary">África</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed animate-fade-up delay-200">
            Uma extensão do amor de Deus que atravessa fronteiras para transformar vidas e comunidades.
          </p>
        </div>
      </section>

      {/* Pastores e Liderança */}
      {pastorItems.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-church text-center mb-16">
            <span className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 mb-4">
              <Users className="w-4 h-4" /> Nossa Liderança
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Pastores e Obreiros
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
              Conheça aqueles que dedicam as suas vidas a servir e cuidar da nossa família na África.
            </p>
          </div>

          <div className="container-church">
            <div className="flex flex-wrap justify-center gap-12">
              {pastorItems.map((pastor) => (
                <div key={pastor.id} className="animate-fade-up">
                  <MemberBadge
                    name={pastor.title}
                    photo_url={pastor.media_url || ""}
                    role={pastor.description || "Pastor"}
                    variant="blue"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nossa História */}
      {historyItems.length > 0 && (
        <section className="section-padding overflow-hidden">
          <div className="container-church">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10 p-2 bg-card rounded-[2.5rem] shadow-2xl border border-primary/5">
                   <img
                    src="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800"
                    alt="História"
                    className="rounded-[2rem] w-full aspect-[4/5] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <span className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                    <History className="w-4 h-4" /> Nossa Trajetória
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    A História da Igreja na África
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {historyItems.map((item) => (
                    <div key={item.id} className="prose prose-lg dark:prose-invert max-w-none">
                      <h3 className="font-display text-2xl font-semibold text-primary">{item.title}</h3>
                      <div 
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.content || "" }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Galeria de Momentos */}
      {imageItems.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-church text-center mb-16">
            <span className="text-secondary font-bold text-sm tracking-widest uppercase inline-block mb-4">
              Galeria de Momentos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Vidas Transformadas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
              Registos de fé, comunhão e serviço que marcam a nossa presença no continente africano.
            </p>
          </div>

          <div className="container-church">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {imageItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative group overflow-hidden rounded-2xl shadow-soft hover:shadow-card transition-all duration-500 break-inside-avoid"
                >
                  <img
                    src={item.media_url ? item.media_url : ""}
                    alt={item.title}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vídeos e Testemunhos */}
      {videoItems.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-church">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="space-y-4">
                <span className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                  <Video className="w-4 h-4" /> Multimédia
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Vídeos e Testemunhos
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-md">
                Assista aos registos em vídeo das nossas celebrações e o impacto na comunidade local.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {videoItems.map((item) => (
                <div key={item.id} className="group space-y-6">
                  <div 
                    className="relative aspect-video rounded-[2rem] overflow-hidden bg-muted shadow-xl group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                    onClick={() => setActiveVideoId(item.id)}
                  >
                    {activeVideoId === item.id ? (
                      <iframe
                        src={`${getYoutubeEmbedUrl(item.media_url || "")}?autoplay=1`}
                        title={item.title}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <>
                        <img
                          src={getYoutubePreviewUrl(item.media_url || "")}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 fill-current" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="px-4">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-church">
          <div className="relative overflow-hidden rounded-[3rem] bg-primary p-12 md:p-20 text-center text-primary-foreground shadow-2xl">
            {/* Decorative Orbs */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/30 rounded-full blur-[100px]" />
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="font-display text-4xl md:text-6xl font-bold italic leading-tight">
                Seja parte desta <span className="text-secondary">missão</span>
              </h2>
              <p className="text-xl text-primary-foreground/80 font-light">
                A vossa participação faz a diferença. Junte-se a nós nesta jornada de fé e amor no continente africano.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Button variant="secondary" size="xl" asChild className="rounded-full px-10">
                  <Link to="/contacto">Saber Como Ajudar</Link>
                </Button>
                <div className="flex items-center gap-3 text-secondary font-medium">
                  <div className="w-12 h-px bg-secondary/50" />
                  Estamos Juntos
                  <div className="w-12 h-px bg-secondary/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
