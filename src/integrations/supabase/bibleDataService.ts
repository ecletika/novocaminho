
import { createClient } from "@supabase/supabase-js";
import { Verse, Devotional, DailyBread, StrongDefinition, Product, PrayerRequest, Book, CouplesTopic, CouplesLesson, PurposeContent } from "@/types/bible";

const supabaseUrl = 'https://ixupstbyynqswdehmuna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXBzdGJ5eW5xc3dkZWhtdW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjA4OTQsImV4cCI6MjA4NDU5Njg5NH0.l8p38uFStHjXNtdbfzAd7OSJSUTv1hLR6Uc8SMBZA7I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BIBLE_STRUCTURE = [
  { name: 'Gênesis', chapters: 50 }, { name: 'Êxodo', chapters: 40 }, { name: 'Levítico', chapters: 27 },
  { name: 'Números', chapters: 36 }, { name: 'Deuteronômio', chapters: 34 }, { name: 'Josué', chapters: 24 },
  { name: 'Juízes', chapters: 21 }, { name: 'Rute', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 }, { name: '1 Reis', chapters: 22 }, { name: '2 Reis', chapters: 25 },
  { name: '1 Crônicas', chapters: 29 }, { name: '2 Crônicas', chapters: 36 }, { name: 'Esdras', chapters: 10 },
  { name: 'Neemias', chapters: 13 }, { name: 'Ester', chapters: 10 }, { name: 'Jó', chapters: 42 },
  { name: 'Salmos', chapters: 150 }, { name: 'Provérbios', chapters: 31 }, { name: 'Eclesiastes', chapters: 12 },
  { name: 'Cânticos', chapters: 8 }, { name: 'Isaías', chapters: 66 }, { name: 'Jeremias', chapters: 52 },
  { name: 'Lamentações', chapters: 5 }, { name: 'Ezequiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
  { name: 'Oséias', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amós', chapters: 9 },
  { name: 'Obadias', chapters: 1 }, { name: 'Jonas', chapters: 4 }, { name: 'Miquéias', chapters: 7 },
  { name: 'Naum', chapters: 3 }, { name: 'Habacuque', chapters: 3 }, { name: 'Sofonias', chapters: 3 },
  { name: 'Ageu', chapters: 2 }, { name: 'Zacarias', chapters: 14 }, { name: 'Malaquias', chapters: 4 },
  { name: 'Mateus', chapters: 28 }, { name: 'Marcos', chapters: 16 }, { name: 'Lucas', chapters: 24 },
  { name: 'João', chapters: 21 }, { name: 'Atos', chapters: 28 }, { name: 'Romanos', chapters: 16 },
  { name: '1 Coríntios', chapters: 16 }, { name: '2 Coríntios', chapters: 13 }, { name: 'Gálatas', chapters: 6 },
  { name: 'Efésios', chapters: 6 }, { name: 'Filipenses', chapters: 4 }, { name: 'Colossenses', chapters: 4 },
  { name: '1 Tessalonicenses', chapters: 5 }, { name: '2 Tessalonicenses', chapters: 3 }, { name: '1 Timóteo', chapters: 6 },
  { name: '2 Timóteo', chapters: 4 }, { name: 'Tito', chapters: 3 }, { name: 'Filemom', chapters: 1 },
  { name: 'Hebreus', chapters: 13 }, { name: 'Tiago', chapters: 5 }, { name: '1 Pedro', chapters: 5 },
  { name: '2 Pedro', chapters: 3 }, { name: '1 João', chapters: 5 }, { name: '2 João', chapters: 1 },
  { name: '3 João', chapters: 1 }, { name: 'Judas', chapters: 1 }, { name: 'Apocalipse', chapters: 22 }
];

export const BIBLE_BOOKS = BIBLE_STRUCTURE.map(b => b.name);

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const checkIfUserIsAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  if (email === 'mauricio.junior@ecletika.com') return true;
  const { data } = await supabase.from('admins').select('email').eq('email', email).maybeSingle();
  return !!data;
};

