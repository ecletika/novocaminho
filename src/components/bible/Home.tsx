
import React, { useState, useEffect } from 'react';
import { Verse, Devotional, DailyBread, AppView } from '@/types/bible';
import VerseCard from './VerseCard';
import { BookOpen, Coffee, ChevronRight, NotebookPen, Sparkles, Loader2, RefreshCw, Flame, Heart, Search, HeartHandshake, Library as LibraryIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getDevotionalsList, getUserStreak } from '@/integrations/supabase/bibleDataService';

interface HomeProps {
  verse: Verse | null;
  devotional: Devotional | null;
  bread: DailyBread | null;
  user: User | null;
  onReadChapter: (book: string, chapter: number) => void;
  onViewDevotional: (devo: Devotional) => void;
  onAuthRequired: () => void;
  setView: (view: AppView) => void;
  onRefreshVerse: () => void;
  isRefreshingVerse: boolean;
}

const HomeView: React.FC<HomeProps> = ({ 
  verse, 
  devotional, 
  bread, 
  user, 
  onReadChapter, 
  onViewDevotional,
  onAuthRequired, 
  setView,
  onRefreshVerse,
  isRefreshingVerse
}) => {
  const [displayDevo, setDisplayDevo] = useState<Devotional | null>(devotional);
  const [loadingDevo, setLoadingDevo] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      getUserStreak(user.id).then(setStreak);
    }

    const fetchRandomDevo = async () => {
      setLoadingDevo(true);
      try {
        const list = await getDevotionalsList();
        if (list && list.length > 0) {
          const randomIndex = Math.floor(Math.random() * list.length);
          setDisplayDevo(list[randomIndex]);
        }
      } catch (err) {
        console.error("Erro ao carregar variedade de devocionais:", err);
      } finally {
        setLoadingDevo(false);
      }
    };

    fetchRandomDevo();
  }, [user]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative flex flex-col gap-4">
        {/* SELO DE DIAS SEGUIDOS */}
        {user && streak > 0 && (
          <div className="flex justify-center animate-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#1e3a8a] px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-white/20 dark:border-black/20">
              <div className="bg-white/20 p-1 rounded-full animate-pulse">
                <Flame size={20} className="text-white" fill="currentColor" />
              </div>
              <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-sm">
                {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'} na Palavra
              </span>
            </div>
          </div>
        )}

        {/* BOTÃO TROCAR VERSÍCULO - AJUSTADO PARA MOBILE */}
        <div className="flex justify-center md:absolute md:-top-4 md:-right-2 z-20">
          <button 
            onClick={onRefreshVerse}
            disabled={isRefreshingVerse}
            className="flex items-center gap-2 bg-[#1E40AF] text-white px-5 py-2.5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-xs uppercase tracking-widest border-2 border-white dark:border-gray-950"
          >
            {isRefreshingVerse ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Trocar Versículo
          </button>
        </div>

        {/* CARD DO VERSÍCULO */}
        <div className={isRefreshingVerse ? 'opacity-50 pointer-events-none grayscale transition-all' : 'transition-all'}>
          <VerseCard 
            verse={verse} 
            onReadChapter={onReadChapter} 
            user={user} 
            onAuthRequired={onAuthRequired} 
          />
        </div>
      </section>

      {/* SEÇÃO: LINKS RÁPIDOS (REFORMULADA) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* ORAÇÃO */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => setView(AppView.PRAYER)}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Heart size={28} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Orações</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Falar com Deus</p>
            </div>
          </div>
        </div>

        {/* CASAIS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => setView(AppView.COUPLES)}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <HeartHandshake size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Casais</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Edificar o Lar</p>
            </div>
          </div>
        </div>

        {/* LIVRARIA */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => setView(AppView.LIVRARIA)}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-[#1E40AF] dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <LibraryIcon size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Livraria</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Acervo de PDFs</p>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => setView(AppView.REFLECTIONS)}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <NotebookPen size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notas</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Meu Diário</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: PÃO DIÁRIO */}
      {bread && (
        <section 
          className="bg-[#1E40AF] dark:bg-[#1e3a8a] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-500 group cursor-pointer"
          onClick={() => setView(AppView.BREAD)}
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <Coffee size={240} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Coffee size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold tracking-tight">Pão Diário</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Alimento Espiritual para Hoje</p>
              </div>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold italic leading-tight text-left">
              "{bread.title}"
            </h3>
            
            <p className="text-white/80 line-clamp-2 text-lg font-serif italic max-w-2xl text-left">
              {bread.message}
            </p>

            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
               <button className="bg-white text-[#1E40AF] px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all">
                  Ler Mensagem Completa
               </button>
               <div className="hidden sm:flex items-center gap-2 text-white/60 text-xs italic">
                  <Sparkles size={16} /> Toque para meditar e orar
               </div>
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO: DEVOCIONAL ALEATÓRIO */}
      <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <BookOpen size={160} />
        </div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E40AF]/10 dark:bg-[#1E40AF]/20 rounded-2xl flex items-center justify-center text-[#1E40AF] dark:text-blue-400 shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Inspiração para sua Jornada</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1E40AF] opacity-60">Sugestão do Acervo</p>
            </div>
          </div>
          <button 
            onClick={() => setView(AppView.DEVOTIONALS)}
            className="text-[#1E40AF] dark:text-blue-400 hover:underline text-sm font-black uppercase tracking-widest flex items-center gap-2 group/btn"
          >
            Ver catálogo <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {loadingDevo ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#1E40AF]" size={32} />
            <p className="text-gray-400 font-serif italic">Buscando uma palavra no acervo...</p>
          </div>
        ) : displayDevo ? (
          <div className="space-y-6 relative z-10">
            <h3 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-gray-100 font-bold leading-tight group-hover:text-[#1E40AF] transition-colors text-left">
              {displayDevo.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed line-clamp-3 italic font-serif text-left">
              {displayDevo.summary}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800 gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-[#1E40AF]">
                    {displayDevo.author.charAt(0)}
                 </div>
                 <div className="text-sm">
                   <p className="font-bold text-gray-900 dark:text-gray-200">{displayDevo.author}</p>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Autor da Mensagem</p>
                 </div>
               </div>
               <button 
                  onClick={() => onViewDevotional(displayDevo)}
                  className="w-full sm:w-auto bg-[#1E40AF] dark:bg-[#1e3a8a] text-white px-10 py-4 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all font-bold text-sm uppercase tracking-widest shadow-lg"
                >
                  Mergulhar neste Estudo
                </button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 font-serif italic text-lg">Nenhum devocional encontrado no catálogo.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
