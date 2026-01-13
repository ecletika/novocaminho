import { useParams, Link } from "react-router-dom";
import { useMinistry, useMinistries } from "@/hooks/useMinistries";
import { useMinistryPostsByMinistry } from "@/hooks/useMinistryPosts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Music, Tv, Heart, BookOpen, Users, Mic2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const iconMap: Record<string, React.ElementType> = {
  Music,
  Tv,
  Heart,
  BookOpen,
  Users,
  Mic2,
};

export default function MinisterioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: ministry, isLoading } = useMinistry(slug || "");
  const { data: allMinistries } = useMinistries();
  const { data: posts = [] } = useMinistryPostsByMinistry(ministry?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Ministério não encontrado
          </h1>
          <Button asChild>
            <Link to="/ministerios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Ministérios
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[ministry.icon] || Users;
  const otherMinistries = allMinistries?.filter((m) => m.id !== ministry.id && m.is_active).slice(0, 3);
  
  // Separate latest post from history
  const [latestPost, ...historyPosts] = posts;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 gradient-hero">
        <div className="container-church">
          <Link
            to="/ministerios"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Ministérios
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-secondary" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            {ministry.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl">
            {ministry.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-church">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Latest Post */}
              {latestPost && (
                <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                  {latestPost.image_url && (
                    <img 
                      src={latestPost.image_url} 
                      alt={latestPost.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(latestPost.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                      {latestPost.title}
                    </h2>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: latestPost.content }}
                    />
                  </div>
                </div>
              )}

              {/* About Section (when no posts) */}
              {!latestPost && (
                <>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                      Sobre o Ministério
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {ministry.description}
                    </p>
                  </div>

                  {ministry.features && ministry.features.length > 0 && (
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
                        O que fazemos
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {ministry.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  Quer participar?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Entre em contato conosco para saber como você pode fazer parte deste ministério.
                </p>
                <Button asChild className="w-full">
                  <Link to="/contato">
                    Fale Conosco
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Post History */}
              {historyPosts.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Publicações Anteriores
                  </h3>
                  <div className="space-y-3">
                    {historyPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <p className="font-medium text-foreground text-sm">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherMinistries && otherMinistries.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Outros Ministérios
                  </h3>
                  <div className="space-y-3">
                    {otherMinistries.map((m) => {
                      const OtherIcon = iconMap[m.icon] || Users;
                      return (
                        <Link
                          key={m.id}
                          to={`/ministerios/${m.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <OtherIcon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{m.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Posts History (displayed below main content) */}
          {historyPosts.length > 0 && (
            <div className="mt-12 space-y-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Todas as Publicações
              </h2>
              {historyPosts.map((post) => (
                <div 
                  key={post.id} 
                  id={`post-${post.id}`}
                  className="bg-card rounded-2xl shadow-soft overflow-hidden"
                >
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                      {post.title}
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
