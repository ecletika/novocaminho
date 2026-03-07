import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@/assets/logo-igreja.jpeg";

interface MemberBadgeProps {
    name: string;
    photo_url?: string;
    role?: string;
    variant?: "blue" | "white";
}

export default function MemberBadge({ name, photo_url, role, variant = "blue" }: MemberBadgeProps) {
    const isBlue = variant === "blue";

    return (
        <div className={`relative w-72 h-[450px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center border transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] ${isBlue
            ? "bg-[#1FA6DE] text-white border-white/20"
            : "bg-[#F8F9FA] text-[#16417A] border-black/5"
            }`}>

            {/* Top Wavy Pattern */}
            <div className={`absolute top-0 left-0 right-0 h-12 flex items-center justify-center opacity-30 ${isBlue ? "invert" : ""}`}>
                <svg viewBox="0 0 400 60" className="w-full h-full scale-110">
                    <path
                        fill="white"
                        d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10 V60 H0 Z"
                    />
                </svg>
            </div>

            {/* Bottom Wavy Pattern */}
            <div className={`absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center opacity-40 ${isBlue ? "invert" : ""}`}>
                <svg viewBox="0 0 400 60" className="w-full h-full scale-110">
                    <path
                        fill="white"
                        d="M0,50 Q25,60 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 V0 H0 Z"
                    />
                </svg>
            </div>

            {/* Top Logo Section */}
            <div className="flex flex-col items-center gap-1 mt-10 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${isBlue ? "border-white/30 bg-white/10" : "border-[#1FA6DE]/20 bg-[#1FA6DE]/5"
                    }`}>
                    <div className={`w-3 h-3 rounded-full ${isBlue ? "bg-white" : "bg-[#1FA6DE]"}`} />
                </div>
                <h2 className={`text-xl font-bold uppercase tracking-[0.15em] leading-tight ${isBlue ? "text-white" : "text-[#1FA6DE]"
                    }`}>
                    Novo Caminho
                </h2>
                <span className={`text-[9px] font-bold uppercase tracking-[0.4em] opacity-80 ${isBlue ? "text-white/80" : "text-[#1FA6DE]/80"
                    }`}>
                    Portugal
                </span>
            </div>

            {/* Main Photo Area */}
            <div className="relative z-10 my-auto">
                <div className="relative flex flex-col items-center">
                    {/* Concentric Decorative Rings */}
                    <div className={`absolute -inset-10 rounded-full border border-current opacity-5 pointer-events-none ${isBlue ? "text-white" : "text-[#1FA6DE]"}`} />
                    <div className={`absolute -inset-6 rounded-full border border-current opacity-10 pointer-events-none ${isBlue ? "text-white" : "text-[#1FA6DE]"}`} />

                    <div className={`w-44 h-44 rounded-full border-[8px] shadow-2xl overflow-hidden relative ${isBlue ? "border-white" : "border-white"
                        }`}>
                        <Avatar className="w-full h-full rounded-none">
                            <AvatarImage
                                src={photo_url}
                                alt={name}
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <AvatarFallback className={`bg-white text-primary flex items-center justify-center`}>
                                <img
                                    src={logoImage}
                                    className="w-24 h-24 object-contain opacity-20"
                                    alt="Church Fallback"
                                />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Bottom Text Section */}
            <div className="relative z-20 mt-auto text-center pb-12 w-full px-6 flex flex-col items-center">
                <h3 className={`font-display text-2xl font-black uppercase tracking-tight leading-none mb-1 text-balance ${isBlue ? "text-white" : "text-[#1FA6DE]"
                    }`}>
                    {name}
                </h3>

                {role && (
                    <div className="mt-4">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full border ${isBlue
                                ? "bg-white/10 text-white border-white/20"
                                : "bg-[#1FA6DE]/10 text-[#1FA6DE] border-[#1FA6DE]/20"
                            }`}>
                            {role}
                        </span>
                    </div>
                )}
            </div>

            {/* Glossy Overlay effect for extra premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 pointer-events-none" />
        </div>
    );
}
