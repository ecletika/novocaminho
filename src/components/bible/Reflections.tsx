
import React, { useState, useEffect } from 'react';
import { 
  NotebookPen, 
  Search, 
  Loader2, 
  Trash2, 
  Edit, 
  BookOpen, 
  StickyNote, 
  MessageSquareText,
  X,
  Lock,
  ChevronRight,
  Filter,
  Share2,
  Check
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { 
  getAllUserVerseReflections, 
  getAllUserChapterReflections, 
  getAllUserDevotionalReflections,
  deleteVerseReflection,
  deleteChapterReflection,
  deleteDevotionalReflection
} from '@/integrations/supabase/bibleDataService';
import { Devotional } from '@/types/bible';

interface ReflectionsViewProps {
  user: User | null;
  onAuthRequired: () => void;
  onReadChapter: (book: string, chapter: number, verse?: number) => void;
  onViewDevotional: (devo: Devotional) => void;
}

type ReflectionType = 'all' | 'verse' | 'chapter' | 'devotional';

const ReflectionsView: React.FC<ReflectionsViewProps> = ({ user, onAuthRequired, onReadChapter, onViewDevotional }) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReflectionType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const [verseRefs, setVerseRefs] = useState<any[]>([]);
  const [chapterRefs, setChapterRefs] = useState<any[]>([]);
  const [devoRefs, setDevoRefs] = useState<any[]>([]);

  const loadAll = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [v, c, d] = await Promise.all([
        getAllUserVerseReflections(user.id),
        getAllUserChapterReflections(user.id),
        getAllUserDevotionalReflections(user.id)
      ]);
      setVerseRefs(v);
      setChapterRefs(c);
      setDevoRefs(d);
    } catch (err) {
      console.error("Erro ao carregar reflexões:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleShare = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    let title = "";
    let header = "";
    
    if (item.type === 'verse') {
      const ref = item.verse_reference.replace(/_/g, ' ').replace(/ (\d+)$/, ':$1');
      title = `Reflexão: ${ref}`;
      header = `📖 Minha reflexão sobre ${ref}:`;
    } else if (item.type === 'chapter') {
      title = `Nota: ${item.book} ${item.chapter}`;
      header = `📜 Minha nota sobre ${item.book} ${item.chapter}:`;
    } else if (item.type === 'devotional') {
      const devoTitle = item.devotionals?.title || 'Estudo';
      title = `Reflexão: ${devoTitle}`;
      header = `✨ Minha reflexão sobre o estudo "${devoTitle}":`;
    }

    const textToShare = `${header}\n\n"${item.content}"\n\nCompartilhado via Biblia Diária`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: textToShare,
          url: window.location.href
        });
        showFeedback("Compartilhado!");
      } catch (err) {
        navigator.clipboard.writeText(textToShare);
        showFeedback("Copiado!");
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      showFeedback("Copiado!");
    }
  };

  const handleDelete = async (e: React.MouseEvent, type: ReflectionType, id: string, meta?: any) => {
    e.stopPropagation();
    if (!user || !window.confirm("Deseja excluir permanentemente esta nota de seu diário?")) return;
    
    let success = false;
    if (type === 'verse') success = await deleteVerseReflection(user.id, id);
    else if (type === 'chapter') success = await deleteChapterReflection(user.id, meta.book, meta.chapter);
    else if (type === 'devotional') success = await deleteDevotionalReflection(user.id, id);

    if (success) {
      loadAll();
      showFeedback("Excluído com sucesso.");
    }
  };

  const handleCardClick = (item: any) => {
    if (item.type === 'verse') {
      const parts = item.verse_reference.split('_');
      const book = parts[0];
      const chapter = parseInt(parts[1]);
      const verse = parseInt(parts[2]);
      onReadChapter(book, chapter, verse);
    } else if (item.type === 'chapter') {
      onReadChapter(item.book, item.chapter);
    } else if (item.type === 'devotional') {
      if (item.devotionals) {
        onViewDevotional(item.devotionals);
      }
    }
  };

  const allReflections = [
    ...verseRefs.map(v => ({ ...v, type: 'verse', sortDate: new Date(v.updated_at) })),
    ...chapterRefs.map(c => ({ ...c, type: 'chapter', sortDate: new Date(c.updated_at) })),
    ...devoRefs.map(d => ({ ...d, type: 'devotional', sortDate: new Date(d.updated_at) }))
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  const filtered = allReflections.filter(r => {
    const matchesType = filter === 'all' || r.type === filter;
    const searchLow = searchTerm.toLowerCase();
    const content = r.content || '';
    const verseRef = r.verse_reference || '';
    const book = r.book || '';
    const devoTitle = r.devotionals?.title || '';
    
    const matchesSearch = content.toLowerCase().includes(searchLow) || 
                         verseRef.toLowerCase().includes(searchLow) ||
                         book.toLowerCase().includes(searchLow) ||
                         devoTitle.toLowerCase().includes(searchLow);
    return matchesType && matchesSearch;
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 shadow-xl">
          <Lock size={64} className="text-[#1E40AF] mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">Acesso Restrito</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Faça login para salvar e gerenciar suas anotações pessoais, reflexões bíblicas e pensamentos sobre os devocionais.
          </p>
          <button 
            onClick={onAuthRequired}
            className="bg-[#1E40AF] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Entrar Agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative">
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#1E40AF] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border-2 border-white/20">
            <Check size={18} />
            {feedback}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest mb-1">
            <NotebookPen size={14} /> Memorial de Fé
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight">Minhas Notas</h1>
          <p className="text-gray-500 font-medium italic">"Escreve a visão e torna-a bem legível..." — Habacuque 2:2</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Pesquisar em minhas notas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl py-3 px-10 outline-none focus:ring-4 ring-[#1E40AF]/5 transition-all text-sm"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setFilter('all')} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[#1E40AF] text-white shadow-md' : 'text-gray-400 hover:text-[#1E40AF] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>Tudo</button>
        <button onClick={() => setFilter('verse')} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === 'verse' ? 'bg-[#1E40AF] text-white shadow-md' : 'text-gray-400 hover:text-[#1E40AF] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>Versículos</button>
        <button onClick={() => setFilter('chapter')} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === 'chapter' ? 'bg-[#1E40AF] text-white shadow-md' : 'text-gray-400 hover:text-[#1E40AF] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>Capítulos</button>
        <button onClick={() => setFilter('devotional')} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === 'devotional' ? 'bg-[#1E40AF] text-white shadow-md' : 'text-gray-400 hover:text-[#1E40AF] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>Estudos</button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-[#1E40AF]" size={48} />
          <p className="text-[#1E40AF] italic font-serif text-xl">Folheando seu memorial...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
           <StickyNote size={64} className="mx-auto mb-4 text-gray-100 dark:text-gray-800" />
           <p className="text-gray-400 font-serif italic text-xl">Você ainda não tem anotações nesta categoria.</p>
           <p className="text-gray-300 text-sm mt-2">Comece a ler a Bíblia e anote o que Deus falar com você!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((item, idx) => {
            const isVerse = item.type === 'verse';
            const isChapter = item.type === 'chapter';
            const isDevo = item.type === 'devotional';

            return (
              <div 
                key={idx} 
                onClick={() => handleCardClick(item)}
                className="group bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all text-left relative overflow-hidden cursor-pointer active:scale-[0.99]"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                  {isVerse && <MessageSquareText size={120} />}
                  {isChapter && <BookOpen size={120} />}
                  {isDevo && <StickyNote size={120} />}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isVerse ? 'bg-amber-100 text-amber-600' : isChapter ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {isVerse && <MessageSquareText size={20} />}
                      {isChapter && <BookOpen size={20} />}
                      {isDevo && <StickyNote size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-[#1E40AF] transition-colors">
                        {isVerse && item.verse_reference.replace(/_/g, ' ').replace(/ (\d+)$/, ':$1')}
                        {isChapter && `${item.book} ${item.chapter}`}
                        {isDevo && (item.devotionals?.title || 'Estudo Excluído')}
                      </h3>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        {isVerse ? 'Reflexão de Versículo' : isChapter ? 'Anotação de Capítulo' : 'Nota de Estudo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleShare(e, item)}
                      className="p-2 text-gray-300 hover:text-[#1E40AF] transition-colors bg-gray-50 dark:bg-gray-800 rounded-full"
                      title="Compartilhar reflexão"
                    >
                      <Share2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, item.type as ReflectionType, isVerse ? item.verse_reference : isChapter ? '' : item.devotional_id, { book: item.book, chapter: item.chapter })}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full"
                      title="Excluir nota"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                   <p className="text-xl md:text-2xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap line-clamp-4">
                     "{item.content}"
                   </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">
                     Atualizado em: {new Date(item.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                   </span>
                   
                   <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                     {isVerse ? 'Ver Versículo' : isChapter ? 'Rever Capítulo' : 'Abrir Estudo'} <ChevronRight size={14} />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReflectionsView;
