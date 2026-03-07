
import React, { useState, useEffect } from 'react';
import {
  Home, Book, BookOpen, Coffee, Search, NotebookPen, ShoppingBag, Users, User, LogOut, ChevronDown, Sun, Moon, Flame, Heart, Library as LibraryIcon,
  HeartHandshake, Compass, UserCircle
} from 'lucide-react';
import { AppView } from '@/types/bible';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { signOut, getUserStreak } from '@/integrations/supabase/bibleDataService';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: SupabaseUser | null;
  onAuthClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onAuthClick, theme, toggleTheme }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      if (user) {
        const val = await getUserStreak(user.id);
        setStreak(val);
      } else {
        setStreak(0);
      }
    };
    fetchStreak();
  }, [user]);

  const navItems = [
    { id: AppView.HOME, label: 'Início', icon: Home },
    { id: AppView.BIBLE, label: 'Bíblia', icon: Book },
    { id: AppView.PURPOSES, label: 'Planos', icon: Compass },
    { id: AppView.COUPLES, label: 'Casais', icon: HeartHandshake },
    { id: AppView.LIVRARIA, label: 'Livraria', icon: LibraryIcon },
    { id: AppView.PRAYER, label: 'Orações', icon: Heart },
    { id: AppView.DEVOTIONALS, label: 'Estudos', icon: BookOpen },
    { id: AppView.DICTIONARY, label: 'Léxico', icon: Search },
    { id: AppView.REFLECTIONS, label: 'Notas', icon: NotebookPen },
    { id: AppView.SHOP, label: 'Loja', icon: ShoppingBag },
    { id: AppView.COMMUNITY, label: 'Social', icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const userAvatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'U')}&background=1E40AF&color=fff`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-beige-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-4">
              <div
                className="flex flex-col items-start cursor-pointer group shrink-0"
                onClick={() => setView(AppView.HOME)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#1E40AF] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                    <span className="font-serif text-2xl font-bold italic">B</span>
                  </div>
                  <div className="ml-3 flex flex-col items-start leading-none">
                    <span className="font-serif text-lg font-bold text-[#1E40AF] dark:text-blue-400">Biblia Diária</span>
                    {user && streak > 0 && (
                      <div className="flex items-center gap-0.5 text-[8px] font-black text-amber-600/80 dark:text-amber-500/80 uppercase tracking-tighter mt-0.5">
                        <Flame size={8} fill="currentColor" className="animate-pulse" />
                        {streak} {streak === 1 ? 'dia' : 'dias'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <a
                href="/"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#1E40AF] hover:text-white transition-all border border-gray-200 dark:border-gray-700"
              >
                <ChevronDown size={14} className="rotate-90" />
                Sair da Bíblia
              </a>
            </div>

            {/* Menu Desktop - Visível a partir de md para não sumir em telas médias */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-4 space-x-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-2 py-2 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-tighter transition-all duration-200 flex flex-col items-center gap-1 group/item ${currentView === item.id
                      ? 'text-[#1E40AF] dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <item.icon size={18} className={currentView === item.id ? 'scale-110' : 'group-hover/item:scale-110 transition-transform'} />
                  <span className="opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Alternar Tema"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 pr-3 rounded-full transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 bg-[#1E40AF]/10 text-[#1E40AF] dark:text-blue-400 rounded-full flex items-center justify-center overflow-hidden">
                      <img src={userAvatarUrl} className="w-full h-full object-cover" alt="Perfil" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-200 hidden sm:block">
                      {user.user_metadata.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl py-2 animate-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-1 text-left">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sua Conta</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setView(AppView.PROFILE); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <UserCircle size={16} />
                        Meu Perfil
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-[#1E40AF] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-2"
                >
                  <User size={18} />
                  <span className="hidden xs:block">Entrar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Barra Inferior - Só aparece em telas muito pequenas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 z-[100] pb-safe">
        <div className="flex items-center justify-around h-16 px-0.5">
          <button onClick={() => setView(AppView.HOME)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.HOME ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><Home size={20} /><span className="text-[9px] font-bold">Início</span></button>
          <button onClick={() => setView(AppView.BIBLE)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.BIBLE ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><Book size={20} /><span className="text-[9px] font-bold">Bíblia</span></button>
          <button onClick={() => setView(AppView.COUPLES)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.COUPLES ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><HeartHandshake size={20} /><span className="text-[9px] font-bold">Casais</span></button>
          <button onClick={() => setView(AppView.PRAYER)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.PRAYER ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><Heart size={20} /><span className="text-[9px] font-bold">Oração</span></button>
          <button onClick={() => setView(AppView.DEVOTIONALS)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.DEVOTIONALS ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><BookOpen size={20} /><span className="text-[9px] font-bold">Estudo</span></button>
          <button onClick={() => setView(AppView.COMMUNITY)} className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === AppView.COMMUNITY ? 'text-[#1E40AF]' : 'text-gray-400 hover:text-gray-600'}`}><Users size={20} /><span className="text-[9px] font-bold">Social</span></button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
