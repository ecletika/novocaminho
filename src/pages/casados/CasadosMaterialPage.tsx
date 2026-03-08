import CasadosOnlineMaterial from "@/components/CasadosOnlineMaterial";
import { Heart } from "lucide-react";

export default function CasadosMaterialPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <section className="pt-32 pb-20 gradient-hero relative overflow-hidden text-white">
                <div className="container-church relative z-10 text-center" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
                        <Heart className="w-4 h-4" />
                        Material Online
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
                        Conteúdo de Estudo
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Aceda as aulas, vídeos e materiais exclusivos do Casados Para Sempre.
                    </p>
                </div>
            </section>

            <div className="container-church -mt-10 relative z-10 pb-20">
                <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border p-1 md:p-6 lg:p-8">
                    <CasadosOnlineMaterial />
                </div>
            </div>
        </div>
    );
}
