import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Music,
  Tv,
  Heart,
  ArrowRight,
  Loader2,
  Quote,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import MemberBadge from "@/components/MemberBadge";
import { useMinistries, Ministry } from "@/hooks/useMinistries";
import { useBirthdaysByMinistry } from "@/hooks/useBirthdays";
import worshipImage from "@/assets/ministry-worship.jpg";
import techImage from "@/assets/ministry-tech.jpg";
import casadosImage from "@/assets/casados-para-sempre.jpg";

const iconMap: Record<string, any> = {
  Music: Music,
  Tv: Tv,
  Heart: Heart,
  Users: Users,
};

const defaultImages: Record<string, string> = {
  louvor: worshipImage,
  tech: techImage,
  casados: casadosImage,
};

export default function MinisteriosPage() {
  const { data: ministries, isLoading } = useMinistries();
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeMinistries = ministries?.filter(m => m.is_active) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden text-white">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <svg className="absolute -top-10 -right-10 w-64 h-64 text-white" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="container-church relative z-10 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-6 animate-fade-down uppercase">
            Uma Igreja Relevante para a Cidade
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-6 animate-fade-up uppercase tracking-tighter">
            Nossos Ministérios
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-up [animation-delay:200ms] font-medium">
            Descubra como pode florescer usando seus dons para servir a Deus e edificar a nossa comunidade.
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-20">
        <div className="container-church">
          {activeMinistries.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum ministério configurado no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeMinistries.map((ministry, index) => (
                <MinistryCard
                  key={ministry.id}
                  ministry={ministry}
                  index={index}
                  onClick={() => setSelectedMinistry(ministry)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-church pb-20">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-accent text-white p-12 md:p-20 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
              "Ide por todo o mundo e pregai o evangelho"
            </h2>
            <p className="text-xl text-white/80 font-medium tracking-wide">
              Quer fazer parte de um ministério? Entre em contacto e comece sua jornada de serviço hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button size="lg" className="rounded-full px-10 bg-white text-primary hover:bg-white/90 font-bold uppercase tracking-widest text-xs" asChild>
                <Link to="/contacto">Fale Connosco</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 border-white/40 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs" asChild>
                <Link to="/registo-aniversario">Registar-se na Igreja</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Detail Modal */}
      <MinistryDetailModal
        ministry={selectedMinistry}
        isOpen={!!selectedMinistry}
        onClose={() => setSelectedMinistry(null)}
      />
    </div>
  );
}

function MinistryCard({ ministry, index, onClick }: { ministry: Ministry, index: number, onClick: () => void }) {
  const IconComponent = iconMap[ministry.icon] || Users;
  const imageUrl = ministry.image_url || defaultImages[ministry.slug] || worshipImage;
  const isCasados = ministry.slug === "casados";

  return (
    <div
      className="group relative bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 animate-fade-up cursor-pointer border border-border/50"
      style={{ animationDelay: `${(index % 6) * 100}ms` }}
      onClick={isCasados ? undefined : onClick}
    >
      {isCasados ? (
        <Link to="/casados" className="block h-full">
          <CardContent ministry={ministry} IconComponent={IconComponent} imageUrl={imageUrl} />
        </Link>
      ) : (
        <CardContent ministry={ministry} IconComponent={IconComponent} imageUrl={imageUrl} />
      )}
    </div>
  );
}

function CardContent({ ministry, IconComponent, imageUrl }: any) {
  return (
    <>
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={imageUrl}
          alt={ministry.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-6 flex flex-col justify-end">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-3 shadow-lg">
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight uppercase">
          {ministry.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">
          {ministry.description}
        </p>
        <div className="flex items-center text-primary text-xs font-bold pt-2 uppercase tracking-widest">
          Saber mais
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
        </div>
      </div>
    </>
  );
}

import { MOCK_MEMBERS } from "@/data/mockData";

function MinistryDetailModal({ ministry, isOpen, onClose }: { ministry: Ministry | null, isOpen: boolean, onClose: () => void }) {
  const { data: dbMembers = [], isLoading } = useBirthdaysByMinistry(ministry?.id);

  // Use DB members if they exist, otherwise use mock data
  const members = dbMembers.length > 0 ? dbMembers : (ministry ? (MOCK_MEMBERS[ministry.slug] || MOCK_MEMBERS.default) : []);

  const IconComponent = ministry ? (iconMap[ministry.icon] || Users) : Users;

  const leaders = members.filter(m => m.is_leader);
  const regularMembers = members.filter(m => !m.is_leader);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white">
        {ministry && (
          <div className="flex flex-col max-h-[90vh]">
            {/* Header / Banner */}
            <div className="relative h-48 sm:h-64 shrink-0 bg-primary">
              <img
                src={ministry.image_url || defaultImages[ministry.slug] || worshipImage}
                alt={ministry.title}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
              <div className="absolute bottom-6 left-6 sm:left-10 flex items-end gap-6">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center shrink-0">
                  <IconComponent className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                </div>
                <div className="pb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] block mb-1">Ministério</span>
                  <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-foreground uppercase tracking-tighter">
                    {ministry.title}
                  </h2>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 sm:p-10 space-y-16">
                {/* Bible Verse */}
                {ministry.bible_verse && (
                  <div className="bg-primary/5 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden border border-primary/10">
                    <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/10" />
                    <p className="font-display text-xl sm:text-3xl italic text-foreground leading-relaxed text-center max-w-3xl mx-auto font-medium">
                      "{ministry.bible_verse}"
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <h3 className="font-display text-sm font-bold text-primary uppercase tracking-[0.2em]">Sobre o Ministério</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-xl font-medium">
                    {ministry.description}
                  </p>

                  {ministry.features && ministry.features.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      {ministry.features.map(feature => (
                        <Badge key={feature} variant="secondary" className="px-5 py-2 bg-muted/50 border-none font-bold uppercase tracking-widest text-[9px] text-muted-foreground rounded-full">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liderança */}
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <h3 className="font-display text-3xl font-extrabold text-foreground uppercase tracking-tight">Liderança</h3>
                    <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
                  </div>

                  <div className="flex flex-wrap justify-center gap-10">
                    {leaders.length > 0 ? (
                      leaders.map(leader => (
                        <div key={leader.id} className="scale-90 sm:scale-100">
                          <MemberBadge
                            name={leader.man_name || leader.woman_name || "Líder"}
                            photo_url={leader.photo_url}
                            role="Líder / Supervisor"
                            variant="blue"
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-sm text-center w-full">Nenhum líder definido no momento.</p>
                    )}
                  </div>
                </div>

                {/* Equipa */}
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <h3 className="font-display text-3xl font-extrabold text-foreground uppercase tracking-tight">Equipa</h3>
                    <div className="w-12 h-1 bg-secondary mx-auto rounded-full" />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : regularMembers.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-8">
                      {regularMembers.map(member => (
                        <div key={member.id} className="scale-75 sm:scale-90 -m-4">
                          <MemberBadge
                            name={member.man_name || member.woman_name || "Membro"}
                            photo_url={member.photo_url}
                            role="Integrante"
                            variant="white"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-lg text-center py-4 w-full">Seja o primeiro a se unir a esta equipa!</p>
                  )}
                </div>

                {/* Call Action */}
                <div className="pt-10 border-t border-border mt-10">
                  <Button className="w-full rounded-full h-16 text-xs font-bold gap-3 uppercase tracking-[0.2em] shadow-xl shadow-primary/20" asChild>
                    <Link to="/registo-aniversario">
                      <Star className="w-4 h-4 fill-current" />
                      Quero Fazer Parte Deste Ministério
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
