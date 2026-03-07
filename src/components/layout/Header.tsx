import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Radio, ChevronDown } from "lucide-react";
import { useMinistries } from "@/hooks/useMinistries";
import logoImage from "@/assets/logo-igreja.jpeg";
import RadioModal from "@/components/RadioModal";

const baseNavigation = [
  { name: "Início", href: "/" },
  { name: "Eventos", href: "/eventos" },
  { name: "Bíblia", href: "/biblia" },
  { name: "Casados Para Sempre", href: "/casados" },
  { name: "No que Cremos", href: "/no-que-cremos" },
  { name: "Contato", href: "/contato" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMinisteriosOpen, setIsMinisteriosOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const location = useLocation();
  const { data: ministries } = useMinistries();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => location.pathname === href;
  const isMinisteriosActive = location.pathname.startsWith("/ministerios");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
          }`}
      >
        <div className="container-church">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4">
              <img
                src={logoImage}
                alt="Logo Igreja"
                className="w-12 h-12 object-cover rounded-sm border border-white/10"
              />
              <div className="hidden sm:flex flex-col">
                <span className={`font-display text-2xl font-black uppercase tracking-[0.2em] leading-none transition-colors ${isScrolled ? "text-primary" : "text-white"
                  }`}>
                  NOVO CAMINHO
                </span>
                <span className={`block text-[10px] uppercase tracking-[0.5em] font-bold transition-colors ${isScrolled ? "text-muted-foreground" : "text-white/70"
                  }`}>
                  Portugal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/")
                  ? isScrolled
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary-foreground/20 text-primary-foreground"
                  : isScrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
              >
                Início
              </Link>

              {/* Ministérios Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMinisteriosOpen(!isMinisteriosOpen)}
                  onBlur={() => setTimeout(() => setIsMinisteriosOpen(false), 150)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${isMinisteriosActive
                    ? isScrolled
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-foreground/20 text-primary-foreground"
                    : isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                >
                  Ministérios
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMinisteriosOpen ? "rotate-180" : ""}`} />
                </button>

                {isMinisteriosOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
                    <Link
                      to="/ministerios"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Ver Todos
                    </Link>
                    <div className="h-px bg-border my-1" />
                    {ministries?.filter(m => m.is_active).map((ministry) => (
                      <Link
                        key={ministry.id}
                        to={ministry.slug === "casados" ? "/casados" : `/ministerios/${ministry.slug}`}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {ministry.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {baseNavigation.slice(1).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? isScrolled
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-foreground/20 text-primary-foreground"
                    : isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant={isScrolled ? "outline" : "hero-outline"}
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => setIsRadioOpen(true)}
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Rádio</span>
              </Button>

              <Link to="/auth">
                <Button variant={isScrolled ? "default" : "hero"} size="sm">
                  Painel Admin
                </Button>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-card shadow-card border-t border-border animate-fade-in">
              <div className="container-church py-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive("/")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                    }`}
                >
                  Início
                </Link>
                <Link
                  to="/ministerios"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isMinisteriosActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                    }`}
                >
                  Ministérios
                </Link>
                {ministries?.filter(m => m.is_active).map((ministry) => (
                  <Link
                    key={ministry.id}
                    to={ministry.slug === "casados" ? "/casados" : `/ministerios/${ministry.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-8 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {ministry.title}
                  </Link>
                ))}
                {baseNavigation.slice(1).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsRadioOpen(true); }}
                  className="w-full px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  Rádio
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Radio Modal */}
      <RadioModal open={isRadioOpen} onOpenChange={setIsRadioOpen} />
    </>
  );
}
