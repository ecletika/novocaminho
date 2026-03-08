import { BookOpen, Heart, Users, Coffee, Flame, Shield, Church } from "lucide-react";
import { Quote } from "lucide-react";

export default function BelievePage() {
    const pillars = [
        {
            icon: BookOpen,
            title: "Doutrina dos Apóstolos",
            description: "Cremos na autoridade final das Escrituras Sagradas para a fé e prática cristã. Nos dedicamos ao ensino fiel da Palavra de Deus.",
            color: "bg-blue-500/10 text-blue-600"
        },
        {
            icon: Users,
            title: "Comunhão",
            description: "Acreditamos que a igreja é uma família. Valorizamos relacionamentos autênticos, cuidado mútuo e a unidade do corpo de Cristo.",
            color: "bg-red-500/10 text-red-600"
        },
        {
            icon: Coffee,
            title: "Partir do Pão",
            description: "Relembramos o sacrifício de Jesus através da mesa e da hospitalidade. Cremos no poder da partilha e da vida em conjunto.",
            color: "bg-amber-500/10 text-amber-600"
        },
        {
            icon: Flame,
            title: "Orações",
            description: "A oração é o motor da nossa fé. Cremos na dependência total de Deus e na manifestação do Seu poder através da intercessão.",
            color: "bg-orange-500/10 text-orange-600"
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="pt-32 pb-20 gradient-hero">
                <div className="container-church text-center text-primary-foreground">
                    <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-8">
                        <Shield className="w-10 h-10 text-secondary" />
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
                        No que Cremos
                    </h1>
                    <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto font-light leading-relaxed">
                        Nossa fé está fundamentada nos princípios eternos do Reino de Deus,
                        manifestos através de uma vida de devoção e serviço.
                    </p>
                </div>
            </section>

            {/* Bible Verse Section */}
            <section className="py-24 bg-muted/30">
                <div className="container-church max-w-4xl">
                    <div className="relative p-12 bg-card rounded-[3rem] shadow-soft border border-primary/5 text-center overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3" />

                        <Quote className="w-12 h-12 text-secondary/40 mx-auto mb-6" />
                        <blockquote className="font-display text-2xl md:text-4xl italic text-foreground leading-snug mb-8">
                            "E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações."
                        </blockquote>
                        <cite className="font-semibold text-primary text-xl not-italic uppercase tracking-widest">
                            Atos 2:42
                        </cite>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section className="py-24">
                <div className="container-church">
                    <div className="text-center mb-16">
                        <span className="text-secondary font-semibold text-sm uppercase tracking-widest block mb-4">Nossos Pilares</span>
                        <h2 className="font-display text-4xl font-bold text-foreground">Fundamentos da Nossa Fé</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pillars.map((pillar, index) => (
                            <div
                                key={index}
                                className="group p-8 bg-card rounded-3xl shadow-soft hover:shadow-card transition-all duration-500 border border-transparent hover:border-primary/10 hover:-translate-y-2 text-center"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${pillar.color} flex items-center justify-center mx-auto mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <pillar.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                                    {pillar.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary/5">
                <div className="container-church text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="font-display text-3xl font-bold text-foreground">
                            Ainda tem dúvidas sobre nossa doutrina?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Estamos aqui para caminhar juntos e crescer no conhecimento da verdade.
                            Sinta-se à vontade para entrar em contacto ou nos visitar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-6 py-3 bg-card rounded-full shadow-soft font-medium text-foreground">
                                <Church className="w-5 h-5 text-secondary" />
                                <span>Cultos aos Domingos às 11h</span>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-card rounded-full shadow-soft font-medium text-foreground">
                                <Heart className="w-5 h-5 text-red-500" />
                                <span>É sempre bem-vindo!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
