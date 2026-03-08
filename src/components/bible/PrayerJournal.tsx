
import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, CheckCircle2, Lock, Loader2, Sparkles, X, PenLine, ShieldCheck, BookOpen, Quote, Edit, Users, Megaphone, HandHeart } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getPrayers, savePrayer, updatePrayer, togglePrayerAnswered, deletePrayer, saveCommunityPost } from '@/integrations/supabase/bibleDataService';
import { PrayerRequest } from '@/types/bible';

interface PrayerJournalProps {
  user: User | null;
  onAuthRequired: () => void;
}

const PrayerJournal: React.FC<PrayerJournalProps> = ({ user, onAuthRequired }) => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrayerId, setEditingPrayerId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shareToSocial, setShareToSocial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('all');

  const fetchPrayers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPrayers(user.id);
      setPrayers(data);
    } catch (err) {
      console.error("Erro ao buscar orações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPrayers();
    else setLoading(false);
  }, [user]);

  const handleOpenNew = () => {
    setTitle('');
    setContent('');
    setShareToSocial(false);
    setEditingPrayerId(null);
    setShowModal(true);
  };

  const handleEditClick = (p: PrayerRequest) => {
    setTitle(p.title);
    setContent(p.content);
    setShareToSocial(false);
    setEditingPrayerId(p.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSaving(true);
    let result;
    if (editingPrayerId) {
      result = await updatePrayer(editingPrayerId, title, content);
    } else {
      result = await savePrayer(user.id, title, content);
      
      if (result.success && shareToSocial) {
          const metadata = user.user_metadata || {};
          const userName = metadata.full_name || user.email?.split('@')[0] || 'Irmão';
          const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1E40AF&color=fff`;
          const socialContent = `🙏 PEDIDO DE ORAÇÃO: ${title}\n\n${content}`;
          await saveCommunityPost(user.id, socialContent, userName, userAvatar, null, 'prayer');
      }
    }

    if (result.success) {
      setTitle('');
      setContent('');
      setEditingPrayerId(null);
      setShowModal(false);
      await fetchPrayers();
    }
    setIsSaving(false);
  };

  const handleToggleAnswered = async (id: string, current: boolean) => {
    const success = await togglePrayerAnswered(id, current);
    if (success) {
      setPrayers(prev => prev.map(p => p.id === id ? { ...p, is_answered: !current } : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja remover este registo permanentemente?")) return;
    const success = await deletePrayer(id);
    if (success) {
      setPrayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'active') return !p.is_answered;
    if (filter === 'answered') return p.is_answered;
    return true;
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 shadow-xl text-left">
          <Lock size={64} className="text-[#1E40AF] mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Caderno de Oração</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-center">
            Tenha um lugar sagrado para suas conversas com Deus. Faça login para gerir seus pedidos e agradecimentos.
          </p>
          <button 
            onClick={onAuthRequired}
            className="bg-[#1E40AF] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full"
          >
            Entrar Agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest mb-1">
            <Heart size={14} /> Intimidade com o Pai
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight">Caderno de Oração</h1>
          <p className="text-gray-500 font-medium italic">"Lançando sobre Ele toda a vossa ansiedade..." — 1 Pedro 5:7</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[#1E40AF] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={22} /> Novo Pedido
        </button>
      </header>

      {/* FILTROS */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'active', label: 'Em Oração' },
          { id: 'answered', label: 'Respondidas' }
        ].map(f => (
          <button 
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-[#1E40AF] text-white' : 'bg-white dark:bg-gray-900 text-gray-400 hover:text-[#1E40AF] border border-gray-100 dark:border-gray-800'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#1E40AF]" size={48} />
          <p className="text-gray-400 font-serif italic">Abrindo seu memorial de orações...</p>
        </div>
      ) : filteredPrayers.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
           {filter === 'answered' ? <Sparkles size={64} className="mx-auto mb-4 text-amber-200" /> : <Heart size={64} className="mx-auto mb-4 text-gray-100 dark:text-gray-800 opacity-30" />}
           <p className="text-gray-400 font-serif italic text-xl">Nenhum registo encontrado.</p>
           <button onClick={handleOpenNew} className="mt-4 text-[#1E40AF] font-bold underline text-sm">Adicionar nova petição</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrayers.map((p) => (
            <div 
              key={p.id} 
              className={`bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border-2 transition-all group relative overflow-hidden flex flex-col h-full ${p.is_answered ? 'border-green-100 dark:border-green-900/30' : 'border-gray-50 dark:border-gray-800 hover:border-[#1E40AF]/20 shadow-sm'}`}
            >
              {p.is_answered && (
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles size={120} className="text-green-500" />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-black uppercase text-[#1E40AF] tracking-widest opacity-60">
                    {p.is_answered ? 'Testemunho / Vitória' : 'Motivo da Oração'}
                  </span>
                  <h3 className={`text-2xl font-serif font-bold leading-tight mt-1 ${p.is_answered ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {p.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleAnswered(p.id, p.is_answered)}
                    className={`p-2.5 rounded-xl transition-all ${p.is_answered ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-green-500'}`}
                    title={p.is_answered ? "Retornar para oração" : "Marcar como Respondida"}
                  >
                    <CheckCircle2 size={22} />
                  </button>
                  <button 
                    onClick={() => handleEditClick(p)}
                    className="p-2.5 text-gray-300 hover:text-[#1E40AF] transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl"
                    title="Editar oração"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2.5 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl"
                    title="Excluir oração"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="text-left py-6 border-y border-gray-50 dark:border-gray-800 mb-6 flex-1">
                <div className="relative">
                  <Quote size={24} className="absolute -top-2 -left-2 text-[#1E40AF]/10" />
                  <p className="text-gray-700 dark:text-gray-300 font-serif italic text-xl leading-relaxed whitespace-pre-wrap pl-4">
                    {p.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.is_answered ? 'bg-green-500 animate-pulse' : 'bg-[#1E40AF]/30'}`}></div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                    {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {p.is_answered && (
                  <div className="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-green-200/50">
                    <Sparkles size={10} /> Graça Alcançada
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE ADIÇÃO / EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-300 text-left overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-100 dark:bg-gray-900 rounded-full"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-[#1E40AF]/10 text-[#1E40AF] rounded-2xl flex items-center justify-center shadow-inner"><PenLine size={32} /></div>
               <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
                    {editingPrayerId ? 'Alterar Pedido' : 'Abrir o Coração'}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sua petição será guardada em seu memorial sagrado</p>
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1E40AF] flex items-center gap-2">
                  <BookOpen size={14} /> Assunto ou Motivo
                </label>
                <input 
                  autoFocus
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ex: Pela restauração da minha saúde, Minha Família..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-6 outline-none font-bold text-xl focus:ring-4 ring-[#1E40AF]/10 transition-all dark:text-white shadow-inner"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1E40AF] flex items-center gap-2">
                  <Heart size={14} /> Detalhes ou Oração
                </label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Senhor, coloco diante de Ti esta causa..."
                  className="w-full min-h-[200px] bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] p-8 outline-none font-serif text-2xl italic focus:ring-4 ring-[#1E40AF]/10 transition-all dark:text-white resize-none shadow-inner"
                  required
                />
              </div>

              {!editingPrayerId && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1E40AF]/10 rounded-xl flex items-center justify-center text-[#1E40AF]"><Users size={20} /></div>
                        <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Compartilhar no Mural?</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black">Outros irmãos poderão orar por si</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={shareToSocial} onChange={e => setShareToSocial(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E40AF]"></div>
                    </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#1E40AF] text-white py-6 rounded-2xl font-bold text-xl shadow-2xl flex items-center justify-center gap-4 hover:opacity-90 active:scale-95 transition-all border border-white/10"
              >
                {isSaving ? <Loader2 className="animate-spin" size={28} /> : <ShieldCheck size={28} />}
                {isSaving ? 'Sincronizando...' : editingPrayerId ? 'Atualizar Petição' : 'Entregar ao Senhor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerJournal;
