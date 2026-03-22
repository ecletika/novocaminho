import { useAfricaContents } from "@/hooks/useAfricaContent";
import { Loader2, History, Image as ImageIcon, Video, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import africaHero from "@/assets/logos/10 - Fresh Sky.png"; // Fallback if no specific image is set

export default function AfricaPage() {
  const { data: contents = [], isLoading } = useAfricaContents();

  const historyItems = contents.filter(c => c.type === 'history');
  const imageItems = contents.filter(c => c.type === 'image');
  const videoItems = contents.filter(c => c.type === 'video');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src="/assets/africa-hero.png"
            alt="Igreja na África"
            className="w-full h-full object-cover opacity-60"
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
                    src="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80"
                    alt="História"
                    className="rounded-[2rem] w-full aspect-[4/5] object-cover"
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
                    src={item.media_url || ""}
                    alt={item.title}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
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
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-muted shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                    <iframe
                      src={getYoutubeEmbedUrl(item.media_url || "")}
                      title={item.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
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
