import { Link } from "react-router-dom";
import { UserPlus, Users, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayVisitors } from "@/hooks/useVisitors";
import { useVisitorPortalConfig } from "@/hooks/useVisitorPortalConfig";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function VisitantesPage() {
  const { data: visitors = [], isLoading } = useTodayVisitors();
  const { data: config } = useVisitorPortalConfig();
  const showList = config?.show_daily_public ?? true;

  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: pt });

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 gradient-hero">
        <div className="container-church text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-4">
            Visitantes do Dia
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Damos as boas-vindas a todos os que nos visitam hoje. Que se sintam em casa!
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="section-padding">
        <div className="container-church">
          {!showList ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                É a sua primeira vez connosco?
              </h3>
              <p className="text-muted-foreground mb-6">
                Faça o seu registo para mantermos contacto consigo.
              </p>
              <Button asChild>
                <Link to="/registo-visitante">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Fazer o meu registo
                </Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Ainda não há visitantes registados hoje
              </h3>
              <p className="text-muted-foreground mb-6">
                É a sua primeira vez connosco? Faça o seu registo e apareça aqui!
              </p>
              <Button asChild>
                <Link to="/registo-visitante">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Fazer o meu registo
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{visitors.length}</span>{" "}
                  {visitors.length === 1 ? "visitante" : "visitantes"} hoje
                </p>
                <Button asChild variant="outline">
                  <Link to="/registo-visitante">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registar-me
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {visitors.map((v) => (
                  <div
                    key={v.id}
                    className="bg-card rounded-2xl shadow-soft p-5 flex flex-col items-center text-center"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mb-4">
                      {v.photo_url ? (
                        <img
                          src={v.photo_url}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-3xl font-bold text-primary">
                          {v.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground leading-tight">{v.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(v.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
