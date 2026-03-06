
import { bibleSupabase } from "@/integrations/supabase/bible";
import { Verse, CouplesTopic, CouplesLesson } from "@/types/bible";

export const getDailyVerse = async (): Promise<Verse | null> => {
    const books = ['Salmos', 'Provérbios'];
    const book = books[Math.floor(Math.random() * books.length)];
    // Simplificando busca para evitar dependência de BIBLE_STRUCTURE aqui agora
    const { data } = await bibleSupabase
        .from('verse_texts')
        .select(`
      text,
      verses!inner (
        verse_number,
        chapters!inner (
          chapter_number,
          books!inner (
            name
          )
        )
      )
    `)
        .eq('verses.chapters.books.name', book)
        .limit(30);

    if (data && data.length > 0) {
        const v = data[Math.floor(Math.random() * data.length)];
        return {
            text: v.text,
            book: v.verses.chapters.books.name,
            chapter: v.verses.chapters.chapter_number,
            verseNumber: v.verses.verse_number,
            reference: `${v.verses.chapters.books.name} ${v.verses.chapters.chapter_number}:${v.verses.verse_number}`
        };
    }
    return null;
};

export const getCouplesTopics = async (): Promise<CouplesTopic[]> => {
    const { data } = await bibleSupabase.from('couples_topics').select('*');
    return data || [];
};

export const BIBLE_BOOKS = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias', 'Lamentações', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas', 'Apocalipse'
];

export const getBibleChapter = async (book: string, chapter: number, version: string = 'Almeida Corrigida e Fiel') => {
    const { data, error } = await bibleSupabase
        .from('verse_texts')
        .select(`
      text,
      verses!inner (
        verse_number,
        chapters!inner (
          chapter_number,
          books!inner (
            name
          )
        )
      ),
      translations!inner (
        name
      )
    `)
        .eq('verses.chapters.books.name', book)
        .eq('verses.chapters.chapter_number', chapter)
        .eq('translations.name', version);

    if (error) throw error;

    return (data || [])
        .map((v: any) => ({
            number: v.verses.verse_number,
            text: v.text
        }))
        .sort((a, b) => a.number - b.number);
};

export const getCouplesLessons = async (topicId: string): Promise<CouplesLesson[]> => {
    const { data } = await bibleSupabase.from('couples_lessons').select('*').eq('topic_id', topicId);
    return data || [];
};