export const getUserStreak = async (userId: string): Promise<number> => {
  const { data } = await supabase.from('user_streaks').select('streak_count').eq('user_id', userId).maybeSingle();
  return data?.streak_count || 0;
};

export const updateUserStreak = async (userId: string) => {
  const today = new Date().toLocaleDateString('en-CA');
  const { data: current } = await supabase.from('user_streaks').select('*').eq('user_id', userId).maybeSingle();

  if (!current) {
    await supabase.from('user_streaks').insert({ user_id: userId, streak_count: 1, last_activity: today });
  } else if (current.last_activity !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    const newCount = current.last_activity === yesterdayStr ? current.streak_count + 1 : 1;
    await supabase.from('user_streaks').update({ streak_count: newCount, last_activity: today }).eq('user_id', userId);
  }
};

/**
 * Retorna as versões disponíveis baseadas exatamente na sua tabela 'translations' do Supabase.
 */
export const getAvailableVersions = async () => [
  'Almeida Revista e Corrigida',
  'Almeida Corrigida e Fiel',
  'Almeida Revista e Atualizada',
  'King James Atualizada',
  'Tradução Brasileira',
  'King James Version',
  'Nova Versão Internacional',
  'João Ferreira de Almeida'
];

export const getChaptersList = async (book: string) => {
  const b = BIBLE_STRUCTURE.find(item => item.name === book);
  return b ? Array.from({ length: b.chapters }, (_, i) => i + 1) : [];
};

export const getBibleChapter = async (book: string, chapter: number, version: string) => {
  const { data, error } = await supabase
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

  return {
    book,
    chapter,
    verses: (data || [])
      .map((v: any) => ({
        number: v.verses.verse_number,
        text: v.text
      }))
      .sort((a, b) => a.number - b.number)
  };
};

