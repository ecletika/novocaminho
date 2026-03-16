
import { Quote } from "lucide-react";

export default function DailyVerse() {
    const verse = {
        text: "E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações.",
        reference: "Atos 2:42"
    };

    return (
        <div className="w-full bg-black/20 backdrop-blur-md rounded-xl p-4 md:p-8 border border-white/10 relative group overflow-hidden text-center justify-center items-center flex">
            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 pointer-events-none hidden md:block">
                <Quote size={120} />
            </div>

            <div className="relative z-10 text-center w-full">
                <div className="flex items-center justify-center mb-3 md:mb-6">
                    <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Versículo</span>
                </div>

                <p className="font-serif text-lg md:text-3xl text-white italic leading-relaxed mb-4 md:mb-6">
                    "{verse.text}"
                </p>

                <div className="flex items-center justify-center gap-3 md:gap-4">
                    <div className="h-px w-6 md:w-8 bg-white/30"></div>
                    <span className="font-bold text-white/70 uppercase tracking-widest text-[10px] md:text-xs">
                        {verse.reference}
                    </span>
                    <div className="h-px w-6 md:w-8 bg-white/30"></div>
                </div>
            </div>
        </div>
    );
}
