import { CASADOS_COURSES } from "@/constants/casadosData";
import { BookOpen, Calendar, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CasadosCursosPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <section className="pt-32 pb-20 gradient-hero relative overflow-hidden text-white">
                <div className="container-church relative z-10 text-center" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
                        <Heart className="w-4 h-4" />
                        Inscrições
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
                        Nossos Cursos
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Participe de nossas turmas e fortaleça seu relacionamento com princípios bíblicos.
                    </p>
                </div>
            </section>

            <div className="container-church -mt-10 relative z-10 pb-20">
                <div className="grid gap-6 max-w-4xl mx-auto">
                    {CASADOS_COURSES.map((course) => (
                        <div
                            key={course.id}
                            className="bg-card rounded-2xl p-8 border border-border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-secondary/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-8 h-8 text-secondary" />
                                </div>
                                <div>
                                    <h4 className="font-display text-2xl font-bold text-foreground">{course.name}</h4>
                                    <p className="text-muted-foreground flex items-center gap-2 mt-2">
                                        <Calendar className="w-4 h-4" /> Próxima turma: {course.startDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${course.status === 'Inscrições Abertas'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-secondary/10 text-secondary'
                                    }`}>
                                    {course.status}
                                </span>
                                <Button asChild size="lg" className="rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 px-8">
                                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                                        Inscrever-se
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
