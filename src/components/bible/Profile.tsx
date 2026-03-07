
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Camera, User as UserIcon, Mail, FileText, Share2, LogOut, CheckCircle2, 
  Loader2, Save, X, Edit3, Heart, NotebookPen, BookOpen, ChevronRight, UserPlus, Bookmark, Trash2
} from 'lucide-react';
import { supabase, getAllFavoriteVerses, deleteFavoriteVerse } from '@/integrations/supabase/bibleDataService';
import { AppView, Devotional } from '@/types/bible';
import ReflectionsView from './Reflections';

interface ProfileViewProps {
  user: User | null;
  onAuthRequired: () => void;
  setView: (view: AppView) => void;
  onReadChapter: (book: string, chapter: number, verse?: number) => void;
  onViewDevotional: (devo: Devotional) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onAuthRequired, setView, onReadChapter, onViewDevotional }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'favorites'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<{full_name: string, bio: string, avatar_url: string}>({
    full_name: '',
    bio: '',
    avatar_url: ''
  });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoadingProfile(true);
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        setProfileData({
          full_name: user.user_metadata?.full_name || '',
          bio: user.user_metadata?.bio || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        });
      }
      setIsLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'favorites' && user) {
        getAllFavoriteVerses(user.id).then(setFavorites);
    }
  }, [activeTab, user]);

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        full_name: profileData.full_name,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString()
      });

    await supabase.auth.updateUser({
      data: { 
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url
      }
    });

    if (!profileError) {
      showFeedbackMsg("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } else {
      showFeedbackMsg("Erro ao atualizar perfil.");
    }
    setIsSaving(false);
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    if (!user) return;
    const success = await deleteFavoriteVerse(user.id, ref);
    if (success) {
        setFavorites(prev => prev.filter(f => f.verse_reference !== ref));
        showFeedbackMsg("Removido dos favoritos.");
    }
  };

  const handleGoToFavorite = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
        onReadChapter(match[1], parseInt(match[2]), parseInt(match[3]));
    }
  };

  const handleInviteFriend = () => {
    const inviteLink = "https://biblia.ecletika.com";
    const inviteText = `Olá! Estou usando o app Biblia Diária para meus estudos e orações. Junte-se a mim: ${inviteLink}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Convite Biblia Diária',
            text: inviteText,
            url: inviteLink
        }).catch(() => {
            navigator.clipboard.writeText(inviteText);
            showFeedbackMsg("Link de convite copiado!");
        });
    } else {
        navigator.clipboard.writeText(inviteText);
        showFeedbackMsg("Link de convite copiado!");
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800">
          <UserIcon size={64} className="mx-auto mb-6 text-[#1E40AF] opacity-20" />
          <h2 className="text-3xl font-serif font-bold mb-4">Acesse seu Perfil</h2>
          <p className="text-gray-500 mb-8">Faça login para ver suas notas, favoritos e personalizar sua conta.</p>
          <button onClick={onAuthRequired} className="bg-[#1E40AF] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">Entrar agora</button>
        </div>
      </div>
    );
  }

  const displayAvatar = profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || user.email || 'U')}&background=1E40AF&color=fff&size=256`;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500 relative">
      
      {feedback && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className="bg-[#1E40AF] text-white px-8 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 border-2 border-white/20">
            <CheckCircle2 size={20} /> {feedback}
          </div>
        </div>
      )}

      <section className="bg-white dark:bg-gray-900 rounded-[3.5rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><UserIcon size={240} /></div>
        
        {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
                <Loader2 className="animate-spin text-[#1E40AF]" size={40} />
                <p className="text-gray-400 font-serif italic">Carregando seus dados...</p>
            </div>
        ) : (
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                <div className="relative group">
                    <div className="w-40 h-40 md:w-52 md:h-52 rounded-[3rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <img src={displayAvatar} className="w-full h-full object-cover" alt="Sua Foto" />
                    </div>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-[#1E40AF]"
                    >
                        <Camera size={24} />
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                            {profileData.full_name || user.email?.split('@')[0]}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                            <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full"><Mail size={12} /> {user.email}</span>
                            <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full"><BookOpen size={12} /> Membro da Rede</span>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-serif italic max-w-xl leading-relaxed">
                        {profileData.bio || "Nenhuma descrição adicionada. Clique no botão de editar para contar um pouco sobre sua caminhada de fé."}
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gray-900 dark:bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Edit3 size={18} /> Editar Perfil
                        </button>
                        <button 
                            onClick={handleInviteFriend}
                            className="bg-[#1E40AF] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <UserPlus size={18} /> Indicar um Amigo
                        </button>
                    </div>
                </div>
            </div>
        )}
      </section>

      {/* ABAS DO PERFIL */}
      <div className="flex items-center gap-2 mb-8 px-4 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setActiveTab('info')}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white shadow-xl text-[#1E40AF]' : 'text-gray-400 hover:text-white'}`}
        >
            Perfil
        </button>
        <button 
            onClick={() => setActiveTab('notes')}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-white shadow-xl text-[#1E40AF]' : 'text-gray-400 hover:text-white'}`}
        >
            Anotações
        </button>
        <button 
            onClick={() => setActiveTab('favorites')}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'favorites' ? 'bg-white shadow-xl text-[#1E40AF]' : 'text-gray-400 hover:text-white'}`}
        >
            Favoritos
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'notes' && (
            <div className="animate-in fade-in duration-300">
                <ReflectionsView 
                    user={user} 
                    onAuthRequired={onAuthRequired} 
                    onReadChapter={onReadChapter} 
                    onViewDevotional={onViewDevotional} 
                />
            </div>
        )}

        {activeTab === 'favorites' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                {favorites.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-50 dark:border-gray-800">
                        <Bookmark size={64} className="mx-auto mb-6 text-gray-100" />
                        <p className="text-gray-400 font-serif italic text-xl">Você ainda não salvou nenhum versículo.</p>
                        <button onClick={() => setView(AppView.BIBLE)} className="mt-6 text-[#1E40AF] font-bold underline">Ir para a Bíblia</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {favorites.map((fav, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleGoToFavorite(fav.verse_reference)}
                                className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all text-left relative overflow-hidden cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500 pointer-events-none group-hover:scale-110 transition-transform"><Bookmark size={120} fill="currentColor" /></div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Bookmark size={20} fill="currentColor" /></div>
                                        <h3 className="font-serif font-bold text-2xl text-[#1E40AF]">{fav.verse_reference}</h3>
                                    </div>
                                    <button onClick={(e) => handleRemoveFavorite(e, fav.verse_reference)} className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full"><Trash2 size={18} /></button>
                                </div>
                                <p className="text-xl md:text-2xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed">"{fav.verse_text.replace(/\\/g, '')}"</p>
                                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-gray-300">Salvo em {new Date(fav.created_at).toLocaleDateString()}</span>
                                    <span className="text-[10px] font-black uppercase text-[#1E40AF] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver na Bíblia <ChevronRight size={12} /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'info' && (
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in duration-300">
                <h3 className="text-xl font-serif font-bold mb-6">Sua Conta</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <Mail className="text-gray-400" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400">E-mail</p>
                            <p className="font-bold">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <CheckCircle2 className="text-green-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400">Status</p>
                            <p className="font-bold">Conta Ativa</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-10 overflow-hidden text-left">
              <button onClick={() => setIsEditing(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors"><X size={28} /></button>
              
              <h3 className="text-3xl font-serif font-bold mb-2">Editar Perfil</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10 border-b border-gray-50 pb-4">Personalize sua identidade cristã</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1E40AF] px-2">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Como deseja ser chamado?"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 outline-none font-bold text-lg dark:text-white focus:ring-4 ring-[#1E40AF]/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1E40AF] px-2">Link da Foto (Avatar)</label>
                  <input 
                    type="url" 
                    value={profileData.avatar_url}
                    onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                    placeholder="Link da imagem (ex: Google Drive, Dropbox...)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 outline-none text-sm dark:text-white focus:ring-4 ring-[#1E40AF]/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1E40AF] px-2">Breve Descrição (Bio)</label>
                  <textarea 
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Ex: Servindo ao Senhor com alegria. Amante da Palavra e da comunhão."
                    className="w-full min-h-[120px] bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-6 outline-none font-serif text-lg italic dark:text-white focus:ring-4 ring-[#1E40AF]/5 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  Salvar Alterações
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
