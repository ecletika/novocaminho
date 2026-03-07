
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartHandshake, ChevronRight, BookOpen, Plus, Settings, Trash2, Edit, Save, X, Loader2,
  ChevronDown, Book, MessageCircle, Heart, Star, Layout, ListOrdered, Sparkles, Database, 
  CloudDownload, Terminal, Quote, FileText, Upload, Globe, Maximize2, CheckCircle2, Maximize, Minimize,
  ExternalLink, ImageIcon, Image as LucideImage, Hash, Lock, Video, PlayCircle, AlertTriangle, Check
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { CouplesTopic, CouplesLesson } from '@/types/bible';
import { 
  getCouplesTopics, getCouplesLessons, saveCouplesTopic, saveCouplesLesson, 
  deleteCouplesTopic, deleteCouplesLesson, uploadBookFile, getCouplesReadLessons, markCouplesLessonRead
} from '@/integrations/supabase/bibleDataService';

interface CouplesStudyViewProps {
  user: User | null;
  onAuthRequired: () => void;
}

const CouplesStudyView: React.FC<CouplesStudyViewProps> = ({ user, onAuthRequired }) => {
  const [topics, setTopics] = useState<CouplesTopic[]>([]);
  const [lessons, setLessons] = useState<Record<string, CouplesLesson[]>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<CouplesLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [columnMissing, setColumnMissing] = useState(false);
  const [progressTableMissing, setProgressTableMissing] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [showPdfReader, setShowPdfReader] = useState(false);

  // Action states
  const [isMarkingProgress, setIsMarkingProgress] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Refs
  const mainContentRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Partial<CouplesTopic> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<CouplesLesson> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*shorts\/|.*embed\/))([^?&/ ]+)/);
    if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const igMatch = url.match(/instagram\.com\/(?:p|reels|tv)\/([^/?#& ]+)/);
    if (igMatch && igMatch[1]) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
    const ttMatch = url.match(/tiktok\.com\/.*video\/(\d+)/);
    if (ttMatch && ttMatch[1]) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
    return url;
  };

  const loadData = async () => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setColumnMissing(false);
    setProgressTableMissing(false);
    
    try {
      // Carregar Tópicos
      const result = await getCouplesTopics();
      if (result === "__TABLE_MISSING__") {
        setTableMissing(true);
        setLoading(false);
        return;
      }

      const t = result as CouplesTopic[];
      const sortedTopics = [...t].sort((a, b) => a.position - b.position);
      setTopics(sortedTopics);

      // Auto-expandir o primeiro tópico se existir
      if (sortedTopics.length > 0) {
        setExpandedTopics(prev => ({ ...prev, [sortedTopics[0].id]: true }));
      }
      
      // Carregar Aulas
      const lessonMap: Record<string, CouplesLesson[]> = {};
      for (const topic of sortedTopics) {
        const lessonData = await getCouplesLessons(topic.id);
        lessonMap[topic.id] = [...lessonData].sort((a, b) => a.position - b.position);
      }
      setLessons(lessonMap);

      // Carregar Progresso do Usuário
      const progress = await getCouplesReadLessons(user.id);
      if (progress === "__TABLE_MISSING__") {
        setProgressTableMissing(true);
      } else {
        setCompletedLessons(progress as string[]);
      }

    } catch (err: any) {
      if (err.message?.includes('video_url')) {
        setColumnMissing(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
      if (user?.email === 'mauricio.junior@ecletika.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    init();
  }, [user]);

  // Efeito para rolar para o topo quando uma aula é selecionada
  useEffect(() => {
    if (selectedLesson && mainContentRef.current) {
      const yOffset = -100; // Offset para não ficar colado na navbar
      const element = mainContentRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [selectedLesson]);

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleProgress = async (lessonId: string) => {
    if (!user) return;
    setIsMarkingProgress(true);
    const result = await markCouplesLessonRead(user.id, lessonId);
    if (result.success) {
      setCompletedLessons(prev => [...prev, lessonId]);
      showFeedbackMsg("Aula concluída! Progresso salvo.");
    } else {
      if (result.code === '42P01') setProgressTableMissing(true);
      else showFeedbackMsg("Erro ao salvar progresso.");
    }
    setIsMarkingProgress(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingTopic?.title) return;
    setIsSaving(true);
    const result = await saveCouplesTopic(editingTopic);
    if (result.success) {
      await loadData();
      setShowTopicModal(false);
      setEditingTopic(null);
    }
    setIsSaving(false);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setFormError(null);
    if (!editingLesson?.title || !editingLesson?.topic_id) {
        setFormError("Título e Módulo são obrigatórios.");
        return;
    }

    setIsSaving(true);
    let imageUrl = editingLesson.image_url;

    if (selectedImage) {
        const uploadedImageUrl = await uploadBookFile(selectedImage);
        if (uploadedImageUrl) imageUrl = uploadedImageUrl;
    }

    const result = await saveCouplesLesson({
        ...editingLesson,
        content: editingLesson.content || '',
        image_url: imageUrl,
        video_url: editingLesson.video_url, 
        position: Number(editingLesson.position || 1)
    });

    if (result.success) {
        await loadData();
        setShowLessonModal(false);
        setEditingLesson(null);
        setSelectedImage(null);
        setImagePreview(null);
    } else {
        if (result.error?.includes('column') && result.error?.includes('video_url')) {
            setColumnMissing(true);
            setShowLessonModal(false);
        } else {
            setFormError(result.error || "Erro ao salvar aula. Verifique o banco.");
        }
    }
    setIsSaving(false);
  };

  const handleDeleteTopic = async (id: string) => {
    if (!isAdmin || !window.confirm("Excluir módulo completo?")) return;
    const success = await deleteCouplesTopic(id);
    if (success) await loadData();
  };

  const handleDeleteLesson = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!isAdmin || !window.confirm("Excluir aula?")) return;
      const success = await deleteCouplesLesson(id);
      if (success) await loadData();
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 border-2 border-[#1E40AF]/20 dark:border-gray-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
            <HeartHandshake size={200} />
          </div>
          <div className="w-20 h-20 bg-[#1E40AF]/10 text-[#1E40AF] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Área Reservada</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed italic font-serif text-lg text-center">
            Este conteúdo é exclusivo para membros. Entre com sua conta para acessar os estudos bíblicos para casais.
          </p>
          <button onClick={onAuthRequired} className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all text-lg">
            Acessar minha conta
          </button>
        </div>
      </div>
    );
  }

  if (progressTableMissing) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] p-10 shadow-xl">
          <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Database size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Tabela de Progresso Ausente</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 text-left leading-relaxed">
            Maurício, para habilitar a marcação de aulas concluídas, execute este comando no **SQL Editor** do Supabase:
          </p>
          <div className="bg-gray-900 text-green-400 p-6 rounded-2xl text-left font-mono text-xs overflow-x-auto shadow-inner relative mb-8">
             <pre>{`CREATE TABLE couples_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES couples_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE couples_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own progress" ON couples_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON couples_progress FOR INSERT WITH CHECK (auth.uid() = user_id);`}</pre>
          </div>
          <button onClick={loadData} className="bg-[#1E40AF] text-white px-12 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
            Já executei o comando, carregar site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh] animate-in fade-in duration-500 pb-20 relative">
      
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4">
          <div className="bg-[#556B2F] text-white px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 border-2 border-white/20">
            <CheckCircle2 size={20} /> {feedback}
          </div>
        </div>
      )}

      <aside className="w-full lg:w-96 shrink-0 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif font-bold text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <HeartHandshake className="text-[#1E40AF]" size={28} /> Módulos
            </h2>
            {isAdmin && (
              <button onClick={() => { setEditingTopic({ position: topics.length + 1 }); setShowTopicModal(true); }} className="p-2.5 bg-[#1E40AF]/10 text-[#1E40AF] rounded-xl hover:bg-[#1E40AF] hover:text-white transition-all">
                <Plus size={20} />
              </button>
            )}
          </div>
          <div className="space-y-4">
            {topics.map(topic => (
              <div key={topic.id} className="space-y-2">
                <div className="flex items-center group">
                  <button onClick={() => toggleTopic(topic.id)} className={`flex-1 flex items-center justify-between p-4 rounded-2xl transition-all text-left ${expandedTopics[topic.id] ? 'bg-[#1E40AF] text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <span className="text-sm font-bold truncate flex items-center gap-3">
                      <span className={`text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black ${expandedTopics[topic.id] ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {topic.position}
                      </span>
                      {topic.title}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                  </button>
                  {isAdmin && (
                    <div className="hidden group-hover:flex items-center gap-1 px-2">
                      <button onClick={() => { setEditingLesson({ topic_id: topic.id, position: (lessons[topic.id]?.length || 0) + 1 }); setShowLessonModal(true); }} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><Plus size={16} /></button>
                      <button onClick={() => { setEditingTopic(topic); setShowTopicModal(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                {expandedTopics[topic.id] && (
                  <div className="pl-8 space-y-2 animate-in slide-in-from-top-2 border-l-2 border-[#1E40AF]/10 ml-6">
                    {(lessons[topic.id] || []).map(lesson => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      return (
                        <div key={lesson.id} className="flex items-center group/lesson">
                          <button onClick={() => { setSelectedLesson(lesson); setShowPdfReader(false); }} className={`flex-1 p-3.5 rounded-xl text-xs text-left transition-all ${selectedLesson?.id === lesson.id ? 'bg-[#1E40AF]/10 text-[#1E40AF] font-black' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                               <BookOpen size={14} className={selectedLesson?.id === lesson.id ? 'text-[#1E40AF]' : 'opacity-30'} />
                               <span className={`truncate flex-1 ${isCompleted ? 'line-through opacity-50' : ''}`}>{lesson.title}</span>
                               <div className="flex items-center gap-1.5">
                                 {lesson.video_url && <PlayCircle size={12} className="text-[#1E40AF]" />}
                                 {isCompleted && <Check size={14} className="text-green-500" />}
                               </div>
                            </div>
                          </button>
                          {isAdmin && (
                            <div className="hidden group-hover/lesson:flex items-center gap-1 px-1">
                                <button onClick={() => { setEditingLesson(lesson); setImagePreview(lesson.image_url || null); setShowLessonModal(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                                <button onClick={(e) => handleDeleteLesson(e, lesson.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main ref={mainContentRef} className="flex-1 scroll-mt-24">
        {selectedLesson ? (
          <article className="bg-white dark:bg-gray-900 rounded-[3rem] p-6 md:p-16 shadow-2xl border border-gray-100 dark:border-gray-800 min-h-full animate-in fade-in slide-in-from-bottom-4 text-left relative overflow-hidden flex flex-col">
             
             {selectedLesson.image_url && !showPdfReader && (
                 <div className="w-full rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
                    <img src={selectedLesson.image_url} alt={selectedLesson.title} className="w-full h-auto block" />
                 </div>
             )}

             <header className="mb-8 md:mb-12 pb-8 md:pb-12 border-b-2 border-[#1E40AF]/10 relative z-10 shrink-0">
               <div className="flex flex-wrap items-center gap-3 mb-6">
                 <span className="bg-[#1E40AF]/10 text-[#1E40AF] px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                   {topics.find(t => t.id === selectedLesson.topic_id)?.title}
                 </span>
                 <span className="bg-gray-50 dark:bg-gray-800 text-gray-400 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    Aula {selectedLesson.position}
                 </span>
                 {completedLessons.includes(selectedLesson.id) && (
                   <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                     <CheckCircle2 size={12} /> Concluída
                   </span>
                 )}
               </div>
               <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 dark:text-white leading-tight break-words">
                 {selectedLesson.title}
               </h1>
             </header>

             <div className="flex-1 relative z-10">
                {selectedLesson.video_url && !showPdfReader && (
                   <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black mb-12 shadow-2xl">
                      <iframe 
                        src={getEmbedUrl(selectedLesson.video_url)!} 
                        className="w-full h-full" 
                        allowFullScreen 
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        title="Vídeo da Aula"
                      ></iframe>
                   </div>
                )}

                <div className="prose prose-stone dark:prose-invert lg:prose-2xl max-w-none mb-16">
                    <div className="font-serif text-xl md:text-2xl leading-[1.8] text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic first-letter:text-5xl first-letter:font-bold first-letter:text-[#1E40AF] first-letter:mr-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                        {selectedLesson.content}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-12 border-t border-gray-50 dark:border-gray-800">
                  {!completedLessons.includes(selectedLesson.id) ? (
                    <button 
                      onClick={() => handleToggleProgress(selectedLesson.id)}
                      disabled={isMarkingProgress}
                      className="w-full sm:w-auto bg-[#556B2F] text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                      {isMarkingProgress ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                      Marcar como Concluída
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-[#556B2F] font-bold py-5 px-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                      <CheckCircle2 size={24} /> Aula Concluída em sua Jornada
                    </div>
                  )}

                  {selectedLesson.pdf_url && (
                    <a href={selectedLesson.pdf_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1E40AF] text-white px-8 py-5 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                      <FileText size={20} /> Baixar PDF
                    </a>
                  )}
                </div>
             </div>
          </article>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 md:p-32 shadow-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#1E40AF]/5 to-transparent opacity-50 pointer-events-none"></div>
             <div className="w-32 h-32 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full flex items-center justify-center mb-12 shadow-inner group">
               <HeartHandshake size={64} className="group-hover:scale-110 transition-transform" />
             </div>
             <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6">Estudo para Casais</h2>
             <p className="text-gray-500 max-lg italic font-serif text-xl md:text-2xl leading-relaxed">
               Selecione uma aula ao lado para começar sua caminhada de fé em casal.
             </p>
          </div>
        )}
      </main>

      {/* MODAL MÓDULO */}
      {showTopicModal && isAdmin && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowTopicModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl">
             <h3 className="text-2xl font-serif font-bold mb-8">Novo Módulo</h3>
             <form onSubmit={handleSaveTopic} className="space-y-6 text-left">
                <input type="text" value={editingTopic?.title || ''} onChange={e => setEditingTopic({...editingTopic, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 outline-none border border-transparent focus:border-[#1E40AF]" placeholder="Título" required />
                <input type="number" value={editingTopic?.position || ''} onChange={e => setEditingTopic({...editingTopic, position: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 outline-none border border-transparent focus:border-[#1E40AF]" placeholder="Ordem" required />
                <button type="submit" disabled={isSaving} className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-bold shadow-xl">
                   {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Salvar'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL LIÇÃO */}
      {showLessonModal && isAdmin && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setShowLessonModal(false); setImagePreview(null); }} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl max-h-[90dvh] overflow-y-auto custom-scrollbar">
                <h3 className="text-2xl font-serif font-bold mb-8">Gerenciar Aula</h3>
                <form onSubmit={handleSaveLesson} className="space-y-6 text-left">
                    {formError && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs"><AlertTriangle size={14} /> {formError}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-2">Título</label>
                            <input type="text" value={editingLesson?.title || ''} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none border border-transparent focus:border-[#1E40AF]" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-2">Ordem</label>
                            <input type="number" value={editingLesson?.position || ''} onChange={e => setEditingLesson({...editingLesson, position: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none border border-transparent focus:border-[#1E40AF]" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-2 flex items-center gap-2">
                           <Video size={12} /> Link do Vídeo (Youtube, Shorts, Reels)
                        </label>
                        <input 
                          type="url" 
                          value={editingLesson?.video_url || ''} 
                          onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})} 
                          className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none border border-transparent focus:border-[#1E40AF]" 
                          placeholder="Ex: https://youtube.com/..." 
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-2 flex items-center gap-2">
                            <ImageIcon size={14} /> Banner (Opcional)
                        </label>
                        <div onClick={() => imageInputRef.current?.click()} className="relative w-full min-h-[120px] bg-gray-50 dark:bg-gray-800 rounded-[1.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white transition-all overflow-hidden">
                            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                            {imagePreview ? (
                                <img src={imagePreview} className="max-h-32 object-contain" alt="Preview" />
                            ) : (
                                <><Upload size={24} className="text-gray-300" /><span className="text-[10px] font-bold text-gray-400 uppercase">Anexar Imagem</span></>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-2">Texto da Aula</label>
                        <textarea value={editingLesson?.content || ''} onChange={e => setEditingLesson({...editingLesson, content: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 min-h-[200px] outline-none font-serif text-lg border border-transparent focus:border-[#1E40AF]" />
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? 'Salvando...' : 'Publicar Aula'}
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default CouplesStudyView;
