import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@/assets/logos/10 - Fresh Sky.png";
import { Church } from "lucide-react";

interface MemberBadgeProps {
    name: string;
    photo_url?: string;
    role?: string;
    variant?: "blue" | "white";
}

export default function MemberBadge({ name, photo_url, role, variant = "blue" }: MemberBadgeProps) {
    const isBlue = variant === "blue";
    
    // Exact requested color for Blue variant
    const brandBlue = "#29ABE2";
    const brandWhite = "#FFFFFF";
    const brandCreme = "#FBF4F2";

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div 
            className={`relative w-[320px] h-[520px] rounded-[32px] overflow-hidden flex flex-col items-center shadow-2xl transition-all duration-500 hover:scale-[1.02] ${
                isBlue ? "bg-[#29ABE2] text-white" : "bg-[#FBF4F2] text-[#16417A]"
            }`}
            style={{ 
                border: "8px solid #111", // Dark physical frame look
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
            }}
        >
            {/* The Badge Frame Overlay (physical look) */}
            <div className="absolute inset-0 border-[12px] border-black/10 pointer-events-none rounded-[24px]" />

            {/* Top Decorative Wave Pattern */}
            <div className={`absolute top-0 left-0 right-0 h-10 overflow-hidden flex ${isBlue ? "text-white/20" : "text-[#29ABE2]/10"}`}>
                <div className="flex animate-pulse-glow" style={{ width: '200%' }}>
                    {[...Array(20)].map((_, i) => (
                        <svg key={i} width="40" height="20" viewBox="0 0 40 20" fill="currentColor" className="shrink-0">
                            <path d="M0 20C10 20 10 0 20 0C30 0 30 20 40 20H0Z" />
                        </svg>
                    ))}
                </div>
            </div>

            {/* Inner Content Container */}
            <div className="flex flex-col h-full w-full items-center z-10 pt-10 pb-8 px-6">
                
                {/* Header Icon */}
                <div className={`mb-4 ${isBlue ? "text-white/80" : "text-[#29ABE2]"}`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isBlue ? "border-white/40" : "border-[#29ABE2]/40"}`}>
                        <Church className="w-4 h-4" />
                    </div>
                </div>

                {/* Main Logo Container */}
                <div className="w-full px-4 mb-6">
                    <img
                        src={logoImage}
                        alt="Novo Caminho Portugal"
                        className={`w-full h-auto object-contain ${isBlue ? "brightness-0 invert" : ""}`}
                    />
                </div>

                {/* Photo Section */}
                <div className="relative mb-8">
                    <div className={`w-48 h-48 rounded-full border-[6px] shadow-xl overflow-hidden border-white ${isBlue ? "shadow-black/20" : "shadow-[#16417A]/10"}`}>
                        <Avatar className="w-full h-full">
                            <AvatarImage
                                src={photo_url}
                                alt={name}
                                className="object-cover w-full h-full"
                            />
                            <AvatarFallback className="bg-slate-50 flex items-center justify-center">
                                <div className="text-[#29ABE2]/20 font-black text-6xl select-none">
                                    NC
                                </div>
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Member Info */}
                <div className="text-center flex-1 w-full">
                    <h3 className={`font-display text-4xl font-extrabold uppercase tracking-tight leading-tight ${isBlue ? "text-white" : "text-[#16417A]"}`}>
                        {firstName}
                    </h3>
                    <p className={`font-display text-lg font-medium uppercase tracking-widest opacity-80 mt-[-2px] ${isBlue ? "text-white/80" : "text-[#29ABE2]"}`}>
                        {lastName || "Membro"}
                    </p>
                </div>

                {/* Role Badge (Bottom Pill) */}
                {role && (
                    <div className={`mt-auto inline-flex items-center justify-center py-2 px-8 rounded-full border-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        isBlue 
                        ? "bg-transparent text-white border-white hover:bg-white/10" 
                        : "bg-transparent text-[#29ABE2] border-[#29ABE2] hover:bg-[#29ABE2]/5"
                    }`}>
                        {role === "ministrante" ? "LÍDER / SUPERVISOR" : role.toUpperCase().includes("LÍDER") || role.toUpperCase().includes("LIDER") ? "LÍDER" : "INTEGRANTE"}
                    </div>
                )}
            </div>

            {/* Bottom Decorative Wave Pattern (Inverted) */}
            <div className={`absolute bottom-0 left-0 right-0 h-10 overflow-hidden flex rotate-180 ${isBlue ? "text-white/20" : "text-[#29ABE2]/10"}`}>
                <div className="flex animate-pulse-glow" style={{ width: '200%' }}>
                    {[...Array(20)].map((_, i) => (
                        <svg key={i} width="40" height="20" viewBox="0 0 40 20" fill="currentColor" className="shrink-0">
                            <path d="M0 20C10 20 10 0 20 0C30 0 30 20 40 20H0Z" />
                        </svg>
                    ))}
                </div>
            </div>
            
            {/* Fine watermark-like arc background lines */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border ${isBlue ? "border-white/5" : "border-[#29ABE2]/5"} pointer-events-none`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border ${isBlue ? "border-white/5" : "border-[#29ABE2]/5"} pointer-events-none`} />
        </div>
    );
}


