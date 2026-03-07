
import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, ChevronRight, Search, Loader2, Sparkles, CheckCircle2, PartyPopper, 
  ArrowLeft, X, Book, Compass, Trophy, Target, Settings, Plus, Edit, Trash2, Save, 
  Layout, ListOrdered, Calendar, Circle, ChevronLeft, Image as ImageIcon, AlertCircle,
  Database, Terminal, ShieldAlert, RefreshCw, BookOpen, ExternalLink, Quote, Hash
} from 'lucide-react';
import { 
  supabase, 
  getPurposesList, 
  getUserActivePurposes, 
  getUserCompletedPurposes,
  startPurpose, 
  advancePurposeDay, 
  completeUserPurpose,
  getPurposeDayContent,
  savePurpose,
  deletePurpose,
  getPurposeAllContent,
  savePurposeContent,
  deletePurposeContent,
  getPurposeUserVerses,
  savePurposeUserVerse,
  deletePurposeUserVerse
} from '@/integrations/supabase/bibleDataService';
import { User } from '@supabase/supabase-js';

interface PurposesViewProps {
  onReadChapter: (book: string, chapter: number, verse?: number) => void;
}

const PurposesView: React.FC<PurposesViewProps> = ({ onReadChapter }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [userPurposes, setUserPurposes] = useState<any[]>([]);
  const [completedPurposes, setCompletedPurposes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'explorar' | 'meus-planos' | 'concluidos' | 'gestao'>('explorar');
  
  const [showReadModal, setShowReadModal] = useState(false);
  const [currentReadingContent, setCurrentReadingContent] = useState<any | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [activeUserPurpose, setActiveUserPurpose] = useState<any | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [checkedVerses, setCheckedVerses] = useState<string[]>([]);
  const [extraVerses, setExtraVerses] = useState<string[]>([]);
  const [newExtraVerse, setNewExtraVerse] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [dayCompletedFeedback, setDayCompletedFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // ADMIN STATES
  const [showPurposeForm, setShowPurposeForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<any | null>(null);
  const [editingContent, setEditingContent] = useState<any | null>(null);
  const [managePurposeId, setManagePurposeId] = useState<string | null>(null);
  const [purposeDaysContent, setPurposeDaysContent] = useState<any[]>([]);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const contentListRef = useRef<HTMLDivElement>(null);

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    setIsAdmin(currentUser?.email === 'mauricio.junior@ecletika.com');
    
    try {
      const { error: pError } = await supabase.from('purposes').select('id').limit(1);
      const { error: cError } = await supabase.from('purpose_contents').select('id').limit(1);
      
      if ((pError && pError.code === '42P01') || (cError && cError.code === '42P01')) {
        setTableMissing(true);
        setLoading(false);
        return;
      }

      const [pList, activeList, completedList] = await Promise.all([
        getPurposesList(),
        currentUser ? getUserActivePurposes(currentUser.id) : Promise.resolve([]),
        currentUser ? getUserCompletedPurposes(currentUser.id) : Promise.resolve([])
      ]);
      
      setPurposes(pList || []);
      setUserPurposes(activeList || []);
      setCompletedPurposes(completedList || []);
      setTableMissing(false);
      
      if (activeList.length > 0 && activeTab === 'explorar') setActiveTab('meus-planos');
    } catch (err) { 
      console.error("Erro ao carregar Planos:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleReadDay = async (up: any, dayToRead: number) => {
    setLoadingReading(true);
    setActiveUserPurpose(up);
    setShowReadModal(true);
    setCheckedVerses([]);
    setExtraVerses([]);
    setNewExtraVerse('');
    setDayCompletedFeedback(false);

    try {
      const content = await getPurposeDayContent(up.purpose_id, dayToRead);
      if (content) {
        let refs = [];
        if (Array.isArray(content.verse_references)) refs = content.verse_references;
        else if (typeof content.verse_references === 'string') {
            refs = content.verse_references.split(',').map((s:string) => s.trim()).filter(Boolean);
        }
        setCurrentReadingContent({ ...content, refs });
        
        if (user) {
          const userExtras = await getPurposeUserVerses(user.id, up.purpose_id, dayToRead);
          setExtraVerses(userExtras);
        }
      } else {
        setCurrentReadingContent(null);
      }
    } catch (err) { console.error(err); } finally { setLoadingReading(false); }
  };

  const handleToggleVerse = (ref: string) => {
    setCheckedVerses(prev => 
      prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]
    );
  };

  const handleAddExtraVerse = async () => {
    if (!user || !activeUserPurpose || !newExtraVerse.trim()) return;
    const ref = newExtraVerse.trim();
    const success = await savePurposeUserVerse(user.id, activeUserPurpose.purpose_id, activeUserPurpose.current_day, ref);
    if (success) {
      setExtraVerses(prev => [...prev, ref]);
      setNewExtraVerse('');
      showFeedbackMsg("Versículo de estudo adicionado!");
    }
  };

  const handleRemoveExtraVerse = async (ref: string) => {
    if (!user || !activeUserPurpose) return;
    const success = await deletePurposeUserVerse(user.id, activeUserPurpose.purpose_id, activeUserPurpose.current_day, ref);
    if (success) {
      setExtraVerses(prev => prev.filter(v => v !== ref));
      setCheckedVerses(prev => prev.filter(v => v !== ref));
    }
  };

  const handleOpenVerse = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
    if (match) {
      const book = match[1];
      const chapter = parseInt(match[2]);
      const verse = match[3] ? parseInt(match[3]) : undefined;
      setShowReadModal(false);
      onReadChapter(book, chapter, verse);
    }
  };

  const handleFinishDay = async () => {
    if (!user || !activeUserPurpose) return;
    setIsUpdating(activeUserPurpose.id);
    const currentDay = activeUserPurpose.current_day;
    const totalDays = activeUserPurpose.purposes?.duration_days || 21;

    try {
      setDayCompletedFeedback(true);
      setTimeout(async () => {
        if (currentDay < totalDays) {
          await advancePurposeDay(user.id, activeUserPurpose.purpose_id, currentDay + 1);
        } else {
          await completeUserPurpose(user.id, activeUserPurpose.purpose_id);
          setActiveTab('concluidos');
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }
        await loadAll();
        setShowReadModal(false);
        setIsUpdating(null);
      }, 2500);
    } catch (err) { console.error(err); setIsUpdating(null); }
  };

  const handleManagePurpose = async (pId: string) => {
    setManagePurposeId(pId);
    setAdminError(null);
    try {
      const content = await getPurposeAllContent(pId);
      setPurposeDaysContent(content);
      setTimeout(() => contentListRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      if (err.code === '42P01') setTableMissing(true);
      else setAdminError("Erro ao carregar cronograma.");
    }
  };

  const handleSavePurposeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdmin(true);
    setAdminError(null);
    const result = await savePurpose(editingPurpose);
    if (result.success) { 
      await loadAll(); 
      setShowPurposeForm(false);
      showFeedbackMsg("Plano salvo!");
    } else {
      if (result.error?.includes('42P01') || result.error?.includes('not found')) setTableMissing(true);
      setAdminError(result.error || "Erro ao salvar plano.");
    }
    setIsSavingAdmin(false);
  };

  const handleSaveContentAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdmin(true);
    setAdminError(null);
    
    try {
      const rawRefs = editingContent.verse_references || '';
      const refsArray = typeof rawRefs === 'string' 
        ? rawRefs.split(',').map((s:string) => s.trim()).filter(Boolean) 
        : (Array.isArray(rawRefs) ? rawRefs : []);

      const result = await savePurposeContent({ 
        ...editingContent, 
        purpose_id: managePurposeId,
        verse_references: refsArray
      });

      if (result.success) {
        await handleManagePurpose(managePurposeId!);
        setShowContentForm(false);
        showFeedbackMsg("Dia publicado com sucesso!");
      } else {
        if (result.error?.includes('42P01') || result.error?.includes('not found')) {
            setTableMissing(true);
        } else {
            setAdminError(result.error || "Erro ao salvar conteúdo diário.");
        }
      }
    } catch (err: any) {
      setAdminError(err.message || "Erro inesperado.");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const isPurposeActive = (pId: string) => userPurposes.some(up => up.purpose_id === pId);

  const totalVersesToRead = (currentReadingContent?.refs?.length || 0) + extraVerses.length;
  const dayProgressPercent = totalVersesToRead > 0 
    ? (checkedVerses.length / totalVersesToRead) * 100 
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto relative bg-black min-h-screen text-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
      
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4">
          <div className="bg-[#1E40AF] text-white px-8 py-3 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Check size={16} /> {feedback}
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md">
           <div className="text-center animate-bounce-subtle">
              <PartyPopper size={120} className="text-[#1E40AF] mx-auto mb-6" />
              <h2 className="text-5xl font-serif font-bold">Jornada Concluída!</h2>
              <p className="text-xl text-gray-400 italic">"Combati o bom combate..."</p>
           </div>
        </div>
      )}

      {/* HEADER DINÂMICO */}
      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover opacity-60" 
          alt="Bible Banner" 
        />
        <div className="absolute bottom-10 left-10 z-20 text-left">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1E40AF] mb-2 block">Minha Caminhada</span>
           <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">Planos de Estudo</h1>
        </div>
      </div>

      <div className="px-6 flex items-center gap-4 overflow-x-auto no-scrollbar py-4 border-b border-white/5">
         {['meus-planos', 'explorar', 'concluidos', 'gestao'].map(tab => (
           (tab !== 'gestao' || isAdmin) && (
             <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl scale-105' : 'text-gray-500 hover:text-white'}`}
             >
               {tab.replace('-', ' ')}
             </button>
           )
         ))}
      </div>

      <div className="px-6 md:px-10 py-10">
        {activeTab === 'meus-planos' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userPurposes.length === 0 ? (
               <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                  <Compass size={64} className="mx-auto mb-4 text-white/10" />
                  <p className="text-gray-500 italic text-xl font-serif">Seus planos ativos aparecerão aqui.</p>
               </div>
            ) : userPurposes.map(up => (
              <div key={up.id} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col gap-6 text-left group hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleReadDay(up, up.current_day)}>
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-[#1E40AF]/20 text-[#1E40AF] rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                      {up.purposes?.icon || '📖'}
                   </div>
                   <div>
                      <h3 className="text-3xl font-serif font-bold">{up.purposes?.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Dia {up.current_day} de {up.purposes?.duration_days}</p>
                   </div>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4">
                   <div className="bg-[#1E40AF] h-full transition-all duration-1000" style={{ width: `${(up.current_day / up.purposes?.duration_days) * 100}%` }}></div>
                </div>
                <button className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest mt-4 group-hover:scale-[1.02] transition-all">Abrir Hoje</button>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'explorar' && (
           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {purposes.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-left hover:border-[#1E40AF]/50 transition-all flex flex-col">
                   <div className="text-7xl mb-8">{p.icon}</div>
                   <h3 className="text-3xl font-serif font-bold mb-4">{p.title}</h3>
                   <p className="text-gray-500 font-serif italic mb-10 flex-1">{p.description}</p>
                   <button 
                    onClick={() => user && startPurpose(user.id, p.id).then(loadAll)}
                    disabled={isPurposeActive(p.id)}
                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${isPurposeActive(p.id) ? 'bg-white/10 text-gray-500' : 'bg-white text-black active:scale-95'}`}
                   >
                     {isPurposeActive(p.id) ? 'Já Inscrito' : 'Começar Plano'}
                   </button>
                </div>
             ))}
           </section>
        )}

        {activeTab === 'concluidos' && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {completedPurposes.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                        <Trophy size={64} className="mx-auto mb-4 text-white/10" />
                        <p className="text-gray-500 italic text-xl font-serif">Planos concluídos aparecerão aqui.</p>
                    </div>
                ) : completedPurposes.map(cp => (
                    <div key={cp.id} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                            <CheckCircle2 size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold">{cp.purposes?.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mt-1">Concluído!</p>
                        </div>
                    </div>
                ))}
            </section>
        )}

        {activeTab === 'gestao' && isAdmin && (
           <div className="space-y-12 animate-in slide-in-from-right-4 text-left">
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-serif font-bold flex items-center gap-3"><Layout size={28} /> Editar Catálogo</h2>
                    <button onClick={() => { setAdminError(null); setEditingPurpose({ icon: '📖', duration_days: 21 }); setShowPurposeForm(true); }} className="bg-[#1E40AF] text-white px-8 py-3 rounded-full font-black text-xs uppercase flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"><Plus size={16} /> Novo Plano</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purposes.map(p => (
                      <div key={p.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 ${managePurposeId === p.id ? 'border-[#1E40AF] bg-[#1E40AF]/5' : 'border-white/5 hover:border-white/20'}`}>
                         <div className="text-4xl w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">{p.icon}</div>
                         <div className="flex-1">
                            <h4 className="font-bold text-lg">{p.title}</h4>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.duration_days} dias</p>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleManagePurpose(p.id)} className="p-3 bg-white/5 text-[#1E40AF] rounded-xl hover:bg-[#1E40AF] hover:text-white transition-all"><ListOrdered size={18} /></button>
                            <button onClick={() => { setAdminError(null); setEditingPurpose(p); setShowPurposeForm(true); }} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white hover:text-black transition-all"><Edit size={18} /></button>
                            <button onClick={() => deletePurpose(p.id).then(loadAll)} className="p-3 bg-white/5 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {managePurposeId && (
                <div ref={contentListRef} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 animate-in slide-in-from-bottom-4">
                   <div className="flex items-center justify-between mb-10">
                      <div>
                         <h2 className="text-3xl font-serif font-bold flex items-center gap-3"><Calendar size={28} /> Cronograma do Plano</h2>
                         <p className="text-gray-500 mt-1 italic">Editando: {purposes.find(p => p.id === managePurposeId)?.title}</p>
                      </div>
                      <button onClick={() => { setAdminError(null); setEditingContent({ day_number: purposeDaysContent.length + 1, verse_references: [] }); setShowContentForm(true); }} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"><Plus size={16} /> Adicionar Dia</button>
                   </div>
                   <div className="space-y-4">
                      {purposeDaysContent.map(day => (
                        <div key={day.id} className="p-6 bg-white/5 rounded-3xl flex items-center gap-6 border border-white/5 group hover:border-amber-500/30 transition-all">
                           <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl">D{day.day_number}</div>
                           <div className="flex-1">
                              <h5 className="font-bold text-xl">{day.title}</h5>
                              <div className="flex flex-wrap gap-2 mt-2">
                                 {Array.isArray(day.verse_references) && day.verse_references.map((r:string, i:number) => (
                                   <span key={i} className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full text-[#1E40AF]">{r}</span>
                                 ))}
                              </div>
                           </div>
                           <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => { setAdminError(null); setEditingContent(day); setShowContentForm(true); }} className="p-2 text-gray-400 hover:text-white"><Edit size={18} /></button>
                              <button onClick={() => deletePurposeContent(day.id).then(() => handleManagePurpose(managePurposeId))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        )}
      </div>

      {/* MODAL DE LEITURA COM CHECKLIST E VERSÍCULOS EXTRAS */}
      {showReadModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-xl">
          {dayCompletedFeedback && (
             <div className="fixed inset-0 z-[250] bg-white flex flex-col items-center justify-center text-black p-10 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={120} className="mb-6 animate-bounce text-green-500" />
                <h2 className="text-5xl font-serif font-bold mb-4">Você está em dia!</h2>
                <p className="text-2xl font-serif italic text-gray-500">Jornada fortalecida pelo Senhor.</p>
             </div>
          )}

          <div className="relative w-full max-w-2xl bg-black md:rounded-[3rem] h-full md:h-[90vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
             <button onClick={() => setShowReadModal(false)} className="absolute top-6 left-6 z-50 text-white flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full font-bold text-[10px] uppercase border border-white/10 hover:bg-black/60 transition-all"><ChevronLeft size={16} /> Voltar</button>

             <div className="relative h-[25%] shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1490730141103-6ca27a9f0042?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Bible" />
                <div className="absolute bottom-6 left-8 z-20 text-left">
                   <h2 className="text-2xl font-bold tracking-tight text-white">{activeUserPurpose?.purposes?.title}</h2>
                   <p className="text-[#1E40AF] text-xs font-black uppercase tracking-[0.3em] mt-1">Dia {activeUserPurpose?.current_day}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-30">
                    <div className="h-full bg-[#1E40AF] transition-all duration-500" style={{ width: `${dayProgressPercent}%` }}></div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar text-left space-y-8 bg-gradient-to-b from-black to-[#0a0a0a]">
                <div className="space-y-1">
                   <h3 className="text-3xl font-serif font-bold text-white">{currentReadingContent?.title || 'Estudo de Hoje'}</h3>
                   <div className="flex items-center gap-2 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                      <ListOrdered size={10} /> Lista de Meditação
                   </div>
                </div>

                {/* VERSÍCULOS DO PLANO */}
                 <div className="space-y-3">
                   {loadingReading ? (
                      <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#1E40AF]" size={32} /></div>
                   ) : (
                    <>
                      {currentReadingContent?.refs?.map((ref: string, idx: number) => {
                        const isChecked = checkedVerses.includes(ref);
                        return (
                            <div 
                                key={`plan-${idx}`} 
                                onClick={() => handleToggleVerse(ref)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isChecked ? 'bg-[#1E40AF]/10 border-[#1E40AF]/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-[#1E40AF] border-[#1E40AF] text-white' : 'border-white/20 text-transparent'}`}>
                                    <Check size={20} strokeWidth={3} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-bold ${isChecked ? 'text-[#1E40AF]' : 'text-white'}`}>{ref}</h4>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenVerse(ref); }} className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center gap-1 mt-0.5"><BookOpen size={10} /> Ver na Bíblia</button>
                                </div>
                            </div>
                        );
                      })}

                      {/* VERSÍCULOS ADICIONADOS PELO USUÁRIO */}
                      {extraVerses.map((ref: string, idx: number) => {
                        const isChecked = checkedVerses.includes(ref);
                        return (
                            <div 
                                key={`extra-${idx}`} 
                                onClick={() => handleToggleVerse(ref)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isChecked ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-blue-500/10 hover:border-blue-500/30'}`}
                            >
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-blue-500/20 text-transparent'}`}>
                                    <Check size={20} strokeWidth={3} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-lg font-bold ${isChecked ? 'text-blue-400' : 'text-blue-200'}`}>{ref}</h4>
                                    <div className="flex items-center gap-3">
                                      <button onClick={(e) => { e.stopPropagation(); handleOpenVerse(ref); }} className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center gap-1 mt-0.5"><BookOpen size={10} /> Ver na Bíblia</button>
                                      <button onClick={(e) => { e.stopPropagation(); handleRemoveExtraVerse(ref); }} className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 mt-0.5">Remover</button>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black uppercase text-blue-500/40">Meu Achado</span>
                            </div>
                        );
                      })}
                    </>
                   )}
                </div>

                {/* CAMPO PARA ADICIONAR VERSÍCULO PESSOAL */}
                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <Hash size={16} className="text-[#1E40AF]" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Versículo Encontrado?</h4>
                   </div>
                   <div className="flex gap-2">
                      <input 
                        value={newExtraVerse}
                        onChange={(e) => setNewExtraVerse(e.target.value)}
                        placeholder="Ex: João 3:16"
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 outline-none text-sm focus:border-[#1E40AF]"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddExtraVerse()}
                      />
                      <button 
                        onClick={handleAddExtraVerse}
                        disabled={!newExtraVerse.trim()}
                        className="bg-white text-black px-4 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all disabled:opacity-50"
                      >
                        Vincular
                      </button>
                   </div>
                </div>

                {currentReadingContent?.content && (
                   <div className="mt-6 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-8 h-8 bg-[#1E40AF]/20 text-[#1E40AF] rounded-xl flex items-center justify-center"><Quote size={16} /></div>
                         <h4 className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Reflexão do Dia</h4>
                      </div>
                      <p className="text-gray-200 font-serif text-xl italic leading-relaxed whitespace-pre-wrap">{currentReadingContent.content}</p>
                   </div>
                )}
             </div>

             <div className="p-8 bg-black border-t border-white/5 shrink-0">
                <button 
                  onClick={handleFinishDay}
                  disabled={checkedVerses.length < totalVersesToRead || isUpdating !== null || totalVersesToRead === 0}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase transition-all shadow-2xl flex items-center justify-center gap-3 ${checkedVerses.length >= totalVersesToRead && totalVersesToRead > 0 ? 'bg-[#1E40AF] text-white' : 'bg-white/10 text-gray-600 cursor-not-allowed'}`}
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Concluir Dia {activeUserPurpose?.current_day}
                </button>
             </div>
          </div>
        </div>
      )}
      
      {/* Restante dos modais de Admin (mesmo código original) */}
      {showContentForm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl text-left border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Conteúdo do Dia</h2>
                <button onClick={() => setShowContentForm(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={28} /></button>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-8 border-b pb-4">Editando Dia {editingContent?.day_number}</p>
              
              {adminError && (
                <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-[2rem] border-2 border-red-100 flex items-start gap-4 shadow-sm">
                   <AlertCircle size={24} className="shrink-0 mt-1" />
                   <div>
                      <p className="font-black uppercase text-[10px] tracking-widest mb-1">Erro Crítico</p>
                      <p className="font-serif italic text-lg">{adminError}</p>
                      <button onClick={() => setTableMissing(true)} className="mt-2 text-xs font-bold underline">Mostrar Script de Reparo</button>
                   </div>
                </div>
              )}

              <form onSubmit={handleSaveContentAdmin} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest">Título da Mensagem</label>
                    <input 
                      value={editingContent?.title || ''} 
                      onChange={e => setEditingContent({...editingContent, title: e.target.value})} 
                      placeholder="Ex: A Promessa do Messias" 
                      className="w-full p-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-xl text-gray-900 dark:text-white focus:ring-4 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] outline-none transition-all shadow-inner" 
                      required 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest">Lista de Versículos (Separe por vírgula)</label>
                    <input 
                      value={Array.isArray(editingContent?.verse_references) ? editingContent.verse_references.join(', ') : (editingContent?.verse_references || '')} 
                      onChange={e => setEditingContent({...editingContent, verse_references: e.target.value})} 
                      placeholder="Ex: João 3:16, Salmos 23:1, Mateus 1:1-10" 
                      className="w-full p-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-serif text-lg text-gray-900 dark:text-white focus:ring-4 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] outline-none transition-all shadow-inner" 
                    />
                    <p className="text-[9px] text-gray-400 px-2 font-medium">Use vírgula para separar cada referência que o usuário deve ler.</p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2 tracking-widest">Reflexão / Devocional</label>
                    <textarea 
                      value={editingContent?.content || ''} 
                      onChange={e => setEditingContent({...editingContent, content: e.target.value})} 
                      placeholder="Escreva aqui o texto que o usuário lerá no dia..." 
                      className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl min-h-[250px] font-serif text-lg leading-relaxed text-gray-900 dark:text-white focus:ring-4 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] outline-none transition-all shadow-inner resize-none" 
                    />
                 </div>

                 <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button type="button" onClick={() => setShowContentForm(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all">Cancelar</button>
                    <button type="submit" disabled={isSavingAdmin} className="flex-1 py-4 bg-[#1E40AF] text-white rounded-2xl font-bold shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                       {isSavingAdmin ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                       {isSavingAdmin ? 'Sincronizando...' : 'Publicar Conteúdo'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showPurposeForm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl text-left border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Configurar Plano</h2>
                <button onClick={() => setShowPurposeForm(false)} className="text-gray-400 hover:text-red-500"><X size={28} /></button>
              </div>
              <form onSubmit={handleSavePurposeAdmin} className="space-y-6">
                 <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2">Ícone</label>
                      <input value={editingPurpose?.icon} onChange={e => setEditingPurpose({...editingPurpose, icon: e.target.value})} placeholder="📖" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-2xl text-center dark:text-white focus:border-[#1E40AF] outline-none" />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2">Título do Plano</label>
                      <input value={editingPurpose?.title} onChange={e => setEditingPurpose({...editingPurpose, title: e.target.value})} placeholder="Nome do plano" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold dark:text-white focus:border-[#1E40AF] outline-none" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2">ID Único (ex: plano-2025)</label>
                    <input value={editingPurpose?.id} disabled={!!editingPurpose?.created_at} onChange={e => setEditingPurpose({...editingPurpose, id: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-mono text-sm dark:text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#1E40AF] px-2">Duração (Dias)</label>
                    <input type="number" value={editingPurpose?.duration_days} onChange={e => setEditingPurpose({...editingPurpose, duration_days: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white" />
                 </div>
                 <button type="submit" disabled={isSavingAdmin} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                    {isSavingAdmin ? <Loader2 className="animate-spin mx-auto" /> : 'Salvar Plano'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PurposesView;
