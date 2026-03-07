import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const isBibliaPage = location.pathname === "/biblia";

  return (
    <div className="min-h-screen flex flex-col">
      {!isBibliaPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isBibliaPage && <Footer />}
    </div>
  );
}
