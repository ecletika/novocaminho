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
        <div className={`relative w-64 h-96 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 border ${isBlue ? "bg-primary text-white border-primary-foreground/20" : "bg-white text-primary border-gray-100"
            }`}>
            {/* Wave pattern background */}
            <div className="absolute inset-x-0 bottom-0 h-24 opacity-20 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
                    <path
                        fill={isBlue ? "white" : "currentColor"}
                        d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            {/* Top Logo Section */}
            <div className="flex flex-col items-center gap-1 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isBlue ? "border-white/30" : "border-primary/20"
                    }`}>
                    <div className={`w-4 h-4 rounded-sm border-2 ${isBlue ? "border-white" : "border-primary"}`}></div>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Novo Caminho</span>
                <span className="text-[8px] opacity-70 tracking-widest uppercase">Portugal</span>
            </div>

            {/* Main Photo */}
            <div className="relative z-10 my-auto">
                <div className={`w-32 h-32 rounded-full border-4 shadow-lg overflow-hidden ${isBlue ? "border-white" : "border-primary"
                    }`}>
                    <Avatar className="w-full h-full">
                        <AvatarImage src={photo_url} alt={name} className="object-cover" />
                        <AvatarFallback className={isBlue ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}>
                            {name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Bottom Text Section */}
            <div className="relative z-10 mt-auto text-center pb-8">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight leading-tight mb-1">
                    {name}
                </h3>
                {role && (
                    <p className={`text-[10px] font-medium uppercase tracking-[0.2em] ${isBlue ? "text-white/70" : "text-primary/70"
                        }`}>
                        {role}
                    </p>
                )}
            </div>
        </div>
    );
}
