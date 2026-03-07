
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, BookOpen, PenLine, Save, CheckCircle2, Trash2, Loader2, Lock, X, Bookmark, Quote, Check, Palette, Download, Camera, Send, Copy, MessageSquare } from 'lucide-react';
import { Verse } from '@/types/bible';
import { User } from '@supabase/supabase-js';
import { 
  saveVerseReflection, 
  getVerseReflection, 
  deleteVerseReflection, 
  supabase, 
  getVerseLikes, 
  toggleVerseLike,
  saveFavoriteVerse,
  deleteFavoriteVerse,
  getAllFavoriteVerses
} from '@/integrations/supabase/bibleDataService';
import html2canvas from 'html2canvas';

interface VerseCardProps {
  verse: Verse | null;
  onReadChapter: (book: string, chapter: number) => void;
  user: User | null;
  onAuthRequired: () => void;
  isFullWidth?: boolean;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, onReadChapter, user, onAuthRequired, isFullWidth = true }) => {
  const [liked, setLiked] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showNoteArea, setShowNoteArea] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [hasExistingNote, setHasExistingNote] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showShareFallback, setShowShareFallback] = useState(false);
  const [showCardGenerator, setShowCardGenerator] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const SITE_URL = "https://biblia.ecletika.com";

  useEffect(() => {
    const loadData = async () => {
      if (!verse) return;
      const totalLikes = await getVerseLikes(verse.reference);
      setLikesCount(totalLikes);

      if (user) {
        setLoadingNote(true);
        const [savedContent, allFavs] = await Promise.all([
          getVerseReflection(user.id, verse.reference),
          getAllFavoriteVerses(user.id)
        ]);
        
        if (savedContent) {
          setNoteText(savedContent);
          setHasExistingNote(true);
        } else {
          setNoteText('');
          setHasExistingNote(false);
        }

        // Verifica se o versículo já está nos favoritos para marcar o coração
        const isFav = allFavs.some((f: any) => f.verse_reference === verse.reference);
        setLiked(isFav);
        
        setLoadingNote(false);
      }
    };
    loadData();
  }, [verse, user]);

  if (!verse) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const cleanVerseText = (text: string) => text.replace(/\\/g, '').replace(/\s+/g, ' ').trim();

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setIsPulsing(true);
    const newStatus = !liked;
    setLiked(newStatus);
    
    // Atualiza contador global de likes
    const updatedLikes = await toggleVerseLike(verse.reference, likesCount, newStatus);
    setLikesCount(updatedLikes);

    // Salva ou remove dos favoritos pessoais
    if (newStatus) {
      await saveFavoriteVerse(user.id, verse.reference, cleanVerseText(verse.text));
      showFeedback("Favoritado e curtido!");
    } else {
      await deleteFavoriteVerse(user.id, verse.reference);
      showFeedback("Removido dos favoritos.");
    }
    
    setTimeout(() => setIsPulsing(false), 400);
  };

  const handleShareTextOnly = async () => {
    const textToShare = `"${cleanVerseText(verse.text)}" — ${verse.reference}\n\nLeia mais em: ${SITE_URL}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Versículo do Dia', text: textToShare, url: SITE_URL });
        showFeedback("Compartilhado!");
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setShowShareFallback(true);
        }
      }
    } else {
      setShowShareFallback(true);
    }
  };

  const copyToClipboard = () => {
    const textToShare = `"${cleanVerseText(verse.text)}" — ${verse.reference}\n\nVeja mais em: ${SITE_URL}`;
    navigator.clipboard.writeText(textToShare);
    showFeedback("Copiado com sucesso!");
    setShowShareFallback(false);
  };

  const shareViaWhatsApp = () => {
    const textToShare = encodeURIComponent(`"${cleanVerseText(verse.text)}" — ${verse.reference}\n\nLeia em: ${SITE_URL}`);
    window.open(`https://api.whatsapp.com/send?text=${textToShare}`, '_blank');
    setShowShareFallback(false);
  };

  const shareViaTelegram = () => {
    const textToShare = encodeURIComponent(`"${cleanVerseText(verse.text)}" — ${verse.reference}\n\nLeia em: ${SITE_URL}`);
    window.open(`https://t.me/share/url?url=${SITE_URL}&text=${textToShare}`, '_blank');
    setShowShareFallback(false);
  };

  const generateCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      scale: 3,
      backgroundColor: '#1E40AF'
    });
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
  };

  const downloadCard = async () => {
    setIsGeneratingImage(true);
    try {
      const blob = await generateCardBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `versiculo_${verse.reference.replace(/\s/g, '_')}.png`;
      link.href = url;
      link.click();
      showFeedback("Card salvo!");
    } catch (err) {
      showFeedback("Erro ao baixar.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareCardImage = async () => {
    setIsGeneratingImage(true);
    try {
      const blob = await generateCardBlob();
      if (!blob) return;

      const file = new File([blob], `versiculo.png`, { type: 'image/png' });
      const textToShare = `Que esta palavra abençoe seu dia!\n\nVeja mais em: ${SITE_URL}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Versículo do Dia',
          text: textToShare,
        });
        showFeedback("Enviado!");
        setShowCardGenerator(false);
      } else {
        downloadCard();
        showFeedback("Sistema incompatível. Baixando...");
      }
    } catch (err) {
      showFeedback("Erro ao compartilhar.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 relative ${isFullWidth ? 'w-full' : ''}`}>
      
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300">
          <div className="glass-card text-[#1E40AF] px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border-2 border-[#1E40AF]/20">
            <Check size={18} /> {feedback}
          </div>
        </div>
      )}

      {/* MODAL SHARE FALLBACK */}
      {showShareFallback && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setShowShareFallback(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Compartilhar Palavra</h3>
            <p className="text-xs text-gray-500 mb-8 italic">Como você deseja enviar esta mensagem?</p>
            
            <div className="space-y-3">
              <button 
                onClick={shareViaWhatsApp}
                className="w-full flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl font-bold hover:bg-green-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                WhatsApp
              </button>
              
              <button 
                onClick={shareViaTelegram}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                  <Send size={20} />
                </div>
                Telegram
              </button>

              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-400 text-white rounded-xl flex items-center justify-center">
                  <Copy size={20} />
                </div>
                Copiar Texto e Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERADOR DE CARD */}
      {showCardGenerator && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="relative max-w-lg w-full animate-in zoom-in-95 duration-300">
              <button onClick={() => setShowCardGenerator(false)} className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full"><X size={32} /></button>
              
              <div ref={cardRef} className="aspect-square w-full rounded-[2.5rem] bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] p-10 md:p-14 flex flex-col justify-center items-center text-center shadow-2xl border-8 border-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                 <div className="absolute top-10 left-10 text-white/5"><Quote size={100} /></div>
                 
                 <div className="w-full space-y-8 relative z-10">
                    <p className="text-white text-2xl md:text-3xl font-serif font-bold italic leading-relaxed drop-shadow-2xl px-4">
                      "{cleanVerseText(verse.text)}"
                    </p>
                    <div className="w-20 h-1 bg-white/40 mx-auto rounded-full"></div>
                    <p className="text-white/90 font-bold uppercase tracking-[0.4em] text-sm md:text-base">
                      {verse.reference}
                    </p>
                 </div>

                 <div className="absolute bottom-10 flex flex-col items-center opacity-70">
                    <div className="text-white font-serif font-bold text-xl italic mb-1 drop-shadow-md tracking-tight">Biblia Diária</div>
                    <div className="text-white/90 text-[10px] font-black uppercase tracking-[0.3em]">biblia.ecletika.com</div>
                 </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                 <button 
                  onClick={shareCardImage}
                  disabled={isGeneratingImage}
                  className="bg-white text-[#1E40AF] py-5 rounded-3xl font-bold shadow-xl flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-gray-200"
                 >
                   {isGeneratingImage ? <Loader2 className="animate-spin" size={24} /> : <Send size={28} className="text-blue-500" />}
                   <span className="text-xs uppercase tracking-widest">Enviar Card</span>
                 </button>

                 <button 
                  onClick={downloadCard}
                  disabled={isGeneratingImage}
                  className="bg-white/10 text-white py-5 rounded-3xl font-bold shadow-xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/20"
                 >
                   <Download size={28} />
                   <span className="text-xs uppercase tracking-widest">Baixar Foto</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="p-8 md:p-12 relative text-left">
        <div className="absolute top-4 right-8 opacity-10 pointer-events-none text-gray-400 dark:text-gray-600">
          <span className="font-serif text-8xl">"</span>
        </div>
        
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[#1E40AF] dark:text-blue-400 font-serif text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#1E40AF] dark:bg-blue-400"></span>
            Versículo de Sabedoria
          </h3>
          <button 
            onClick={() => setShowCardGenerator(true)}
            className="flex items-center gap-2 bg-[#1E40AF]/5 text-[#1E40AF] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#1E40AF] hover:text-white transition-all border border-[#1E40AF]/10 shadow-sm"
          >
             <Palette size={14} /> Estilizar Card
          </button>
        </div>
        
        <p className={`text-2xl md:text-4xl font-serif italic leading-relaxed mb-8 transition-all duration-300 text-left ${hasExistingNote ? 'text-[#1E40AF] font-medium' : 'text-gray-900 dark:text-gray-100'}`}>
          {cleanVerseText(verse.text)}
        </p>
        
        <p className="text-xl font-bold text-[#1E40AF] dark:text-blue-400 mb-10 font-serif">
          — {verse.reference}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5 md:gap-8">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
              title={liked ? "Remover dos favoritos" : "Curtir e favoritar"}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} className={`transition-all duration-300 ${isPulsing ? 'animate-pulse-soft scale-125' : 'group-hover:scale-110'}`} />
              <span className="text-sm font-bold">{likesCount}</span>
            </button>
            <button 
              onClick={() => user ? setShowNoteArea(!showNoteArea) : onAuthRequired()}
              className={`flex items-center gap-2 transition-colors active:scale-90 ${showNoteArea || hasExistingNote ? 'text-[#1E40AF]' : 'text-gray-500 dark:text-gray-400 hover:text-[#1E40AF]'} group`}
            >
              {loadingNote ? <Loader2 size={24} className="animate-spin" /> : <PenLine size={24} className="group-hover:scale-110 transition-transform" />}
              <span className="text-sm font-bold hidden sm:inline">Refletir</span>
            </button>
            <button 
              onClick={handleShareTextOnly}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group active:scale-90"
            >
              <Share2 size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold hidden sm:inline">Enviar</span>
            </button>
          </div>

          <button 
            onClick={() => onReadChapter(verse.book, verse.chapter)}
            className="flex items-center gap-2 bg-[#1E40AF] text-white px-8 py-3.5 rounded-full hover:scale-105 transition-all font-bold text-sm shadow-xl"
          >
            <BookOpen size={20} />
            <span className="hidden xs:inline">Mergulhar na Palavra</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseCard;
