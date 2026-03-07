
import React, { useState, useEffect } from 'react';
import {
    HeartHandshake, ChevronRight, BookOpen, ChevronDown, CheckCircle2,
    Loader2, PlayCircle, FileText, Video, ArrowRight
} from 'lucide-react';
import { CouplesTopic, CouplesLesson } from '@/types/bible';
import { getCouplesTopics, getCouplesLessons } from '@/integrations/supabase/bibleService';
import { Button } from '@/components/ui/button';

export default function CouplesStudy() {
    const [topics, setTopics] = useState<CouplesTopic[]>([]);
    const [lessons, setLessons] = useState<Record<string, CouplesLesson[]>>({});
    const [selectedLesson, setSelectedLesson] = useState<CouplesLesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*shorts\/|.*embed\/))([^?&/ ]+)/);
        if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        return url;
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const t = await getCouplesTopics();
                const sortedTopics = [...t].sort((a, b) => a.position - b.position);
                setTopics(sortedTopics);

                if (sortedTopics.length > 0) {
                    setExpandedTopics({ [sortedTopics[0].id]: true });
                }

                const lessonMap: Record<string, CouplesLesson[]> = {};
                for (const topic of sortedTopics) {
                    const lessonData = await getCouplesLessons(topic.id);
                    lessonMap[topic.id] = [...lessonData].sort((a, b) => a.position - b.position);
                }
                setLessons(lessonMap);
            } catch (err) {
                console.error("Erro ao carregar estudos:", err);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const toggleTopic = (id: string) => {
        setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-secondary" size={32} />
                <p className="text-foreground font-serif italic">Preparando os estudos...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de Módulos */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4">
                <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                    <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                        <ListOrdered size={20} className="text-secondary" /> Módulos
                    </h3>
                    <div className="space-y-3">
                        {topics.map(topic => (
                            <div key={topic.id} className="space-y-2">
                                <button
                                    onClick={() => toggleTopic(topic.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${expandedTopics[topic.id] ? 'bg-secondary text-primary font-bold' : 'hover:bg-muted text-foreground'}`}
                                >
                                    <span className="text-sm flex items-center gap-3">
                                        <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black ${expandedTopics[topic.id] ? 'bg-primary/20' : 'bg-muted'}`}>
                                            {topic.position}
                                        </span>
                                        {topic.title}
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform ${expandedTopics[topic.id] ? 'rotate-180' : ''}`} />
                                </button>

                                {expandedTopics[topic.id] && (
                                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-2">
                                        {(lessons[topic.id] || []).map(lesson => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setSelectedLesson(lesson)}
                                                className={`w-full p-3 rounded-lg text-xs text-left transition-all flex items-center gap-3 ${selectedLesson?.id === lesson.id ? 'text-secondary font-bold bg-secondary/10' : 'text-foreground/70 hover:bg-muted/50'}`}
                                            >
                                                <BookOpen size={14} className={selectedLesson?.id === lesson.id ? 'text-secondary' : 'opacity-30'} />
                                                <span className="truncate flex-1">{lesson.title}</span>
                                                {lesson.video_url && <PlayCircle size={12} className="text-secondary" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Área de Conteúdo */}
            <main className="flex-1">
                {selectedLesson ? (
                    <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-soft animate-in fade-in slide-in-from-bottom-4">
                        <header className="mb-8 pb-8 border-b border-border" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%', overflow: 'hidden' }}>
                            <div className="flex gap-2 mb-4">
                                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    {topics.find(t => t.id === selectedLesson.topic_id)?.title}
                                </span>
                                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                    Aula {selectedLesson.position}
                                </span>
                            </div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
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
                                    src={getEmbedUrl(selectedLesson.video_url)!}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Vídeo da Aula"
                                ></iframe>
                            </div>
                        )}

                        <div className="prose prose-stone dark:prose-invert max-w-none text-left">
                            <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                                {selectedLesson.content}
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-border flex flex-wrap items-center gap-4">
                            {selectedLesson.pdf_url && (
                                <Button asChild variant="secondary">
                                    <a href={selectedLesson.pdf_url} target="_blank" rel="noopener noreferrer">
                                        <FileText size={18} className="mr-2" /> Baixar Material PDF
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
                                    className="bg-secondary text-primary hover:bg-secondary/80 ml-auto flex items-center gap-2"
                                >
                                    Próxima Aula <ArrowRight size={18} />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-muted/10 rounded-3xl p-16 border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
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
        </div>
    );
}

function ListOrdered({ size, className }: { size: number, className: string }) {
    return <BookOpen size={size} className={className} />;
}
