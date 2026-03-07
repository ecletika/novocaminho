
import React, { useState, useEffect } from 'react';
import {
    HeartHandshake, ChevronRight, BookOpen, ChevronDown, CheckCircle2,
    Loader2, PlayCircle, FileText, Video as VideoIcon, Plus, Edit, Trash2, Save, X, Lock, ArrowRight
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    getCasadosOnlineTopics,
    getCasadosOnlineLessons,
    getCasadosOnlineProgress,
    markCasadosLessonRead,
    saveCasadosTopic,
    saveCasadosLesson,
    deleteCasadosTopic,
    deleteCasadosLesson,
    uploadCasadosFile,
    saveCompromissoCasal
} from '@/integrations/supabase/casadosService';
import { Button } from '@/components/ui/button';

export default function CasadosOnlineMaterial() {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [topics, setTopics] = useState<any[]>([]);
    const [lessons, setLessons] = useState<Record<string, any[]>>({});
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    // Admin state
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<any>(null);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form Compromisso state
    const [compromissoForm, setCompromissoForm] = useState({
        nome_marido: '',
        assinatura_marido: '',
        nome_esposa: '',
        assinatura_esposa: '',
        data_compromisso: ''
    });
    const [isSubmittingCompromisso, setIsSubmittingCompromisso] = useState(false);
    const [hasSubmittedCompromisso, setHasSubmittedCompromisso] = useState(false);

    // Permitir edição apenas se explicitamente for admin e não estiver carregando auth
    const canEdit = !authLoading && user && isAdmin;

    const loadData = async () => {
        setLoading(true);
        try {
            const t = await getCasadosOnlineTopics();
            setTopics(t);

            if (t.length > 0 && Object.keys(expandedTopics).length === 0) {
                setExpandedTopics({ [t[0].id]: true });
            }

            const lessonMap: Record<string, any[]> = {};
            for (const topic of t) {
                const lessonData = await getCasadosOnlineLessons(topic.id);
                lessonMap[topic.id] = lessonData;
            }
            setLessons(lessonMap);

            if (user) {
                const progress = await getCasadosOnlineProgress(user.id);
                setCompletedLessons(progress);
            }
        } catch (err) {
            console.error("Erro ao carregar material:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleToggleProgress = async (lessonId: string) => {
        if (!user) {
            toast.error("É necessário estar logado para salvar seu progresso.");
            return;
        }
        const success = await markCasadosLessonRead(user.id, lessonId);
        if (success) {
            setCompletedLessons(prev => [...prev, lessonId]);
            toast.success("Aula concluída!");
        }
    };

    const toggleTopic = (id: string) => {
        setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSaveTopic = async (topic: any) => {
        setIsSaving(true);
        const { success } = await saveCasadosTopic(topic);
        if (success) {
            toast.success("Módulo salvo!");
            setIsTopicModalOpen(false);
            loadData();
        }
        setIsSaving(false);
    };

    const handleSaveLesson = async (lesson: any) => {
        if (!canEdit) return;
        setIsSaving(true);
        const { success } = await saveCasadosLesson(lesson);
        if (success) {
            toast.success("Aula salva!");
            setIsLessonModalOpen(false);
            loadData();
        }
        setIsSaving(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const { publicUrl, error } = await uploadCasadosFile(file);

        if (publicUrl) {
            setEditingLesson((prev: any) => ({
                ...prev,
                [type === 'pdf' ? 'pdf_url' : 'image_url']: publicUrl
            }));
            toast.success(`${type.toUpperCase()} enviado com sucesso!`);
        } else {
            console.error("Upload error details:", error);
            const message = error?.message || "Erro desconhecido";
            toast.error(`Erro ao enviar arquivo: ${message}`);
            if (message.includes("bucket not found")) {
                toast.info("O balde 'casados-material' não foi encontrado. Execute as novas migrações SQL.");
            }
        }
        setIsUploading(false);
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm("Deseja realmente excluir este módulo e todas as suas aulas?")) {
            const success = await deleteCasadosTopic(id);
            if (success) {
                toast.success("Módulo excluído");
                loadData();
            }
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (window.confirm("Excluir aula?")) {
            const success = await deleteCasadosLesson(id);
            if (success) {
                toast.success("Aula excluída");
                loadData();
            }
        }
    };

    const getNextLesson = () => {
        if (!selectedLesson) return null;
        const currentTopicLessons = lessons[selectedLesson.topic_id] || [];
        const currentIndex = currentTopicLessons.findIndex(l => l.id === selectedLesson.id);
        if (currentIndex !== -1 && currentIndex < currentTopicLessons.length - 1) {
            return currentTopicLessons[currentIndex + 1];
        }
        const currentTopicIndex = topics.findIndex(t => t.id === selectedLesson.topic_id);
        if (currentTopicIndex !== -1 && currentTopicIndex < topics.length - 1) {
            for (let i = currentTopicIndex + 1; i < topics.length; i++) {
                const nextTopic = topics[i];
                const nextTopicLessons = lessons[nextTopic.id] || [];
                if (nextTopicLessons.length > 0) {
                    return nextTopicLessons[0];
                }
            }
        }
        return null;
    };

    const handleCompromissoSubmit = async () => {
        if (!user) {
            toast.error("Você precisa estar logado");
            return;
        }

        const { nome_marido, assinatura_marido, nome_esposa, assinatura_esposa, data_compromisso } = compromissoForm;
        if (!nome_marido || !assinatura_marido || !nome_esposa || !assinatura_esposa || !data_compromisso) {
            toast.error("Por favor, preencha todos os campos obrigatórios");
            return;
        }

        setIsSubmittingCompromisso(true);
        try {
            const { success, error } = await saveCompromissoCasal({
                ...compromissoForm,
                user_id: user.id
            });
            if (success) {
                toast.success("Compromisso firmado com sucesso! Que Deus abençoe vossa jornada.");
                setHasSubmittedCompromisso(true);
            } else {
                toast.error("Erro ao salvar compromisso");
            }
        } catch (err) {
            toast.error("Erro de conexão");
        }
        setIsSubmittingCompromisso(false);
    };

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-secondary" size={32} />
                <p className="text-foreground font-serif italic">Carregando Material Online...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-muted/10 rounded-3xl p-16 border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h3>
                <p className="text-foreground/70 max-w-xs italic font-serif mb-6">
                    Você precisa estar logado para acessar o Material Online do Casados Para Sempre.
                </p>
                <Button asChild>
                    <a href="/login">Fazer Login</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-left max-w-full overflow-visible">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 space-y-4">
                <div className="bg-muted/30 rounded-2xl p-6 border border-border sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                            <BookOpen size={20} className="text-secondary" /> Módulos
                        </h3>
                        {canEdit && (
                            <Button size="icon" variant="ghost" onClick={() => { setEditingTopic({ position: topics.length + 1 }); setIsTopicModalOpen(true); }}>
                                <Plus size={18} />
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {topics.map(topic => (
                            <div key={topic.id} className="space-y-2">
                                <div className="flex items-center group">
                                    <button
                                        onClick={() => toggleTopic(topic.id)}
                                        className={`flex-1 flex items-center justify-between p-4 rounded-xl transition-all text-left ${expandedTopics[topic.id] ? 'bg-secondary text-primary font-bold' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <span className="text-sm flex items-center gap-3">
                                            <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ${expandedTopics[topic.id] ? 'bg-primary/20' : 'bg-muted'}`}>
                                                {topic.position}
                                            </span>
                                            <span className="flex-1 break-words">{topic.title}</span>
                                        </span>
                                        <ChevronDown size={14} className={`transition-transform ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                                    </button>

                                    {canEdit && (
                                        <div className="hidden group-hover:flex items-center gap-1 pl-2">
                                            <button onClick={() => { setEditingLesson({ topic_id: topic.id, position: (lessons[topic.id]?.length || 0) + 1 }); setIsLessonModalOpen(true); }} className="p-1.5 text-green-500 hover:bg-green-100 rounded-lg"><Plus size={14} /></button>
                                            <button onClick={() => { setEditingTopic(topic); setIsTopicModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                </div>

                                {expandedTopics[topic.id] && (
                                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 border-l-2 border-secondary/20 ml-6">
                                        {(lessons[topic.id] || []).map(lesson => {
                                            const isCompleted = completedLessons.includes(lesson.id);
                                            return (
                                                <div key={lesson.id} className="flex items-center group/lesson">
                                                    <button
                                                        onClick={() => setSelectedLesson(lesson)}
                                                        className={`flex-1 p-3 rounded-lg text-xs text-left transition-all flex items-center gap-3 ${selectedLesson?.id === lesson.id ? 'text-secondary font-bold bg-secondary/10' : 'text-foreground/70 hover:bg-muted/50'}`}
                                                    >
                                                        <BookOpen size={14} className={selectedLesson?.id === lesson.id ? 'text-secondary' : 'opacity-30'} />
                                                        <span className={`flex-1 break-words ${isCompleted ? 'line-through opacity-50' : ''}`}>{lesson.title}</span>
                                                        {lesson.video_url && <PlayCircle size={12} className="text-secondary" />}
                                                        {isCompleted && <CheckCircle2 size={12} className="text-green-500" />}
                                                    </button>
                                                    {canEdit && (
                                                        <div className="hidden group-hover/lesson:flex items-center gap-1 pl-1">
                                                            <button onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }} className="p-1 text-blue-500 hover:bg-blue-100 rounded"><Edit size={12} /></button>
                                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 size={12} /></button>
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

            {/* Content Area */}
            <main className="flex-1">
                {selectedLesson ? (
                    <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-soft animate-in fade-in slide-in-from-bottom-4">
                        <header className="mb-8 pb-8 border-b border-border" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    {topics.find(t => t.id === selectedLesson.topic_id)?.title}
                                </span>
                                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    Aula {selectedLesson.position}
                                </span>
                                {completedLessons.includes(selectedLesson.id) && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Concluída
                                    </span>
                                )}
                            </div>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
                                {selectedLesson.title}
                            </h2>
                        </header>

                        {selectedLesson.image_url && (
                            <div className="w-full rounded-2xl overflow-hidden mb-8 shadow-md">
                                <img src={selectedLesson.image_url} alt={selectedLesson.title} className="w-full h-auto" />
                            </div>
                        )}

                        {selectedLesson.video_url && (
                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black mb-8 shadow-lg">
                                <iframe
                                    src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Vídeo da Aula"
                                ></iframe>
                            </div>
                        )}

                        <div className="prose prose-stone dark:prose-invert max-w-none text-left mb-12">
                            <div className="font-serif text-xl leading-relaxed text-foreground whitespace-pre-wrap first-letter:text-5xl first-letter:font-bold first-letter:text-secondary first-letter:mr-2">
                                {selectedLesson.content}
                            </div>
                        </div>

                        {selectedLesson.title === "Compromisso" && (
                            <div className="bg-secondary/5 border-2 border-secondary/20 rounded-3xl p-8 mb-12 shadow-inner text-left">
                                <h3 className="font-display text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                                    <HeartHandshake className="w-6 h-6" /> Aliança de Compromisso
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Nome do Marido <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl border-2 border-border bg-background focus:border-secondary transition-all"
                                            value={compromissoForm.nome_marido}
                                            onChange={e => setCompromissoForm({ ...compromissoForm, nome_marido: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Nome da Esposa <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl border-2 border-border bg-background focus:border-secondary transition-all"
                                            value={compromissoForm.nome_esposa}
                                            onChange={e => setCompromissoForm({ ...compromissoForm, nome_esposa: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Assinatura do Marido <span className="text-red-500">*</span></label>
                                        <SignaturePad
                                            onSave={(data) => setCompromissoForm({ ...compromissoForm, assinatura_marido: data })}
                                            onClear={() => setCompromissoForm({ ...compromissoForm, assinatura_marido: '' })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-foreground">Assinatura da Esposa <span className="text-red-500">*</span></label>
                                        <SignaturePad
                                            onSave={(data) => setCompromissoForm({ ...compromissoForm, assinatura_esposa: data })}
                                            onClear={() => setCompromissoForm({ ...compromissoForm, assinatura_esposa: '' })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 mb-8 max-w-xs">
                                    <label className="text-sm font-bold text-foreground">Data do Compromisso <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        className="w-full p-4 rounded-xl border-2 border-border bg-background focus:border-secondary transition-all"
                                        value={compromissoForm.data_compromisso}
                                        onChange={e => setCompromissoForm({ ...compromissoForm, data_compromisso: e.target.value })}
                                    />
                                </div>
                                <Button
                                    className="bg-secondary text-primary font-black py-6 px-12 rounded-2xl text-xl hover:scale-105 transition-all shadow-xl"
                                    onClick={handleCompromissoSubmit}
                                    disabled={isSubmittingCompromisso || hasSubmittedCompromisso}
                                >
                                    {isSubmittingCompromisso ? <Loader2 className="animate-spin" /> : hasSubmittedCompromisso ? "Compromisso Enviado" : "Eu Aceito"}
                                </Button>
                            </div>
                        )}

                        <div className="pt-8 border-t border-border flex flex-wrap items-center gap-6">
                            {!completedLessons.includes(selectedLesson.id) ? (
                                <Button onClick={() => handleToggleProgress(selectedLesson.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-3">
                                    <CheckCircle2 size={24} /> Marcar como Aula Concluída
                                </Button>
                            ) : (
                                <div className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-6 py-4 rounded-xl border border-green-100 shadow-inner">
                                    <CheckCircle2 size={24} /> Você já completou esta aula!
                                </div>
                            )}

                            {selectedLesson.pdf_url && (
                                <Button asChild variant="outline" className="h-14 px-8 rounded-xl border-2 font-bold hover:bg-secondary hover:text-primary transition-all">
                                    <a href={selectedLesson.pdf_url} target="_blank" rel="noopener noreferrer">
                                        <FileText size={20} className="mr-2" /> Material de Apoio (PDF)
                                    </a>
                                </Button>
                            )}

                            {getNextLesson() && (
                                <Button
                                    onClick={() => {
                                        const next = getNextLesson();
                                        if (next) {
                                            setSelectedLesson(next);
                                            if (!expandedTopics[next.topic_id]) {
                                                setExpandedTopics(prev => ({ ...prev, [next.topic_id]: true }));
                                            }
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                    className="h-14 px-8 rounded-xl font-bold bg-secondary text-primary hover:bg-secondary/80 ml-auto flex items-center gap-2"
                                >
                                    Próxima Aula <ArrowRight size={20} />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/10 rounded-3xl p-16 border-2 border-dashed border-border h-full flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6">
                            <HeartHandshake size={40} />
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-2">Selecione uma Aula</h3>
                        <p className="text-foreground/70 max-w-xs italic font-serif">
                            Escolha um módulo e uma lição ao lado para começar seu estudo em casal.
                        </p>
                    </div>
                )}
            </main>

            {/* Topic Modal */}
            {isTopicModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsTopicModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X size={20} /></button>
                        <h3 className="text-xl font-bold mb-6">Gerenciar Módulo</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Título do Módulo" value={editingTopic?.title || ''} onChange={e => setEditingTopic({ ...editingTopic, title: e.target.value })} className="w-full p-4 rounded-xl border bg-muted/20" />
                            <input type="number" placeholder="Posição" value={editingTopic?.position || ''} onChange={e => setEditingTopic({ ...editingTopic, position: parseInt(e.target.value) })} className="w-full p-4 rounded-xl border bg-muted/20" />
                            <Button className="w-full h-12" disabled={isSaving} onClick={() => handleSaveTopic(editingTopic)}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={18} />} Salvar Módulo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Modal */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setIsLessonModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full"><X size={20} /></button>
                        <h3 className="text-xl font-bold mb-6">Gerenciar Aula</h3>
                        <div className="space-y-4 text-left">
                            <div className="grid grid-cols-4 gap-4">
                                <input type="text" placeholder="Título da Aula" value={editingLesson?.title || ''} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} className="col-span-3 p-4 rounded-xl border bg-muted/20" />
                                <input type="number" placeholder="Posição" value={editingLesson?.position || ''} onChange={e => setEditingLesson({ ...editingLesson, position: parseInt(e.target.value) })} className="p-4 rounded-xl border bg-muted/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Vídeo (URL)</label>
                                    <input type="text" placeholder="URL do Vídeo (Youtube)" value={editingLesson?.video_url || ''} onChange={e => setEditingLesson({ ...editingLesson, video_url: e.target.value })} className="w-full p-4 rounded-xl border bg-muted/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Arquivo PDF</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="URL do PDF" value={editingLesson?.pdf_url || ''} onChange={e => setEditingLesson({ ...editingLesson, pdf_url: e.target.value })} className="flex-1 p-4 rounded-xl border bg-muted/20" />
                                        <div className="relative">
                                            <input type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'pdf')} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                                            <Button variant="outline" className="h-full" disabled={isUploading}>
                                                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Conteúdo da Aula</label>
                                <textarea placeholder="Conteúdo da Aula" value={editingLesson?.content || ''} onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })} className="w-full p-4 rounded-xl border bg-muted/20 min-h-[300px]" />
                            </div>

                            <Button className="w-full h-14 font-bold text-lg" disabled={isSaving || isUploading} onClick={() => handleSaveLesson(editingLesson)}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={20} />} Publicar Aula
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const SignaturePad = ({ onSave, onClear }: { onSave: (data: string) => void, onClear: () => void }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const { x, y } = getPos(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            const { x, y } = getPos(e);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas) {
                onSave(canvas.toDataURL());
            }
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            onClear();
        }
    };

    return (
        <div className="space-y-3">
            <div className="border-2 border-dashed border-secondary/30 rounded-2xl overflow-hidden bg-white shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={450}
                    height={160}
                    className="w-full h-32 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                ></canvas>
            </div>
            <button
                type="button"
                onClick={clear}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-secondary flex items-center gap-1 transition-colors"
            >
                <X size={14} /> Limpar Assinatura
            </button>
        </div>
    );
};

const ListOrdered = ({ size, className }: { size: number, className: string }) => <BookOpen size={size} className={className} />;
