
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Send, Plus, Lock, Loader2, Trash2, Check, HandHeart, Quote, Bookmark, Sparkles, Filter, Users, Church, Megaphone, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getCommunityPosts, saveCommunityPost, togglePostLike, uploadCommunityImage, deleteCommunityPost, incrementIntercession, getCommunityComments, saveCommunityComment } from '@/integrations/supabase/bibleDataService';

interface CommunityViewProps {
  user: User | null;
  onAuthRequired: () => void;
}

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  intercessions: number;
  post_type: 'testimonial' | 'prayer' | 'verse';
  metadata?: any;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

const POST_TYPES = [
  { id: 'all', label: 'Tudo', icon: Users },
  { id: 'testimonial', label: 'Testemunhos', icon: Megaphone },
  { id: 'prayer', label: 'Pedidos de Oração', icon: HandHeart },
  { id: 'verse', label: 'Revelação / Bíblia', icon: Quote }
];

const CommunityView: React.FC<CommunityViewProps> = ({ user, onAuthRequired }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'testimonial' | 'prayer' | 'verse'>('testimonial');
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // States para comentários
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      if (data as any !== "__TABLE_MISSING__") setPosts(data as Post[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePost = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!newPost.trim()) return;
    setIsPublishing(true);
    try {
      const metadata = user.user_metadata || {};
      const userName = metadata.full_name || user.email?.split('@')[0] || 'Irmão';
      const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1E40AF&color=fff`;
      
      const result: any = await saveCommunityPost(user.id, newPost, userName, userAvatar, null, postType);
      if (result.success) {
        setNewPost('');
        await fetchPosts();
        showFeedbackMsg(postType === 'prayer' ? "Pedido de oração enviado ao Mural!" : "Publicado com sucesso!");
      }
    } catch (err) { console.error(err); } finally { setIsPublishing(false); }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    if (!user) { onAuthRequired(); return; }
    
    // Otimista: atualiza UI antes do banco
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    
    const success = await togglePostLike(postId, currentLikes);
    if (!success) {
        // Se falhar, reverte
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
        showFeedbackMsg("Erro ao curtir.");
    } else {
        showFeedbackMsg("Amém!");
    }
  };

  const handleIntercede = async (postId: string) => {
    if (!user) { onAuthRequired(); return; }
    const newCount = await incrementIntercession(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, intercessions: newCount } : p));
    showFeedbackMsg("Amém! Você está intercedendo por este motivo.");
  };

  const toggleComments = async (postId: string) => {
    const isNowExpanded = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: isNowExpanded }));
    
    if (isNowExpanded && !commentsByPost[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const data = await getCommunityComments(postId);
      setCommentsByPost(prev => ({ ...prev, [postId]: data as Comment[] }));
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) { onAuthRequired(); return; }
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const metadata = user.user_metadata || {};
    const userName = metadata.full_name || user.email?.split('@')[0] || 'Irmão';
    const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1E40AF&color=fff`;

    const success = await saveCommunityComment(postId, user.id, userName, userAvatar, text);
    if (success) {
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      const updatedComments = await getCommunityComments(postId);
      setCommentsByPost(prev => ({ ...prev, [postId]: updatedComments as Comment[] }));
      showFeedbackMsg("Comentário postado!");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filteredPosts = posts.filter(p => activeTab === 'all' || p.post_type === activeTab);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20 relative text-left">
      
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className="glass-card text-[#1E40AF] px-8 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 border-2 border-[#1E40AF]/20">
            <Sparkles size={20} className="text-amber-500" /> {feedback}
          </div>
        </div>
      )}

      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 bg-[#1E40AF]/10 px-4 py-2 rounded-full text-[#1E40AF] text-xs font-black uppercase tracking-widest border border-[#1E40AF]/20">
           <Users size={14} /> Corpo de Cristo
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight">Comunhão Diária</h1>
        <p className="text-gray-500 text-lg md:text-xl font-serif italic max-w-2xl mx-auto">
          "Levai as cargas uns dos outros e, assim, cumprieis a lei de Cristo." — Gálatas 6:2
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-[#1E40AF] pointer-events-none rotate-12"><Megaphone size={120} /></div>
        
        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                <button onClick={() => setPostType('testimonial')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${postType === 'testimonial' ? 'bg-[#1E40AF] text-white shadow-lg' : 'text-gray-400'}`}><Megaphone size={14} /> Testemunho</button>
                <button onClick={() => setPostType('prayer')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${postType === 'prayer' ? 'bg-[#1E40AF] text-white shadow-lg' : 'text-gray-400'}`}><HandHeart size={14} /> Oração</button>
                <button onClick={() => setPostType('verse')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${postType === 'verse' ? 'bg-[#1E40AF] text-white shadow-lg' : 'text-gray-400'}`}><Quote size={14} /> Revelação</button>
             </div>
          </div>

          <textarea 
            placeholder={postType === 'prayer' ? "Escreva seu pedido de oração..." : postType === 'testimonial' ? "O que Deus fez na sua vida?" : "Qual palavra Ele ministrou ao seu coração?"}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full min-h-[160px] p-8 bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] outline-none focus:ring-4 ring-[#1E40AF]/5 text-2xl font-serif italic dark:text-white shadow-inner"
          />

          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Users size={14} /> Público para toda a rede
            </div>
            <button 
              onClick={handlePost}
              disabled={isPublishing || !newPost.trim()}
              className="bg-[#1E40AF] text-white px-12 py-5 rounded-3xl font-black uppercase text-sm shadow-[0_15px_40px_rgba(30,64,175,0.4)] flex items-center gap-3 active:scale-95 transition-all"
            >
              {isPublishing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} 
              Publicar Agora
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        {POST_TYPES.map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-3 ${activeTab === tab.id ? 'bg-[#1E40AF] text-white border-transparent shadow-xl' : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-[#1E40AF]/40'}`}
           >
             <tab.icon size={16} /> {tab.label}
           </button>
        ))}
      </div>

      <div className="space-y-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-6"><Loader2 className="animate-spin text-[#1E40AF]" size={64} /><p className="italic text-gray-400 font-serif text-xl">Sintonizando o Corpo de Cristo...</p></div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
             <Filter size={64} className="mx-auto mb-6 text-gray-200" />
             <p className="text-gray-400 font-serif italic text-2xl">Ainda não há publicações nesta categoria.</p>
          </div>
        ) : filteredPosts.map((post) => {
          const isPrayer = post.post_type === 'prayer';
          const isVerse = post.post_type === 'verse';
          // Fix: Renamed undefined variable expandedTopics to expandedComments to resolve runtime error
          const isExpanded = expandedComments[post.id];
          const postComments = commentsByPost[post.id] || [];
          const isLoading = loadingComments[post.id];
          
          return (
            <div key={post.id} className={`bg-white dark:bg-gray-900 rounded-[3.5rem] p-10 md:p-14 shadow-xl border-2 transition-all hover:shadow-2xl animate-in slide-in-from-bottom-8 ${isPrayer ? 'border-[#1E40AF]/10' : isVerse ? 'border-blue-100' : 'border-gray-50 dark:border-gray-800'}`}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5 text-left">
                  <img src={post.user_avatar} className="w-16 h-16 rounded-[1.5rem] border-2 border-[#1E40AF]/10 shadow-sm" alt={post.user_name} />
                  <div>
                    <div className="flex items-center gap-3">
                       <h3 className="font-serif font-bold text-2xl text-gray-900 dark:text-gray-100">{post.user_name}</h3>
                       {isPrayer && <span className="bg-[#1E40AF] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><HandHeart size={10} /> Pedido de Oração</span>}
                       {isVerse && <span className="bg-[#1E40AF] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Quote size={10} /> Revelação</span>}
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(post.created_at)}</span>
                  </div>
                </div>
                {user?.id === post.user_id && (
                   <button onClick={() => deleteCommunityPost(post.id).then(fetchPosts)} className="p-3 text-gray-300 hover:text-red-500 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all"><Trash2 size={20} /></button>
                )}
              </div>
              
              <div className="relative mb-10">
                {isVerse && <Quote size={64} className="absolute -top-6 -left-6 text-[#1E40AF]/10 pointer-events-none" />}
                <p className={`text-2xl md:text-3xl font-serif italic leading-relaxed text-gray-800 dark:text-gray-200 text-left ${isVerse ? 'text-[#1E40AF]' : ''}`}>
                  "{post.content}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => handleLike(post.id, post.likes)}
                    className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-all group"
                  >
                    <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-red-50 transition-all ${post.likes > 0 ? 'text-red-500 bg-red-50' : ''}`}>
                      <Heart size={24} fill={post.likes > 0 ? "currentColor" : "none"} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">{post.likes || 0} Amém</span>
                  </button>

                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-3 text-gray-400 hover:text-[#1E40AF] transition-all group ${isExpanded ? 'text-[#1E40AF]' : ''}`}
                  >
                    <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-[#1E40AF]/10 transition-all ${isExpanded ? 'bg-[#1E40AF]/10 text-[#1E40AF]' : ''}`}>
                      <MessageCircle size={24} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Comentários</span>
                  </button>
                </div>

                {isPrayer && (
                  <button 
                    onClick={() => handleIntercede(post.id)}
                    className="flex items-center gap-3 bg-[#1E40AF] text-white px-8 py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <HandHeart size={20} /> Orar por isso ({post.intercessions || 0})
                  </button>
                )}
              </div>

              {/* SEÇÃO DE COMENTÁRIOS EXPANDIDA */}
              {isExpanded && (
                <div className="mt-10 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-4">
                   <div className="flex items-center gap-4 mb-6">
                      <input 
                        type="text" 
                        value={newCommentText[post.id] || ''}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Escreva uma palavra de benção..."
                        className="flex-1 bg-white dark:bg-gray-900 border-none rounded-2xl px-6 py-4 outline-none font-serif italic text-gray-800 dark:text-white shadow-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newCommentText[post.id]?.trim()}
                        className="bg-[#1E40AF] text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-all"
                      >
                        <Send size={20} />
                      </button>
                   </div>

                   {isLoading ? (
                     <div className="flex items-center justify-center py-6 text-gray-400 gap-2 font-serif italic">
                       <Loader2 size={16} className="animate-spin" /> Carregando conversas...
                     </div>
                   ) : postComments.length === 0 ? (
                     <p className="text-center text-gray-400 font-serif italic py-6">Ninguém comentou ainda. Seja o primeiro!</p>
                   ) : (
                     <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                        {postComments.map(comment => (
                          <div key={comment.id} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800">
                             <img src={comment.user_avatar} className="w-10 h-10 rounded-xl" alt={comment.user_name} />
                             <div className="flex-1 text-left">
                                <div className="flex items-center justify-between mb-1">
                                   <h4 className="font-bold text-sm text-[#1E40AF]">{comment.user_name}</h4>
                                   <span className="text-[9px] text-gray-300 font-bold">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-serif">{comment.content}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityView;
