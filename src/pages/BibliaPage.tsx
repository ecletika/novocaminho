
import React, { useState, useEffect } from 'react';
import { getBibleChapter, BIBLE_BOOKS } from '@/integrations/supabase/bibleService';
import { ChevronLeft, ChevronRight, BookOpen, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibliaPage() {
    const [book, setBook] = useState('Salmos');
    const [chapter, setChapter] = useState(23);
    const [verses, setVerses] = useState<{ number: number, text: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getBibleChapter(book, chapter);
                setVerses(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        load();
    }, [book, chapter]);

    const handlePrev = () => {
        if (chapter > 1) setChapter(chapter - 1);
    };

    const handleNext = () => {
        setChapter(chapter + 1);
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container-church max-w-4xl">
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                            <BookOpen className="text-secondary" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl font-bold">Escrituras Sagradas</h1>
                            <p className="text-foreground/60 text-sm uppercase tracking-widest font-bold">Almeida Corrigida e Fiel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
                        <select
                            value={book}
                            onChange={(e) => { setBook(e.target.value); setChapter(1); }}
                            className="bg-transparent border-none text-sm font-bold px-4 py-2 outline-none cursor-pointer text-foreground"
                        >
                            {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="w-px h-6 bg-border mx-2"></div>
                        <input
                            type="number"
                            value={chapter}
                            onChange={(e) => setChapter(parseInt(e.target.value))}
                            className="bg-transparent border-none text-sm font-bold w-12 text-center outline-none text-foreground"
                        />
                    </div>
                </header>

                <main className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-card relative overflow-hidden min-h-[500px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-secondary" size={40} />
                            <p className="font-serif italic text-foreground">Buscando na Palavra...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-700">
                            <div className="text-center mb-10">
                                <span className="text-secondary font-black text-xs uppercase tracking-[0.3em] mb-2 block">Capítulo {chapter}</span>
                                <h2 className="font-display text-4xl font-bold">{book}</h2>
                            </div>

                            <div className="space-y-6">
                                {verses.map(v => (
                                    <div key={v.number} className="flex gap-4 group">
                                        <span className="text-secondary font-black text-[10px] mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">{v.number}</span>
                                        <p className="text-lg md:text-xl leading-relaxed text-foreground font-serif">
                                            {v.text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
                                <Button variant="outline" onClick={handlePrev} disabled={chapter <= 1}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                </Button>
                                <Button variant="outline" onClick={handleNext}>
                                    Próximo <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
