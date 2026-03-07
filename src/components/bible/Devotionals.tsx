import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Devotional } from '@/types/bible';
import { 
  getDevotionalsList, 
  getDevotionalReflection, 
  saveDevotionalReflection, 
  createDevotional,
  updateDevotional,
  deleteDevotional,
  supabase,
  checkIfUserIsAdmin
} from '@/integrations/supabase/bibleDataService';
import { 
  BookOpen, ArrowLeft, Share2, ChevronRight, ChevronLeft,
  Loader2, Save, CheckCircle2, Search, Plus, X, Send, Book, Trash2, Edit,
  History, Sparkles, Instagram, Facebook, MessageSquare, Check, Download, 
  FileJson, FileText, Image as ImageIcon, AlertCircle, Code,
  Footprints, Heart
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import html2canvas from 'html2canvas';

interface DevotionalsViewProps {
  user: SupabaseUser | null;
  initialDevotional: Devotional | null;
  onAuthRequired: () => void;
}

const DEFAULT_STORY_IMAGES = [
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1490730141103-6ca27a9f0042?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200"
];

const DevotionalsView: React.FC<DevotionalsViewProps> = ({ user, initialDevotional, onAuthRequired }) => {
  const [selectedDevo, setSelectedDevo] = useState<Devotional | null>(initialDevotional);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stories State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Admin Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [adminMode, setAdminMode] = useState<'manual' | 'json'>('manual');
  const [showJsonExample, setShowJsonExample] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  
  const [editingDevoId, setEditingDevoId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formHistoricalContext, setFormHistoricalContext] = useState('');
  const [formDeepReflection, setFormDeepReflection] = useState('');
  const [formPracticalApplication, setFormPracticalApplication] = useState('');
  const [formPrayer, setFormPrayer] = useState('');
  const [isProcessingForm, setIsProcessingForm] = useState(false);

  const storyCardRef = useRef<HTMLDivElement>(null);
  const compositeRef = useRef<HTMLDivElement>(null);

  const filteredDevotionals = useMemo(() => {
    return devotionals.filter(devo => 
      devo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devo.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devo.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [devotionals, searchTerm]);

  const formatText = (text: string | undefined): string => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n').replace(/\\s/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  useEffect(() => {
    loadDevotionals();
    if (user?.email) {
      checkIfUserIsAdmin(user.email).then(setIsAdmin);
    }
  }, [user]);

  const loadDevotionals = async () => {
    setLoading(true);
    const list = await getDevotionalsList();
    setDevotionals(list);
    setLoading(false);
  };

  const splitTextIntoChunks = (text: string, maxLength: number = 450): string[] => {
    const cleanText = formatText(text);
    if (cleanText.length <= maxLength) return [cleanText];
    
    const chunks: string[] = [];
    let remainingText = cleanText;

    while (remainingText.length > 0) {
      if (remainingText.length <= maxLength) {
        chunks.push(remainingText);
        break;
      }

      let splitIndex = remainingText.lastIndexOf('.', maxLength);
      if (splitIndex === -1) splitIndex = remainingText.lastIndexOf(' ', maxLength);
      if (splitIndex === -1) splitIndex = maxLength;

      chunks.push(remainingText.substring(0, splitIndex + 1).trim());
      remainingText = remainingText.substring(splitIndex + 1).trim();
    }
    return chunks;
  };

  const slides = useMemo(() => {
    if (!selectedDevo) return [];
    const s: any[] = [];
    
    s.push({ type: 'cover', title: selectedDevo.title, content: selectedDevo.summary, author: selectedDevo.author });
    
    if (selectedDevo.historicalContext) {
      const historyChunks = splitTextIntoChunks(selectedDevo.historicalContext);
      historyChunks.forEach((chunk, idx) => {
        s.push({ type: 'history', title: historyChunks.length > 1 ? `Contexto (${idx + 1}/${historyChunks.length})` : 'Contexto Histórico', content: chunk });
      });
    }

    const contentChunks = splitTextIntoChunks(selectedDevo.content);
    contentChunks.forEach((chunk, idx) => {
      s.push({ type: 'content', title: contentChunks.length > 1 ? `A Mensagem (${idx + 1}/${contentChunks.length})` : 'A Mensagem', content: chunk });
    });

    if (selectedDevo.deepReflection) {
      const reflectionChunks = splitTextIntoChunks(selectedDevo.deepReflection);
      reflectionChunks.forEach((chunk, idx) => {
        s.push({ type: 'reflection', title: reflectionChunks.length > 1 ? `Revelação (${idx + 1}/${reflectionChunks.length})` : 'Revelação Profunda', content: chunk });
      });
    }

    if (selectedDevo.practicalApplication) {
      const appChunks = splitTextIntoChunks(selectedDevo.practicalApplication);
      appChunks.forEach((chunk, idx) => {
        s.push({ type: 'application', title: appChunks.length > 1 ? `Aplicação (${idx + 1}/${appChunks.length})` : 'Aplicação Prática', content: chunk });
      });
    }

    if (selectedDevo.prayer) {
      const prayerChunks = splitTextIntoChunks(selectedDevo.prayer);
      prayerChunks.forEach((chunk, idx) => {
        s.push({ type: 'prayer', title: prayerChunks.length > 1 ? `Oração (${idx + 1}/${prayerChunks.length})` : 'Momento de Oração', content: chunk });
      });
    }

    s.push({ type: 'response', title: 'Minha Resposta', content: '' });
    return s;
  }, [selectedDevo]);

  const handleNext = () => currentSlide < slides.length - 1 && setCurrentSlide(prev => prev + 1);
  const handlePrev = () => currentSlide > 0 && setCurrentSlide(prev => prev - 1);

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'instagram' | 'download') => {
    if (!selectedDevo || !compositeRef.current) return;
    setIsCapturing(true);
    showFeedback("Gerando imagens...");

    try {
      const storyFiles: File[] = [];
      const cardElements = Array.from(compositeRef.current.children) as HTMLElement[];

      for (let i = 0; i < cardElements.length; i++) {
        const canvas = await html2canvas(cardElements[i], {
          useCORS: true,
          scale: 2,
          backgroundColor: '#000000',
          logging: false
        });

        const imageData = canvas.toDataURL('image/png');
        const blob = await (await fetch(imageData)).blob();
        storyFiles.push(new File([blob], `estudo-tela-${i + 1}.png`, { type: 'image/png' }));
        
        if (platform === 'download') {
           const link = document.createElement('a');
           link.download = `estudo-${selectedDevo.title}-${i+1}.png`;
           link.href = imageData;
           link.click();
        }
      }

      const shareText = `📖 Estudo: "${selectedDevo.title}"\nConfira no Biblia Diária!`;

      if (platform !== 'download') {
        if (navigator.share && navigator.canShare({ files: storyFiles })) {
          await navigator.share({
            files: storyFiles,
            title: selectedDevo.title,
            text: shareText
          });
        } else {
          const shareUrl = "https://biblia.ecletika.com";
          navigator.clipboard.writeText(shareText + ' ' + shareUrl);
          showFeedback("Texto copiado! Use as fotos para postar.");
        }
      } else {
        showFeedback("Imagens salvas!");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
      showFeedback("Erro ao gerar conteúdo.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!selectedDevo) return;
    setIsSaving(true);
    const success = await saveDevotionalReflection(user.id, selectedDevo.id, reflection);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      showFeedback("Reflexão salva!");
    }
    setIsSaving(false);
  };

  const handleBackToList = () => {
    setSelectedDevo(null);
    setCurrentSlide(0);
  };

  const handleAddClick = () => {
    setEditingDevoId(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl('');
    setFormHistoricalContext('');
    setFormDeepReflection('');
    setFormPracticalApplication('');
    setFormPrayer('');
    setAdminMode('manual');
    setShowFormModal(true);
  };

  const handleEditClick = (e: React.MouseEvent, devo: Devotional) => {
    e.stopPropagation();
    setEditingDevoId(devo.id);
    setFormTitle(devo.title);
    setFormSummary(devo.summary);
    setFormContent(devo.content);
    setFormImageUrl(devo.image_url || '');
    setFormHistoricalContext(devo.historicalContext || '');
    setFormDeepReflection(devo.deepReflection || '');
    setFormPracticalApplication(devo.practicalApplication || '');
    setFormPrayer(devo.prayer || '');
    setAdminMode('manual');
    setShowFormModal(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Deseja apagar este estudo permanentemente?")) return;
    try {
      await deleteDevotional(id);
      showFeedback("Estudo removido.");
      loadDevotionals();
    } catch (err) {
      showFeedback("Erro ao deletar.");
    }
  };

  const handleJsonImport = async () => {
    if (!user) return;
    setIsProcessingForm(true);
    try {
      const data = JSON.parse(jsonInput);
      const items = Array.isArray(data) ? data : [data];
      const author = user.user_metadata.full_name || user.email?.split('@')[0] || "Autor";
      const todaySql = new Date().toISOString().split('T')[0];
      
      for (const item of items) {
        const { error } = await supabase.from('devotionals').insert({
          title: item.title,
          summary: item.summary,
          content: item.content,
          historical_context: item.historical_context,
          deep_reflection: item.deep_reflection,
          practical_application: item.practical_application,
          prayer: item.prayer,
          image_url: item.image_url,
          author,
          user_id: user.id,
          bg_color: 'gold',
          date: todaySql
        });
        if (error) throw error;
      }
      
      showFeedback(`${items.length} Importados!`);
      await loadDevotionals();
      setShowFormModal(false);
      setJsonInput('');
    } catch (err) {
      showFeedback("Erro ao processar JSON.");
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminMode === 'json') {
      handleJsonImport();
      return;
    }
    if (!user) return;
    setIsProcessingForm(true);
    try {
      const todaySql = new Date().toISOString().split('T')[0];
      const devoData = {
        title: formTitle,
        summary: formSummary,
        content: formContent,
        image_url: formImageUrl,
        historical_context: formHistoricalContext,
        deep_reflection: formDeepReflection,
        practical_application: formPracticalApplication,
        prayer: formPrayer,
        bg_color: 'gold'
      };

      if (editingDevoId) {
        const { error } = await supabase.from('devotionals').update(devoData).eq('id', editingDevoId);
        if (error) throw error;
        showFeedback("Atualizado!");
      } else {
        const author = user.user_metadata.full_name || user.email?.split('@')[0] || "Autor";
        const { error } = await supabase.from('devotionals').insert({
          ...devoData,
          author,
          user_id: user.id,
          date: todaySql
        });
        if (error) throw error;
        showFeedback("Publicado!");
      }
      await loadDevotionals();
      setShowFormModal(false);
      setEditingDevoId(null);
    } catch (err) {
      showFeedback("Erro ao salvar.");
    } finally {
      setIsProcessingForm(false);
    }
  };

  const currentBgImage = selectedDevo?.image_url || DEFAULT_STORY_IMAGES[currentSlide % DEFAULT_STORY_IMAGES.length];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#1E40AF] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border-2 border-white/20">
            <Check size={18} />
            {feedback}
          </div>
        </div>
      )}

      <div className="fixed -left-[2000px] top-0 opacity-0 pointer-events-none">
        <div ref={compositeRef}>
          {slides.filter(s => s.type !== 'response').map((slide, idx) => (
            <div key={idx} className="relative w-[500px] aspect-[9/16] bg-white text-gray-900 rounded-[2rem] overflow-hidden p-10 flex flex-col justify-center">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-around py-10 z-20 border-r border-gray-100">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 rounded-full shadow-sm -ml-4"></div>
                ))}
              </div>
              <div className="flex-1 pl-6 flex flex-col justify-center relative z-10 text-left">
                <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                  <Sparkles size={14} /> {slide.title}
                </div>
                {slide.type === 'cover' ? (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-serif font-bold leading-tight">{slide.title}</h1>
                    <p className="text-lg text-gray-600 font-serif italic border-l-4 border-[#1E40AF] pl-4">{slide.content}</p>
                    <p className="text-xs font-black uppercase text-gray-400">Escrito por {slide.author}</p>
                  </div>
                ) : (
                  <p className="text-xl text-gray-800 font-serif leading-relaxed whitespace-pre-wrap italic">
                    {slide.content}
                  </p>
                )}
                <div className="mt-10 pt-4 border-t border-gray-50 flex items-center justify-between opacity-50">
                   <span className="text-[8px] font-black uppercase tracking-widest">Biblia Diária</span>
                   <span className="text-[8px] font-black uppercase tracking-widest">{idx + 1} / {slides.length - 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDevo ? (
        <div className="fixed inset-0 z-[200] bg-black animate-in fade-in overflow-hidden flex flex-col items-center justify-center">
          
          <div className="absolute inset-0 transition-all duration-1000">
            <img src={currentBgImage} className="w-full h-full object-cover opacity-60 scale-110 blur-[2px]" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          </div>

          <div className="absolute top-6 left-0 right-0 px-4 flex gap-1.5 z-50">
            {slides.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all duration-300 ${idx < currentSlide ? 'w-full' : idx === currentSlide ? 'w-full animate-pulse' : 'w-0'}`}></div>
              </div>
            ))}
          </div>

          <div ref={storyCardRef} className="relative w-[92%] max-w-lg aspect-[9/16] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transform transition-all duration-500 animate-in zoom-in-95 mt-[-40px]">
             
             <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-around py-10 z-20 pointer-events-none border-r border-gray-100 dark:border-gray-800">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full shadow-sm -ml-4"></div>
                ))}
             </div>

             <div className="flex-1 p-10 pl-14 overflow-y-auto custom-scrollbar relative">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(#000_1px,transparent_1px)] bg-[size:100%_40px]"></div>

                <div className="relative z-10 h-full flex flex-col justify-center text-left">
                   <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-[0.3em] mb-4">
                      <Sparkles size={14} /> {slides[currentSlide].title}
                   </div>

                   {slides[currentSlide].type === 'cover' ? (
                     <div className="space-y-8 animate-in slide-in-from-bottom-4">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                           {slides[currentSlide].title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-serif italic leading-relaxed border-l-4 border-[#1E40AF] pl-6">
                           {slides[currentSlide].content}
                        </p>
                        <div className="pt-10 flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-lg">{slides[currentSlide].author?.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{slides[currentSlide].author}</p>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Autor do Estudo</p>
                           </div>
                        </div>
                     </div>
                   ) : slides[currentSlide].type === 'response' ? (
                      <div className="space-y-6 h-full flex flex-col animate-in slide-in-from-bottom-4">
                         <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Minha Jornada</h2>
                         <textarea 
                           value={reflection} 
                           onChange={(e) => setReflection(e.target.value)} 
                           placeholder="O que o Senhor falou com você hoje?" 
                           className="flex-1 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-6 outline-none font-serif text-xl italic text-gray-800 dark:text-white shadow-inner resize-none" 
                         />
                         <button onClick={handleSaveReflection} disabled={isSaving} className={`w-full py-5 rounded-2xl font-bold shadow-xl transition-all ${saveSuccess ? 'bg-green-500' : 'bg-[#1E40AF]'} text-white flex items-center justify-center gap-3`}>
                            {isSaving ? <Loader2 className="animate-spin" /> : saveSuccess ? <CheckCircle2 /> : <Save />}
                            {saveSuccess ? 'Salvo!' : 'Guardar no Diário'}
                         </button>
                      </div>
                   ) : (
                     <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 font-serif leading-relaxed whitespace-pre-wrap italic first-letter:text-5xl first-letter:font-bold first-letter:text-[#1E40AF] first-letter:mr-2">
                           {formatText(slides[currentSlide].content)}
                        </p>
                     </div>
                   )}
                </div>
             </div>

             <div className="absolute inset-y-0 left-8 right-0 flex z-30 pointer-events-none">
                <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer pointer-events-auto group">
                   <div className="h-full w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/5 to-transparent">
                      <ChevronLeft className="text-gray-400" size={32} />
                   </div>
                </div>
                <div className="w-1/3 h-full"></div>
                <div onClick={handleNext} className="w-1/3 h-full cursor-pointer pointer-events-auto group">
                   <div className="h-full w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-gradient-to-l from-black/5 to-transparent">
                      <ChevronRight className="text-gray-400" size={32} />
                   </div>
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 px-8 flex items-center justify-between z-50 animate-in slide-in-from-bottom-2">
             <button onClick={handleBackToList} className="text-white p-3.5 bg-[#1E40AF] rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                <ArrowLeft size={18} /> Voltar
             </button>
             <div className="flex gap-2">
                <button onClick={() => handleShare('download')} disabled={isCapturing} className="text-white p-3.5 bg-amber-500 rounded-2xl shadow-xl active:scale-95 transition-all"><Download size={20} /></button>
                <button onClick={() => handleShare('whatsapp')} disabled={isCapturing} className="text-white p-3.5 bg-[#25D366] rounded-2xl shadow-xl active:scale-95 transition-all"><MessageSquare size={20} /></button>
                <button onClick={() => handleShare('instagram')} disabled={isCapturing} className="text-white p-3.5 bg-[#E1306C] rounded-2xl shadow-xl active:scale-95 transition-all"><Instagram size={20} /></button>
                <button onClick={() => handleShare('facebook')} disabled={isCapturing} className="text-white p-3.5 bg-[#1877F2] rounded-2xl shadow-xl active:scale-95 transition-all"><Facebook size={20} /></button>
             </div>
          </div>

          <p className="absolute bottom-24 text-white/40 text-[9px] font-black uppercase tracking-[0.4em] z-50">Toque nas laterais para navegar</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest mb-1"><BookOpen size={14} /> Biblioteca de Estudos</div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight">Mergulhe na Palavra</h1>
              <p className="text-gray-500 font-medium">Estudos imersivos para fortalecer seu espírito.</p>
            </div>
            <div className="relative group w-full md:w-96">
              <input type="text" placeholder="Filtrar por tema ou autor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] py-4 px-12 outline-none focus:ring-8 ring-[#1E40AF]/5 transition-all shadow-sm" />
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E40AF]" />
            </div>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin text-[#1E40AF]" size={64} />
              <p className="text-[#1E40AF] italic font-serif text-xl animate-pulse">Buscando alimento espiritual...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDevotionals.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
                   <Book size={64} className="mx-auto mb-4 text-gray-200 dark:text-gray-800" />
                   <p className="text-gray-400 font-serif italic text-xl">Nenhum estudo encontrado.</p>
                </div>
              ) : (
                filteredDevotionals.map((devo) => (
                  <div key={devo.id} onClick={() => setSelectedDevo(devo)} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col text-left relative">
                    <div className="h-48 overflow-hidden relative">
                       <img src={devo.image_url || DEFAULT_STORY_IMAGES[Math.floor(Math.random() * DEFAULT_STORY_IMAGES.length)]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
                       <div className="absolute inset-0 bg-black/20"></div>
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1E40AF] shadow-lg flex items-center gap-2">
                          <History size={12} /> {devo.date}
                       </div>
                       {isAdmin && (
                         <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={(e) => handleEditClick(e, devo)} className="p-2 bg-white text-blue-500 rounded-full shadow-lg hover:scale-110 transition-transform"><Edit size={16} /></button>
                           <button onClick={(e) => handleDeleteClick(e, devo.id)} className="p-2 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                         </div>
                       )}
                    </div>
                    <div className="p-8 space-y-4">
                      <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#1E40AF] transition-colors line-clamp-2">{devo.title}</h3>
                      <p className="text-gray-500 line-clamp-3 italic font-serif leading-relaxed text-sm">{devo.summary}</p>
                      <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-gray-400">{devo.author}</span>
                         <span className="text-[#1E40AF] font-black uppercase text-[10px] tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">Começar <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <button 
          onClick={handleAddClick} 
          className="fixed bottom-24 right-8 md:bottom-12 md:right-12 bg-[#1E40AF] text-white p-6 rounded-[2.5rem] shadow-2xl hover:scale-110 transition-all z-[150] border-4 border-white dark:border-gray-950 group"
        >
          <Plus size={36} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowFormModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-8 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <button onClick={() => setShowFormModal(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full"><X size={24} /></button>
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-6">{editingDevoId ? 'Editar' : 'Nova Revelação'}</h2>
            
            <div className="flex gap-4 mb-10 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
              <button onClick={() => setAdminMode('manual')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${adminMode === 'manual' ? 'bg-white dark:bg-gray-700 shadow-md text-[#1E40AF]' : 'text-gray-400'}`}><FileText size={16} /> Manual</button>
              <button onClick={() => setAdminMode('json')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${adminMode === 'json' ? 'bg-white dark:bg-gray-700 shadow-md text-[#1E40AF]' : 'text-gray-400'}`}><FileJson size={16} /> JSON</button>
            </div>

            {adminMode === 'manual' ? (
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">Título</label>
                    <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-xl outline-none focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">Resumo</label>
                    <input type="text" value={formSummary} onChange={e => setFormSummary(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 outline-none focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><ImageIcon size={12}/> Link Imagem</label>
                  <input type="url" value={formImageUrl} onChange={e => setFormImageUrl(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 outline-none focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><History size={12}/> Contexto</label>
                  <textarea value={formHistoricalContext} onChange={e => setFormHistoricalContext(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] p-6 min-h-[120px] outline-none font-serif text-lg focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><Book size={12}/> Mensagem</label>
                  <textarea value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] p-6 min-h-[200px] outline-none font-serif text-lg focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><Sparkles size={12}/> Revelação</label>
                  <textarea value={formDeepReflection} onChange={e => setFormDeepReflection(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] p-6 min-h-[150px] outline-none font-serif text-lg focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><Footprints size={12}/> Prática</label>
                  <textarea value={formPracticalApplication} onChange={e => setFormPracticalApplication(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] p-6 min-h-[120px] outline-none font-serif text-lg focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest flex items-center gap-2"><Heart size={12}/> Oração</label>
                  <textarea value={formPrayer} onChange={e => setFormPrayer(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] p-6 min-h-[120px] outline-none font-serif text-lg italic focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white" />
                </div>
                
                <button type="submit" disabled={isProcessingForm} className="w-full bg-[#1E40AF] text-white py-6 rounded-2xl font-bold text-xl shadow-2xl flex items-center justify-center gap-4">
                  {isProcessingForm ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />} 
                  Publicar
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-amber-600">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">Importação em massa via JSON.</p>
                   </div>
                   <button onClick={() => setShowJsonExample(!showJsonExample)} className="text-[#1E40AF] text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-[#1E40AF]/5 px-4 py-2 rounded-xl border border-[#1E40AF]/10 hover:bg-[#1E40AF]/10">
                      <Code size={16} /> {showJsonExample ? 'Ocultar' : 'Modelo'}
                   </button>
                </div>

                {showJsonExample && (
                   <div className="bg-gray-900 rounded-3xl p-8 font-mono text-[10px] text-green-400 overflow-x-auto shadow-inner relative">
                      <pre>{`[
  {
    "title": "A Jornada",
    "summary": "Estudo sobre fé.",
    "content": "A fé é...",
    "historical_context": "Base em Hebreus 11.",
    "deep_reflection": "Insights teológicos.",
    "practical_application": "Como viver hoje.",
    "prayer": "Senhor...",
    "image_url": "https://url.jpg"
  }
]`}</pre>
                   </div>
                )}

                <textarea 
                  value={jsonInput} 
                  onChange={e => setJsonInput(e.target.value)} 
                  placeholder='Cole seu JSON aqui...'
                  className="w-full min-h-[400px] bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] p-8 outline-none font-mono text-sm focus:ring-4 ring-[#1E40AF]/5 transition-all dark:text-green-400 shadow-inner"
                />

                <button 
                  onClick={handleJsonImport}
                  disabled={isProcessingForm || !jsonInput.trim()} 
                  className="w-full bg-[#1E40AF] text-white py-6 rounded-2xl font-bold text-xl shadow-2xl flex items-center justify-center gap-4"
                >
                  {isProcessingForm ? <Loader2 className="animate-spin" size={28} /> : <FileJson size={28} />} 
                  Publicar tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevotionalsView;