import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Heart } from "lucide-react";
import logoImage from "@/assets/logo-igreja.jpeg";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-church section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logoImage}
                alt="Logo Igreja"
                className="w-12 h-12 object-cover rounded-sm border border-white/10"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl uppercase tracking-[0.15em] text-white">Novo Caminho</span>
                <span className="block text-[10px] uppercase tracking-[0.3em] font-light text-white/50">Portugal</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Uma igreja que acolhe, transforma vidas e proclama o amor de Cristo em Portugal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              {[
                { name: "Ministérios", href: "/ministerios" },
                { name: "Eventos", href: "/eventos" },
                { name: "Casados Para Sempre", href: "/casados" },
                { name: "No que Cremos", href: "/no-que-cremos" },
                { name: "Contato", href: "/contato" },
                { name: "Documentação", href: "/admin/docs" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <a href="https://maps.app.goo.gl/sXLL4ZogkSUZ6uyt7" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 text-sm group-hover:text-white transition-colors">
                  Rua da Parada N° 6<br />
                  Agualva-Cacém, Portugal
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/80 text-sm">+351 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href="mailto:contacto@igrejanovocaminho.pt" className="text-primary-foreground/80 text-sm hover:text-white transition-colors">
                  contacto@igrejanovocaminho.pt
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Redes Sociais</h3>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://www.facebook.com/igrejanovocaminhoportugal/", label: "Facebook" },
                { icon: Instagram, href: "https://www.instagram.com/novocaminhopt?igsh=YnI5NHhmdmk4aXgx", label: "Instagram" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
              <p className="text-sm text-primary-foreground/70">
                <span className="font-semibold text-secondary">Cultos:</span><br />
                Domingos às 10h e 18h<br />
                Quartas às 19h30
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Igreja Novo Caminho Portugal. Todos os direitos reservados.
          </p>
          <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-secondary fill-secondary" /> para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
}