export const getRandomWisdomVerse = async (): Promise<Verse | null> => {
  const books = ['Salmos', 'Provérbios'];
  const book = books[Math.floor(Math.random() * books.length)];
  const chapters = BIBLE_STRUCTURE.find(b => b.name === book)?.chapters || 1;
  const chapter = Math.floor(Math.random() * chapters) + 1;

  const { data } = await supabase
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
    .eq('verses.chapters.chapter_number', chapter)
    .limit(10);

  if (data && data.length > 0) {
    const v: any = data[Math.floor(Math.random() * data.length)];
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

export const searchBibleVerses = async (query: string, version: string) => {
  const { data } = await supabase
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
    .eq('translations.name', version)
    .ilike('text', `%${query}%`)
    .limit(30);

  return (data || []).map((v: any) => ({
    book: v.verses.chapters.books.name,
    chapter: v.verses.chapters.chapter_number,
    verseNumber: v.verses.verse_number,
    text: v.text,
    reference: `${v.verses.chapters.books.name} ${v.verses.chapters.chapter_number}:${v.verses.verse_number}`
  }));
};

export const markChapterAsRead = async (userId: string, book: string, chapter: number) => {
  const { error } = await supabase.from('read_chapters').upsert({ user_id: userId, book, chapter, read_at: new Date().toISOString() });
  return !error;
};

export const getReadChapters = async (userId: string, book: string) => {
  const { data } = await supabase.from('read_chapters').select('chapter').eq('user_id', userId).eq('book', book);
  return (data || []).map(d => d.chapter);
};

export const saveFavoriteVerse = async (userId: string, ref: string, text: string) => {
  const { error } = await supabase.from('favorite_verses').upsert({
    user_id: userId,
    verse_reference: ref,
    verse_text: text,
    created_at: new Date().toISOString()
  });
  return !error;
};

export const deleteFavoriteVerse = async (userId: string, ref: string) => {
  const { error } = await supabase.from('favorite_verses').delete().eq('user_id', userId).eq('verse_reference', ref);
  return !error;
};

export const getFavoriteVersesForChapter = async (userId: string, book: string, chapter: number) => {
  const prefix = `${book} ${chapter}:`;
  const { data } = await supabase.from('favorite_verses').select('verse_reference').eq('user_id', userId).ilike('verse_reference', `${prefix}%`);
  return (data || []).map(d => d.verse_reference);
};

export const getAllFavoriteVerses = async (userId: string) => {
  const { data } = await supabase.from('favorite_verses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const saveVerseReflection = async (userId: string, ref: string, content: string) => {
  const { error } = await supabase.from('verse_reflections').upsert({ user_id: userId, verse_reference: ref, content, updated_at: new Date().toISOString() });
  return !error;
};

export const getVerseReflection = async (userId: string, ref: string) => {
  const { data } = await supabase.from('verse_reflections').select('content').eq('user_id', userId).eq('verse_reference', ref).maybeSingle();
  return data?.content || null;
};

export const deleteVerseReflection = async (userId: string, ref: string) => {
  const { error } = await supabase.from('verse_reflections').delete().eq('user_id', userId).eq('verse_reference', ref);
  return !error;
};

export const saveChapterReflection = async (userId: string, book: string, chapter: number, content: string) => {
  const { error } = await supabase.from('chapter_reflections').upsert({ user_id: userId, book, chapter, content, updated_at: new Date().toISOString() });
  return !error;
};

export const getChapterReflection = async (userId: string, book: string, chapter: number) => {
  const { data } = await supabase.from('chapter_reflections').select('content').eq('user_id', userId).eq('book', book).eq('chapter', chapter).maybeSingle();
  return data?.content || '';
};

// Novas funções para Reflexão Diária (Meu Dia)
export const saveDailyUserNote = async (userId: string, date: string, content: string) => {
  const { error } = await supabase.from('daily_user_notes').upsert({ user_id: userId, date, content, updated_at: new Date().toISOString() });
  return !error;
};

export const getDailyUserNote = async (userId: string, date: string) => {
  const { data } = await supabase.from('daily_user_notes').select('content').eq('user_id', userId).eq('date', date).maybeSingle();
  return data?.content || '';
};

export const deleteChapterReflection = async (userId: string, book: string, chapter: number) => {
  const { error } = await supabase.from('chapter_reflections').delete().eq('user_id', userId).eq('book', book).eq('chapter', chapter);
  return !error;
};

export const getAllVerseReflectionsForChapter = async (userId: string, book: string, chapter: number) => {
  const prefix = `${book}_${chapter}_`;
  const { data } = await supabase.from('verse_reflections').select('*').eq('user_id', userId).ilike('verse_reference', `${prefix}%`);
  return data || [];
};

export const saveVerseHighlight = async (userId: string, ref: string, colorName: string | null) => {
  if (colorName) {
    const { error } = await supabase.from('verse_highlights').upsert({ user_id: userId, verse_reference: ref, color_name: colorName });
    return !error;
  } else {
    const { error } = await supabase.from('verse_highlights').delete().eq('user_id', userId).eq('verse_reference', ref);
    return !error;
  }
};

export const getVerseHighlightsForChapter = async (userId: string, book: string, chapter: number) => {
  const prefix = `${book}_${chapter}_`;
  const { data } = await supabase.from('verse_highlights').select('*').eq('user_id', userId).ilike('verse_reference', `${prefix}%`);
  return data || [];
};

// Funções para Versículos Extras no Propósito
export const savePurposeUserVerse = async (userId: string, purposeId: string, day: number, reference: string) => {
  const { error } = await supabase.from('purpose_user_verses').insert({ user_id: userId, purpose_id: purposeId, day_number: day, verse_reference: reference });
  return !error;
};

export const getPurposeUserVerses = async (userId: string, purposeId: string, day: number) => {
  const { data } = await supabase.from('purpose_user_verses').select('verse_reference').eq('user_id', userId).eq('purpose_id', purposeId).eq('day_number', day);
  return (data || []).map(d => d.verse_reference);
};

export const deletePurposeUserVerse = async (userId: string, purposeId: string, day: number, reference: string) => {
  const { error } = await supabase.from('purpose_user_verses').delete().eq('user_id', userId).eq('purpose_id', purposeId).eq('day_number', day).eq('verse_reference', reference);
  return !error;
};

export const getDailyDevotional = async (): Promise<Devotional | null> => {
  const { data } = await supabase.from('devotionals').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data;
};

export const getDevotionalsList = async (): Promise<Devotional[]> => {
  const { data } = await supabase.from('devotionals').select('*').order('created_at', { ascending: false });
  return data || [];
};

export const createDevotional = async (title: string, summary: string, content: string, author: string, userId: string, theme: string) => {
  const { data, error } = await supabase.from('devotionals').insert({ title, summary, content, author, user_id: userId, bg_color: theme, date: new Date().toLocaleDateString('pt-BR') }).select().single();
  if (error) throw error;
  return data;
};

export const updateDevotional = async (id: string, title: string, summary: string, content: string, theme: string) => {
  const { error } = await supabase.from('devotionals').update({ title, summary, content, bg_color: theme }).eq('id', id);
  if (error) throw error;
};

export const deleteDevotional = async (id: string) => {
  const { error } = await supabase.from('devotionals').delete().eq('id', id);
  if (error) throw error;
};

export const getDevotionalReflection = async (userId: string, devoId: string) => {
  const { data } = await supabase.from('devotional_reflections').select('content').eq('user_id', userId).eq('devotional_id', devoId).maybeSingle();
  return data?.content || null;
};

export const saveDevotionalReflection = async (userId: string, devoId: string, content: string) => {
  const { error } = await supabase.from('devotional_reflections').upsert({ user_id: userId, devotional_id: devoId, content, updated_at: new Date().toISOString() });
  return !error;
};

export const deleteDevotionalReflection = async (userId: string, devoId: string) => {
  const { error } = await supabase.from('devotional_reflections').delete().eq('user_id', userId).eq('devotional_id', devoId);
  return !error;
};

export const getDailyBread = async (date?: string): Promise<DailyBread | null> => {
  const d = date || new Date().toLocaleDateString('en-CA');
  const { data } = await supabase.from('daily_bread').select('*').eq('date', d).maybeSingle();
  return data;
};

export const searchDictionary = async (query: string): Promise<StrongDefinition[]> => {
  const { data } = await supabase.from('dictionary').select('*').ilike('term', `%${query}%`).limit(10);
  return data || [];
};

export const getDictionaryStats = async () => {
  const { count } = await supabase.from('dictionary').select('*', { count: 'exact', head: true });
  return count || 0;
};

export const saveDictionaryEntry = async (entry: any) => {
  const { data, error } = await supabase.from('dictionary').upsert(entry).select().single();
  return { success: !error, data, error: error?.message };
};

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await supabase.from('products').select('*');
  return data || [];
};

export const saveProduct = async (name: string, price: number, category: string, image: string) => {
  const { data, error } = await supabase.from('products').insert({ name, price, category, image }).select().single();
  return { success: !error, data, error: error?.message };
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { success: !error };
};

export const getCommunityPosts = async () => {
  const { data } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
  return data || [];
};

export const saveCommunityPost = async (userId: string, content: string, userName: string, userAvatar: string, imageUrl: string | null, type: string, metadata: any = null) => {
  const { data, error } = await supabase.from('community_posts').insert({
    user_id: userId, user_name: userName, user_avatar: userAvatar, content, image_url: imageUrl, post_type: type, metadata
  }).select().single();
  return { success: !error, data, error: error?.message };
};

export const togglePostLike = async (postId: string, currentLikes: number) => {
  const { error } = await supabase.from('community_posts').update({ likes: currentLikes + 1 }).eq('id', postId);
  return !error;
};

export const incrementIntercession = async (postId: string) => {
  const { data } = await supabase.from('community_posts').select('intercessions').eq('id', postId).single();
  const count = (data?.intercessions || 0) + 1;
  await supabase.from('community_posts').update({ intercessions: count }).eq('id', postId);
  return count;
};

export const deleteCommunityPost = async (postId: string) => {
  const { error } = await supabase.from('community_posts').delete().eq('id', postId);
  return !error;
};

export const getCommunityComments = async (postId: string) => {
  const { data } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  return data || [];
};

export const saveCommunityComment = async (postId: string, userId: string, userName: string, userAvatar: string, content: string) => {
  const { error } = await supabase.from('community_comments').insert({ post_id: postId, user_id: userId, user_name: userName, user_avatar: userAvatar, content });
  return !error;
};

export const uploadCommunityImage = async (file: File) => {
  const name = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('community').upload(name, file);
  if (error) return null;
  return supabase.storage.from('community').getPublicUrl(data.path).data.publicUrl;
};

export const getPurposesList = async () => {
  const { data } = await supabase.from('purposes').select('*');
  return data || [];
};

export const getUserActivePurposes = async (userId: string) => {
  const { data } = await supabase.from('user_purposes').select('*, purposes(*)').eq('user_id', userId).eq('is_completed', false);
  return data || [];
};

export const getUserCompletedPurposes = async (userId: string) => {
  const { data } = await supabase.from('user_purposes').select('*, purposes(*)').eq('user_id', userId).eq('is_completed', true);
  return data || [];
};

export const startPurpose = async (userId: string, purposeId: string) => {
  const { error } = await supabase.from('user_purposes').upsert({ user_id: userId, purpose_id: purposeId, current_day: 1, is_completed: false });
  return !error;
};

export const advancePurposeDay = async (userId: string, purposeId: string, nextDay: number) => {
  const { error } = await supabase.from('user_purposes').update({ current_day: nextDay }).eq('user_id', userId).eq('purpose_id', purposeId);
  return !error;
};

export const completeUserPurpose = async (userId: string, purposeId: string) => {
  const { error = null } = await supabase.from('user_purposes').update({ is_completed: true }).eq('user_id', userId).eq('purpose_id', purposeId);
  return !error;
};

export const getPurposeDayContent = async (purposeId: string, day: number) => {
  const { data } = await supabase.from('purpose_contents').select('*').eq('purpose_id', purposeId).eq('day_number', day).maybeSingle();
  return data;
};

export const savePurpose = async (p: any) => {
  const { data, error } = await supabase.from('purposes').upsert(p).select().single();
  return { success: !error, data, error: error?.message };
};

export const deletePurpose = async (id: string) => {
  const { error } = await supabase.from('purposes').delete().eq('id', id);
  return !error;
};

export const getPurposeAllContent = async (purposeId: string) => {
  const { data } = await supabase.from('purpose_contents').select('*').eq('purpose_id', purposeId).order('day_number', { ascending: true });
  return data || [];
};

export const savePurposeContent = async (content: any) => {
  const { data, error } = await supabase.from('purpose_contents').upsert(content).select().single();
  return { success: !error, data, error: error?.message };
};

export const deletePurposeContent = async (id: string) => {
  const { error } = await supabase.from('purpose_contents').delete().eq('id', id);
  return !error;
};

export const getPrayers = async (userId: string) => {
  const { data } = await supabase.from('prayers').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
};

export const savePrayer = async (userId: string, title: string, content: string) => {
  const { data, error } = await supabase.from('prayers').insert({ user_id: userId, title, content, is_answered: false }).select().single();
  return { success: !error, data, error: error?.message };
};

export const updatePrayer = async (id: string, title: string, content: string) => {
  const { error } = await supabase.from('prayers').update({ title, content }).eq('id', id);
  return { success: !error };
};

export const togglePrayerAnswered = async (id: string, current: boolean) => {
  const { error } = await supabase.from('prayers').update({ is_answered: !current }).eq('id', id);
  return !error;
};

export const deletePrayer = async (id: string) => {
  const { error } = await supabase.from('prayers').delete().eq('id', id);
  return !error;
};

export const getBooks = async () => {
  const { data, error } = await supabase.from('books').select('*');
  if (error && error.code === '42P01') return "__TABLE_MISSING__";
  return data || [];
};

export const saveBook = async (book: any) => {
  const { data, error } = await supabase.from('books').upsert(book).select().single();
  return { success: !error, data, error: error?.message, code: error?.code };
};

export const deleteBook = async (id: string) => {
  const { error } = await supabase.from('books').delete().eq('id', id);
  return { success: !error };
};

export const uploadBookFile = async (file: File) => {
  const name = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('books').upload(name, file);
  if (error) return null;
  return supabase.storage.from('books').getPublicUrl(data.path).data.publicUrl;
};

export const getCouplesTopics = async () => {
  const { data, error } = await supabase.from('couples_topics').select('*');
  if (error && error.code === '42P01') return "__TABLE_MISSING__";
  return data || [];
};

export const getCouplesLessons = async (topicId: string) => {
  const { data } = await supabase.from('couples_lessons').select('*').eq('topic_id', topicId);
  return data || [];
};

export const saveCouplesTopic = async (topic: any) => {
  const { data, error } = await supabase.from('couples_topics').upsert(topic).select().single();
  return { success: !error, data };
};

export const saveCouplesLesson = async (lesson: any) => {
  const { data, error } = await supabase.from('couples_lessons').upsert(lesson).select().single();
  return { success: !error, data, error: error?.message };
};

export const deleteCouplesTopic = async (id: string) => {
  const { error } = await supabase.from('couples_topics').delete().eq('id', id);
  return !error;
};

export const deleteCouplesLesson = async (id: string) => {
  const { error } = await supabase.from('couples_lessons').delete().eq('id', id);
  return !error;
};

export const markCouplesLessonRead = async (userId: string, lessonId: string) => {
  const { error } = await supabase.from('couples_progress').upsert({ user_id: userId, lesson_id: lessonId });
  return { success: !error, code: error?.code };
};

export const getCouplesReadLessons = async (userId: string) => {
  const { data, error } = await supabase.from('couples_progress').select('lesson_id').eq('user_id', userId);
  if (error && error.code === '42P01') return "__TABLE_MISSING__";
  return (data || []).map(d => d.lesson_id);
};

export const getVerseLikes = async (ref: string): Promise<number> => {
  const { count } = await supabase.from('verse_likes').select('*', { count: 'exact', head: true }).eq('verse_reference', ref);
  return count || 0;
};

export const toggleVerseLike = async (ref: string, currentCount: number, isLiked: boolean): Promise<number> => {
  return isLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
};

export const getAllUserVerseReflections = async (userId: string) => {
  const { data } = await supabase.from('verse_reflections').select('*').eq('user_id', userId);
  return data || [];
};

export const getAllUserChapterReflections = async (userId: string) => {
  const { data } = await supabase.from('chapter_reflections').select('*').eq('user_id', userId);
  return data || [];
};

export const saveReadingHistory = async (userId: string, book: string, chapter: number, verse?: number) => {
  const { error } = await supabase.from('reading_history').insert({
    user_id: userId,
    book,
    chapter,
    verse,
    read_at: new Date().toISOString()
  });
  return !error;
};

export const getReadingHistory = async (userId: string) => {
  const { data } = await supabase.from('reading_history')
    .select('*')
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(50);
  return data || [];
};

export const getAllUserDevotionalReflections = async (userId: string) => {
  const { data } = await supabase.from('devotional_reflections').select('*, devotionals(*)').eq('user_id', userId);
  return data || [];
};
