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

import { MOCK_MEMBERS } from "@/data/mockData";

export default function MinisterioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: ministry, isLoading: ministryLoading } = useMinistry(slug || "");
  const { data: dbMembers = [], isLoading: membersLoading } = useBirthdaysByMinistry(ministry?.id);

  if (ministryLoading || membersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <h1 className="font-display text-4xl font-black text-primary uppercase tracking-tighter mb-4">
            Ministério não encontrado
          </h1>
          <Button asChild className="rounded-full px-8">
            <Link to="/ministerios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Ministérios
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const members = dbMembers.length > 0 ? dbMembers : (MOCK_MEMBERS[ministry.slug] || MOCK_MEMBERS.default);
  const IconComponent = iconMap[ministry.icon] || Users;
  const leaders = members.filter(m => m.is_leader);
  const regularMembers = members.filter(m => !m.is_leader);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero with Bible Verse */}
      <section className="pt-32 pb-20 gradient-hero overflow-hidden relative text-white">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {ministry.image_url ? (
            <>
              <img
                src={ministry.image_url}
                alt=""
                className="w-full h-full object-cover scale-105 blur-sm opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/95 to-background" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
          )}
          <svg className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-10" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 container-church text-center" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
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

          <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-8 uppercase tracking-tighter" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {leaders.length > 0 ? (
                leaders.map((leader) => (
                  <div key={leader.id} className="animate-fade-up">
                    <MemberBadge
                      name={leader.man_name || leader.woman_name || "Líder"}
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
                Equipa
                <span className="w-12 h-1 bg-secondary rounded-full" />
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {regularMembers.length > 0 ? (
                regularMembers.map((member) => (
                  <div key={member.id} className="animate-fade-up">
                    <MemberBadge
                      name={member.man_name || member.woman_name || "Membro"}
                      photo_url={member.photo_url}
                      role="Integrante"
                      variant="white"
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center w-full">Nenhum integrante registado.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
