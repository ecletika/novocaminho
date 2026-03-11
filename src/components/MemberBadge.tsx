import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@/assets/logo-igreja.png";

interface MemberBadgeProps {
    name: string;
    photo_url?: string;
    role?: string;
    variant?: "blue" | "white";
}

export default function MemberBadge({ name, photo_url, role, variant = "blue" }: MemberBadgeProps) {
    const isBlue = variant === "blue";

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div className={`relative w-72 h-[460px] rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col items-center border transition-all duration-500 hover:scale-[1.03] ${isBlue
            ? "bg-[#1FA6DE] text-white border-white/20"
            : "bg-white text-[#16417A] border-black/5"
            }`}>

            {/* Background Pattern - Circles */}
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-current opacity-5 pointer-events-none ${isBlue ? "text-white" : "text-[#1FA6DE]"}`} />
            <div className={`absolute top-28 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-current opacity-10 pointer-events-none ${isBlue ? "text-white" : "text-[#1FA6DE]"}`} />

            {/* Top Logo Section */}
            <div className="flex flex-col items-center mt-12 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 p-1.5 ${isBlue ? "border-white/30 bg-white/10" : "border-[#1FA6DE]/20 bg-[#1FA6DE]/5"
                    }`}>
                    <img
                        src={logoImage}
                        className={`w-full h-full object-contain rounded-full ${isBlue ? "brightness-0 invert" : ""}`}
                        alt="Church Icon"
                    />
                </div>
                <h2 className={`text-xl font-black uppercase tracking-[0.2em] leading-tight font-display text-center ${isBlue ? "text-white" : "text-[#16417A]"
                    }`}>
                    IGREJA NOVO CAMINHO
                </h2>
                <span className={`text-[9px] font-bold uppercase tracking-[0.5em] opacity-80 font-display ${isBlue ? "text-white/80" : "text-[#16417A]/80"
                    }`}>
                    Portugal
                </span>
            </div>

            {/* Main Photo Area */}
            <div className="relative z-10 my-auto">
                <div className="relative flex flex-col items-center">
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
                                    className="w-24 h-24 object-contain rounded-full opacity-20"
                                    alt="Church Fallback"
                                />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Bottom Text Section */}
            <div className="relative z-20 mt-auto text-center pb-12 w-full px-6 flex flex-col items-center">
                <div className="mb-6">
                    <h3 className={`font-display text-3xl font-black uppercase tracking-tight leading-none ${isBlue ? "text-white" : "text-[#16417A]"
                        }`}>
                        {firstName}
                    </h3>
                    <p className={`font-display text-base font-medium uppercase tracking-[0.2em] mt-1 opacity-80 ${isBlue ? "text-white" : "text-[#16417A]"
                        }`}>
                        {lastName}
                    </p>
                </div>

                {role && (
                    <div className="w-full">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] py-3 px-8 rounded-full border backdrop-blur-sm ${isBlue
                            ? "bg-white/10 text-white border-white/20"
                            : "bg-[#1FA6DE]/5 text-[#16417A] border-[#16417A]/10"
                            }`}>
                            {role}
                        </span>
                    </div>
                )}
            </div>

            {/* Wavy accents at top and bottom */}
            <div className={`absolute top-0 left-0 right-0 h-10 opacity-20 ${isBlue ? "bg-white" : "bg-primary/20"}`} style={{ clipPath: 'ellipse(60% 40% at 50% 0%)' }} />
            <div className={`absolute bottom-0 left-0 right-0 h-20 opacity-20 ${isBlue ? "bg-white/20" : "bg-[#16417A]/10"}`} style={{ clipPath: 'ellipse(70% 60% at 50% 100%)' }} />
        </div>
    );
}
