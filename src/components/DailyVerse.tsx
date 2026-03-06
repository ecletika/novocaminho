
import { useEffect, useState } from "react";
import { getDailyVerse } from "@/integrations/supabase/bibleService";
import { Verse } from "@/types/bible";
import { Quote, RefreshCw } from "lucide-react";

export default function DailyVerse() {
    const [verse, setVerse] = useState<Verse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchVerse = async () => {
        setLoading(true);
        const data = await getDailyVerse();
        setVerse(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchVerse();
    }, []);

    if (loading) {
        return (
            <div className="w-full bg-secondary/5 backdrop-blur-md rounded-2xl p-8 border border-secondary/10 animate-pulse">
                <div className="h-4 bg-secondary/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-secondary/20 rounded w-1/2"></div>
            </div>
        );
    }

    if (!verse) return null;

    return (
        <div className="w-full bg-secondary/5 backdrop-blur-md rounded-2xl p-8 border border-secondary/10 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Quote size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-secondary text-[10px] font-black uppercase tracking-[0.3em]">Versículo do Dia</span>
                    <button
                        onClick={fetchVerse}
                        className="text-secondary/40 hover:text-secondary p-2 transition-colors"
                        title="Trocar versículo"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <p className="font-serif text-2xl md:text-3xl text-foreground italic leading-relaxed mb-6">
                    "{verse.text}"
                </p>

                <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-secondary/50"></div>
                    <span className="font-bold text-foreground/70 uppercase tracking-widest text-xs">
                        {verse.reference}
                    </span>
                </div>
            </div>
        </div>
    );
}
