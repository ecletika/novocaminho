import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberBadgeProps {
    name: string;
    photo_url?: string;
    role?: string;
    variant?: "blue" | "white";
}

export default function MemberBadge({ name, photo_url, role, variant = "blue" }: MemberBadgeProps) {
    const isBlue = variant === "blue";

    return (
        <div className={`relative w-64 h-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6 border group transition-all duration-500 hover:scale-[1.02] ${isBlue
                ? "bg-primary text-white border-white/20"
                : "bg-white text-primary border-primary/10 shadow-soft"
            }`}>
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none badge-pattern ${isBlue ? "invert brightness-200" : ""}`} />

            {/* Wave Decoration */}
            <div className="absolute inset-x-0 bottom-0 h-32 opacity-30 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-full">
                    <path
                        fill={isBlue ? "white" : "hsl(var(--primary))"}
                        d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            {/* Top Logo Section */}
            <div className="flex flex-col items-center gap-1.5 mb-8 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 ${isBlue ? "border-white/40 bg-white/10" : "border-primary/20 bg-primary/5 shadow-inner"
                    }`}>
                    <div className={`w-4 h-4 rounded-sm border-2 -rotate-45 ${isBlue ? "border-white" : "border-primary"}`} />
                </div>
                <div className="mt-2 text-center">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase block">Novo Caminho</span>
                    <div className={`h-0.5 w-8 mx-auto my-0.5 rounded-full ${isBlue ? "bg-white/40" : "bg-primary/20"}`} />
                    <span className="text-[8px] font-bold opacity-60 tracking-[0.4em] uppercase">Portugal</span>
                </div>
            </div>

            {/* Main Photo Area */}
            <div className="relative z-10 my-auto">
                <div className="relative">
                    <div className={`absolute -inset-2 rounded-full blur-lg opacity-40 transition-opacity group-hover:opacity-60 ${isBlue ? "bg-white" : "bg-primary"
                        }`} />
                    <div className={`w-36 h-36 rounded-full border-[6px] shadow-2xl overflow-hidden relative ${isBlue ? "border-white" : "border-primary"
                        }`}>
                        <Avatar className="w-full h-full">
                            <AvatarImage src={photo_url} alt={name} className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            <AvatarFallback className={`text-2xl font-bold ${isBlue ? "bg-white/10 text-white" : "bg-primary/5 text-primary"
                                }`}>
                                {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Bottom Text Section */}
            <div className="relative z-20 mt-auto text-center pb-8 w-full">
                <div className={`h-px w-12 mx-auto mb-4 ${isBlue ? "bg-white/20" : "bg-primary/10"}`} />
                <h3 className="font-display text-xl font-black uppercase tracking-tighter leading-none mb-1 text-balance">
                    {name}
                </h3>
                {role && (
                    <div className="inline-block mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full ${isBlue ? "bg-white/10 text-white/80" : "bg-primary/5 text-primary/70"
                            }`}>
                            {role}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
