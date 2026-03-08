import { CASADOS_RESOURCES } from "@/constants/casadosData";
import { FileText, GraduationCap, ClipboardList, BookOpen, UserPlus, Heart, ArrowRight } from "lucide-react";

const resourceIconMap: Record<string, React.ElementType> = {
    FileText,
    GraduationCap,
    ClipboardList,
    BookOpen,
    UserPlus
};

export default function CasadosRecursosPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <section className="pt-32 pb-20 gradient-hero relative overflow-hidden text-white">
                <div className="container-church relative z-10 text-center" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
                        <Heart className="w-4 h-4" />
                        Recursos
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
                        Materiais de Apoio
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Links, manuais e ferramentas úteis para auxiliar na jornada do casal.
                    </p>
                </div>
            </section>

            <div className="container-church -mt-10 relative z-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {CASADOS_RESOURCES.map((resource) => {
                        const Icon = resourceIconMap[resource.icon] || FileText;
                        return (
                            <a
                                key={resource.title}
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-card rounded-2xl p-8 border border-border hover:border-secondary shadow-xl hover:shadow-2xl transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-start gap-6 mb-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-primary-foreground transition-all duration-300`}>
                                        <Icon className="w-8 h-8 text-secondary group-hover:text-inherit" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-secondary transition-colors mb-2">{resource.title}</h4>
                                        <p className="text-muted-foreground leading-relaxed">{resource.description}</p>
                                    </div>
                                </div>
                                <div className="mt-auto pt-6 flex items-center gap-2 text-sm font-black text-secondary uppercase tracking-[0.2em]">
                                    <span>Aceder Material</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
