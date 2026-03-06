import { useParams, Link } from "react-router-dom";
import { useMinistry } from "@/hooks/useMinistries";
import { useBirthdaysByMinistry } from "@/hooks/useBirthdays";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Music, Tv, Heart, BookOpen, Users, Mic2, Quote } from "lucide-react";
import MemberBadge from "@/components/MemberBadge";

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
  const { data: ministry, isLoading: ministryLoading } = useMinistry(slug || "");
  const { data: members = [], isLoading: membersLoading } = useBirthdaysByMinistry(ministry?.id);

  if (ministryLoading || membersLoading) {
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
  const leaders = members.filter(m => m.is_leader);
  const regularMembers = members.filter(m => !m.is_leader);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero with Bible Verse */}
      <section className="pt-32 pb-20 gradient-hero overflow-hidden relative text-white">
        {/* Geometric Decor */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <svg className="absolute -top-10 -right-10 w-64 h-64 text-white" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 container-church text-center">
          <Link
            to="/ministerios"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-12 transition-colors border-b border-white/20 pb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Ministérios
          </Link>

          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <IconComponent className="w-10 h-10 text-white" />
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-8 uppercase tracking-tighter">
            {ministry.title}
          </h1>

          {ministry.bible_verse && (
            <div className="max-w-3xl mx-auto space-y-4">
              <Quote className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-xl md:text-2xl font-display italic text-white leading-relaxed">
                "{ministry.bible_verse}"
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="container-church -mt-10 relative z-10">
        <div className="grid gap-16">
          {/* Leaders Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground inline-flex flex-col items-center gap-2">
                Liderança
                <span className="w-12 h-1 bg-primary rounded-full" />
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {leaders.length > 0 ? (
                leaders.map((leader) => (
                  <div key={leader.id} className="animate-fade-up">
                    <MemberBadge
                      name={leader.nickname || leader.man_name || leader.woman_name || "Líder"}
                      photo_url={leader.photo_url}
                      role="Líder / Supervisor"
                      variant="blue"
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center w-full">Nenhum líder definido no momento.</p>
              )}
            </div>
          </section>

          {/* Members Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground inline-flex flex-col items-center gap-2">
                Equipe
                <span className="w-12 h-1 bg-secondary rounded-full" />
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {regularMembers.length > 0 ? (
                regularMembers.map((member) => (
                  <div key={member.id} className="animate-fade-up">
                    <MemberBadge
                      name={member.nickname || member.man_name || member.woman_name || "Membro"}
                      photo_url={member.photo_url}
                      role="Integrante"
                      variant="white"
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center w-full">Nenhum integrante cadastrado.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
