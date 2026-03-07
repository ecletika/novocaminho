
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  getBibleChapter, 
  getAvailableVersions, 
  getChaptersList, 
  BIBLE_BOOKS,
  BIBLE_STRUCTURE,
  getChapterReflection,
  saveChapterReflection,
  getAllVerseReflectionsForChapter,
  saveVerseReflection,
  deleteVerseReflection,
  markChapterAsRead,
  getReadChapters,
  searchBibleVerses,
  getUserStreak,
  saveVerseHighlight,
  getVerseHighlightsForChapter,
  saveCommunityPost,
  saveFavoriteVerse,
  deleteFavoriteVerse,
  getFavoriteVersesForChapter,
  saveReadingHistory,
  getReadingHistory,
  supabase
} from '@/integrations/supabase/bibleDataService';
import { 
  ArrowLeft,
  ArrowRight,
  Share2, BookOpen, ChevronDown, 
  Loader2, MessageSquare, Copy, X,
  PenLine, Quote, CheckCircle2, Save, Check, Search, Book, Hash, Flame, Palette, Type, Minus, Plus, Users, Send, Bookmark, Trash2,
  Sun, Moon, Download, CloudOff,
  ExternalLink,
  User as UserIcon
} from 'lucide-react';
import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';
import { User } from '@supabase/supabase-js';

interface ChapterContent {
  book: string;
  chapter: number;
  verses: { number: number, text: string }[];
}

interface BibleViewProps {
  user: User | null;
  initialBook: string;
  initialChapter: number;
  initialVerse?: number;
  onAuthRequired?: () => void;
  globalTheme?: 'light' | 'dark';
  toggleGlobalTheme?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', class: 'bg-yellow-200/50 dark:bg-yellow-900/40', border: 'border-yellow-400' },
  { name: 'green', class: 'bg-green-200/50 dark:bg-green-900/40', border: 'border-green-400' },
  { name: 'blue', class: 'bg-blue-200/50 dark:bg-blue-900/40', border: 'border-blue-400' },
  { name: 'pink', class: 'bg-pink-200/50 dark:bg-pink-900/40', border: 'border-pink-400' },
  { name: 'purple', class: 'bg-purple-200/50 dark:bg-purple-900/40', border: 'border-purple-400' },
];

const BIBLE_THEMES = [
  { id: 'black', name: 'Preto', bg: 'bg-[#121212]', text: 'text-white', border: 'border-white/10', button: 'bg-[#222]', hover: 'hover:bg-[#333]', card: 'bg-[#1a1a1a]', accent: 'text-[#8B7355]' },
  { id: 'white', name: 'Branco', bg: 'bg-white', text: 'text-black', border: 'border-black/10', button: 'bg-gray-100', hover: 'hover:bg-gray-200', card: 'bg-gray-50', accent: 'text-[#8B7355]' },
  { id: 'yellow', name: 'Amarelo', bg: 'bg-[#FEF9C3]', text: 'text-black', border: 'border-yellow-200', button: 'bg-yellow-200/50', hover: 'hover:bg-yellow-200', card: 'bg-yellow-50', accent: 'text-amber-700' },
  { id: 'orange', name: 'Laranja', bg: 'bg-[#FFEDD5]', text: 'text-black', border: 'border-orange-200', button: 'bg-orange-200/50', hover: 'hover:bg-orange-200', card: 'bg-orange-50', accent: 'text-orange-700' },
];

const BibleView: React.FC<BibleViewProps> = ({ user, initialBook, initialChapter, initialVerse, onAuthRequired, globalTheme, toggleGlobalTheme }) => {
  const [viewMode, setViewMode] = useState<'BOOKS' | 'CHAPTERS' | 'VERSES'>(initialBook ? 'VERSES' : 'BOOKS');
  const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('OT');
  const [loadedChapters, setLoadedChapters] = useState<ChapterContent[]>([]);
  const [currentBook, setCurrentBook] = useState(initialBook || 'Gênesis');
  const [currentChapter, setCurrentChapter] = useState(initialChapter || 1);
  const [version, setVersion] = useState(''); 
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [chaptersInBook, setChaptersInBook] = useState<number[]>([]);
  const [versesInChapter, setVersesInChapter] = useState<number[]>([]);
  const [readChapters, setReadChapters] = useState<number[]>([]);
  const [favoriteVerses, setFavoriteVerses] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bookFilter, setBookFilter] = useState('');
  const [bibleSearchQuery, setBibleSearchQuery] = useState('');
  const [bibleSearchResults, setBibleSearchResults] = useState<any[]>([]);
  const [isSearchingVerses, setIsSearchingVerses] = useState(false);
  
  const [chapterNote, setChapterNote] = useState('');
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState<number | null>(null);
  
  const [verseComments, setVerseComments] = useState<Record<string, string>>({});
  const [verseHighlights, setVerseHighlights] = useState<Record<string, string>>({});
  const [selectedVerse, setSelectedVerse] = useState<{ book: string, chapter: number, verse: number } | null>(null);
  const [tempComment, setTempComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isPostingToCommunity, setIsPostingToCommunity] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [bibleThemeId, setBibleThemeId] = useState<'black' | 'white' | 'yellow' | 'orange'>(() => {
    const saved = localStorage.getItem('bible_theme');
    return (saved as any) || 'black';
  });

  const [downloadProgress, setDownloadProgress] = useState<{ current: number, total: number, book?: string } | null>(null);
  const [offlineBooks, setOfflineBooks] = useState<string[]>([]);
  const [isDownloadingFull, setIsDownloadingFull] = useState(false);

  const currentTheme = BIBLE_THEMES.find(t => t.id === bibleThemeId) || BIBLE_THEMES[0];

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('bible_font_size');
    return saved ? parseInt(saved) : 20;
  });

  const sidePanelRef = useRef<HTMLDivElement>(null);

  const otBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  const filteredBooks = useMemo(() => {
    const books = activeTab === 'OT' ? otBooks : ntBooks;
    return books.filter(b => b.toLowerCase().includes(bookFilter.toLowerCase()));
  }, [bookFilter, activeTab, otBooks, ntBooks]);

  useEffect(() => {
    localStorage.setItem('bible_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('bible_theme', bibleThemeId);
  }, [bibleThemeId]);

  // Sync chapters list when book changes
  useEffect(() => {
    getChaptersList(currentBook).then(setChaptersInBook);
  }, [currentBook]);

  // Sync with global theme
  useEffect(() => {
    if (globalTheme) {
      if (globalTheme === 'dark' && bibleThemeId === 'white') {
        setBibleThemeId('black');
      } else if (globalTheme === 'light' && bibleThemeId === 'black') {
        setBibleThemeId('white');
      }
    }
  }, [globalTheme]);

  useEffect(() => {
    const initVersions = async () => {
      try {
        const vList = await getAvailableVersions();
        if (vList.length > 0) {
          setAvailableVersions(vList);
          const defaultV = vList.find(v => v.includes('Corrigida e Fiel')) || vList[0];
          setVersion(defaultV);
        }
        if (user) {
          getUserStreak(user.id).then(setStreak);
        }

        // Check offline books
        const keys = await idbKeys();
        const downloadedBooks = new Set<string>();
        keys.forEach(k => {
          const s = k.toString();
          if (s.startsWith('offline_ACF_')) {
            const parts = s.split('_');
            if (parts.length >= 3) downloadedBooks.add(parts[2]);
          }
        });
        setOfflineBooks(Array.from(downloadedBooks));

      } catch (err) {
        setError("Não foi possível carregar as versões da Bíblia.");
      }
    };
    initVersions();
  }, [user]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const jumpToVerse = useCallback((vNum: number) => {
    setSelectedVerse({ book: currentBook, chapter: currentChapter, verse: vNum });
    setTimeout(() => {
      const el = document.getElementById(`v-${currentBook}-${currentChapter}-${vNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }, [currentBook, currentChapter]);

  const loadInitialChapter = useCallback(async (b: string, c: number, v: string, vJump?: number) => {
    if (!v) return;
    
    // 1. Check Offline Storage (IndexedDB) - Highest Priority
    const offlineKey = `offline_${v.includes('Corrigida e Fiel') ? 'ACF' : v}_${b}_${c}`;
    const offlineData = await idbGet(offlineKey);
    
    if (offlineData) {
      setLoadedChapters([{ book: b, chapter: c, verses: offlineData.verses }]);
      setVersesInChapter(offlineData.verses.map((vs: any) => vs.number));
      setLoading(false);
      
      if (user) {
        Promise.all([
          getChapterReflection(user.id, b, c),
          getAllVerseReflectionsForChapter(user.id, b, c),
          getReadChapters(user.id, b),
          getVerseHighlightsForChapter(user.id, b, c),
          getFavoriteVersesForChapter(user.id, b, c),
          getReadingHistory(user.id)
        ]).then(([note, comments, readList, highlights, favList, historyData]) => {
          setChapterNote(note);
          setReadChapters(readList);
          setFavoriteVerses(favList);
          setReadingHistory(historyData);
          const commentMap: Record<string, string> = {};
          comments.forEach(res => { commentMap[res.verse_reference] = res.content; });
          setVerseComments(commentMap);
          const highlightMap: Record<string, string> = {};
          highlights.forEach(h => { highlightMap[h.verse_reference] = h.color_name; });
          setVerseHighlights(highlightMap);
        });
      }
      if (vJump) setTimeout(() => jumpToVerse(vJump), 100);
      return;
    }

    // 2. Check Cache (LocalStorage) - Second Priority
    const cacheKey = `bible_cache_${v}_${b}_${c}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setLoadedChapters([{ book: b, chapter: c, verses: parsed.verses }]);
        setVersesInChapter(parsed.verses.map((vs: any) => vs.number));
        setLoading(false);
        // Still fetch user data in background
        if (user) {
          Promise.all([
            getChapterReflection(user.id, b, c),
            getAllVerseReflectionsForChapter(user.id, b, c),
            getReadChapters(user.id, b),
            getVerseHighlightsForChapter(user.id, b, c),
            getFavoriteVersesForChapter(user.id, b, c),
            getReadingHistory(user.id)
          ]).then(([note, comments, readList, highlights, favList, historyData]) => {
            setChapterNote(note);
            setReadChapters(readList);
            setFavoriteVerses(favList);
            setReadingHistory(historyData);
            const commentMap: Record<string, string> = {};
            comments.forEach(res => { commentMap[res.verse_reference] = res.content; });
            setVerseComments(commentMap);
            const highlightMap: Record<string, string> = {};
            highlights.forEach(h => { highlightMap[h.verse_reference] = h.color_name; });
            setVerseHighlights(highlightMap);
          });
        }
        if (vJump) setTimeout(() => jumpToVerse(vJump), 100);
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBibleChapter(b, c, v);
      if (data && data.verses.length > 0) {
        // Save to Cache
        localStorage.setItem(cacheKey, JSON.stringify({ verses: data.verses, timestamp: Date.now() }));
        
        setLoadedChapters([{ book: b, chapter: c, verses: data.verses }]);
        const cList = await getChaptersList(b);
        setVersesInChapter(data.verses.map(vs => vs.number));
        
        if (user) {
          const [note, comments, readList, highlights, favList, historyData] = await Promise.all([
            getChapterReflection(user.id, b, c),
            getAllVerseReflectionsForChapter(user.id, b, c),
            getReadChapters(user.id, b),
            getVerseHighlightsForChapter(user.id, b, c),
            getFavoriteVersesForChapter(user.id, b, c),
            getReadingHistory(user.id)
          ]);
          setChapterNote(note);
          setReadChapters(readList);
          setFavoriteVerses(favList);
          setReadingHistory(historyData);
          
          const commentMap: Record<string, string> = {};
          comments.forEach(res => { commentMap[res.verse_reference] = res.content; });
          setVerseComments(commentMap);

          const highlightMap: Record<string, string> = {};
          highlights.forEach(h => { highlightMap[h.verse_reference] = h.color_name; });
          setVerseHighlights(highlightMap);
        }

        if (vJump) {
          setTimeout(() => jumpToVerse(vJump), 100);
        }

        // Pre-fetch next chapter
        setTimeout(() => {
          const nextChapter = c + 1;
          if (nextChapter <= cList.length) {
            const nextCacheKey = `bible_cache_${v}_${b}_${nextChapter}`;
            if (!localStorage.getItem(nextCacheKey)) {
              getBibleChapter(b, nextChapter, v).then(nextData => {
                if (nextData) localStorage.setItem(nextCacheKey, JSON.stringify({ verses: nextData.verses, timestamp: Date.now() }));
              });
            }
          }
        }, 3000);

      } else {
        setError("Capítulo não encontrado nesta tradução.");
      }
    } catch (err) {
      console.error("Erro ao carregar Escrituras:", err);
      setError("Erro ao carregar as Escrituras.");
    } finally {
      setLoading(false);
    }
  }, [user, jumpToVerse]);

  const handleDownloadBook = async (bookName: string) => {
    const bookInfo = BIBLE_STRUCTURE.find(b => b.name === bookName);
    if (!bookInfo) return;

    setDownloadProgress({ current: 0, total: bookInfo.chapters, book: bookName });
    
    try {
      const vName = version || 'Almeida Corrigida e Fiel';
      const vKey = vName.includes('Corrigida e Fiel') ? 'ACF' : vName;

      for (let i = 1; i <= bookInfo.chapters; i++) {
        const offlineKey = `offline_${vKey}_${bookName}_${i}`;
        const existing = await idbGet(offlineKey);
        if (!existing) {
          const data = await getBibleChapter(bookName, i, vName);
          if (data) {
            await idbSet(offlineKey, { verses: data.verses, timestamp: Date.now() });
          }
        }
        setDownloadProgress(prev => prev ? { ...prev, current: i } : null);
      }
      
      setOfflineBooks(prev => [...new Set([...prev, bookName])]);
      showFeedback(`Livro de ${bookName} baixado para uso offline!`);
    } catch (err) {
      console.error(err);
      showFeedback("Erro ao baixar livro.");
    } finally {
      setDownloadProgress(null);
    }
  };

  const handleDownloadFullBible = async () => {
    if (isDownloadingFull) return;
    setIsDownloadingFull(true);
    
    const vName = 'Almeida Corrigida e Fiel';
    const vKey = 'ACF';
    const totalChapters = BIBLE_STRUCTURE.reduce((acc, b) => acc + b.chapters, 0);
    let currentCount = 0;

    setDownloadProgress({ current: 0, total: totalChapters, book: 'Bíblia Completa' });

    try {
      for (const book of BIBLE_STRUCTURE) {
        for (let i = 1; i <= book.chapters; i++) {
          const offlineKey = `offline_${vKey}_${book.name}_${i}`;
          const existing = await idbGet(offlineKey);
          if (!existing) {
            const data = await getBibleChapter(book.name, i, vName);
            if (data) {
              await idbSet(offlineKey, { verses: data.verses, timestamp: Date.now() });
            }
          }
          currentCount++;
          if (currentCount % 10 === 0) {
            setDownloadProgress({ current: currentCount, total: totalChapters, book: `Baixando ${book.name}...` });
          }
        }
        setOfflineBooks(prev => [...new Set([...prev, book.name])]);
      }
      showFeedback("Bíblia Completa (ACF) disponível offline!");
    } catch (err) {
      console.error(err);
      showFeedback("Erro ao baixar Bíblia completa.");
    } finally {
      setDownloadProgress(null);
      setIsDownloadingFull(false);
    }
  };

  const handleRemoveOffline = async (bookName: string) => {
    if (!window.confirm(`Remover ${bookName} do armazenamento local?`)) return;
    
    const keys = await idbKeys();
    for (const key of keys) {
      if (key.toString().includes(`_${bookName}_`)) {
        await idbDel(key);
      }
    }
    setOfflineBooks(prev => prev.filter(b => b !== bookName));
    showFeedback(`${bookName} removido.`);
  };

  useEffect(() => {
    if (version && viewMode === 'VERSES') {
      loadInitialChapter(currentBook, currentChapter, version, initialVerse);
    }
  }, [version, currentBook, currentChapter, loadInitialChapter, viewMode, initialVerse]);

  useEffect(() => {
    if (initialBook) {
      setCurrentBook(initialBook);
      setCurrentChapter(initialChapter || 1);
      setViewMode('VERSES');
    }
  }, [initialBook, initialChapter]);

  const handleBibleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bibleSearchQuery.length < 2) return;
    setIsSearchingVerses(true);
    const results = await searchBibleVerses(bibleSearchQuery, version);
    setBibleSearchResults(results);
    setIsSearchingVerses(false);
  };

  const handleSelectSearchResult = (res: any) => {
    setCurrentBook(res.book);
    setCurrentChapter(res.chapter);
    setShowSearchPanel(false);
    setViewMode('VERSES');
    setTimeout(() => jumpToVerse(res.verseNumber), 500);
  };

  const handleMarkAsRead = async (book: string, chapter: number) => {
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    setIsMarkingRead(chapter);
    const success = await markChapterAsRead(user.id, book, chapter);
    if (success) {
      setReadChapters(prev => [...prev, chapter]);
      showFeedback("Progresso salvo!");
    }
    setIsMarkingRead(null);
  };

  const handlePostToCommunity = async () => {
    if (!user || !selectedVerse) return;
    setIsPostingToCommunity(true);
    try {
      const chapterData = loadedChapters.find(c => c.book === selectedVerse.book && c.chapter === selectedVerse.chapter);
      const vText = chapterData?.verses.find(vs => vs.number === selectedVerse.verse)?.text || "";
      const ref = `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`;
      
      const metadata = user.user_metadata || {};
      const userName = metadata.full_name || user.email?.split('@')[0] || 'Irmão';
      const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8B7355&color=fff`;

      const result: any = await saveCommunityPost(user.id, `${vText}\n\n— ${ref}`, userName, userAvatar, null, 'verse', { reference: ref });
      if (result.success) {
        showFeedback("Publicado no Mural Social!");
        setSelectedVerse(null);
      }
    } catch (err) { console.error(err); } finally { setIsPostingToCommunity(false); }
  };

  const handleSaveComment = async () => {
    if (!user || !selectedVerse) return;
    setIsSavingComment(true);
    const ref = `${selectedVerse.book}_${selectedVerse.chapter}_${selectedVerse.verse}`;
    const success = await saveVerseReflection(user.id, ref, tempComment);
    if (success) {
      setVerseComments(prev => ({ ...prev, [ref]: tempComment }));
      setShowCommentInput(false);
      showFeedback("Comentário salvo!");
    }
    setIsSavingComment(false);
  };

  const handleDeleteComment = async (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Deseja apagar esta anotação permanentemente?")) return;
    
    const success = await deleteVerseReflection(user.id, ref);
    if (success) {
      setVerseComments(prev => {
        const next = { ...prev };
        delete next[ref];
        return next;
      });
      showFeedback("Anotação removida.");
    }
  };

  const handleSaveHighlight = async (colorName: string | null) => {
    if (!user || !selectedVerse) return;
    const ref = `${selectedVerse.book}_${selectedVerse.chapter}_${selectedVerse.verse}`;
    const success = await saveVerseHighlight(user.id, ref, colorName);
    if (success) {
      setVerseHighlights(prev => {
        const next = { ...prev };
        if (colorName) next[ref] = colorName;
        else delete next[ref];
        return next;
      });
      setShowColorPicker(false);
      showFeedback(colorName ? "Versículo marcado!" : "Marcação removida!");
    }
  };

  const handleVerseAction = async (vNum: number, bName: string, cNum: number, action: 'copy' | 'share' | 'comment' | 'color' | 'social' | 'favorite') => {
    const chapterData = loadedChapters.find(c => c.book === bName && c.chapter === cNum);
    const vText = chapterData?.verses.find(vs => vs.number === vNum)?.text || "";
    const ref = `${bName} ${cNum}:${vNum}`;
    const fullRef = `${bName}_${cNum}_${vNum}`;
    
    if (action === 'copy') { 
      navigator.clipboard.writeText(`"${vText}" (${ref})`); 
      showFeedback("Versículo copiado!");
    }
    else if (action === 'share') { 
      if (navigator.share) {
        navigator.share({ text: `"${vText}" (${ref})` }).then(() => showFeedback("Compartilhado!"));
      } else {
        navigator.clipboard.writeText(`"${vText}" (${ref})`); 
        showFeedback("Link copiado!");
      }
    }
    else if (action === 'comment') {
      if (!user) { onAuthRequired?.(); return; }
      setTempComment(verseComments[fullRef] || '');
      setShowCommentInput(true);
    }
    else if (action === 'color') {
      if (!user) { onAuthRequired?.(); return; }
      setShowColorPicker(!showColorPicker);
    }
    else if (action === 'social') {
      if (!user) { onAuthRequired?.(); return; }
      handlePostToCommunity();
    }
    else if (action === 'favorite') {
      if (!user) { onAuthRequired?.(); return; }
      const isFav = favoriteVerses.includes(ref);
      if (isFav) {
        await deleteFavoriteVerse(user.id, ref);
        setFavoriteVerses(prev => prev.filter(f => f !== ref));
        showFeedback("Removido dos favoritos");
      } else {
        await saveFavoriteVerse(user.id, ref, vText);
        setFavoriteVerses(prev => [...prev, ref]);
        showFeedback("Salvo nos favoritos!");
      }
    }
  };

  const handleVerseClick = (vNum: number, bName: string, cNum: number) => {
    const isSame = selectedVerse?.verse === vNum && selectedVerse?.chapter === cNum;
    if (isSame) {
      setSelectedVerse(null);
      setShowColorPicker(false);
    } else {
      setSelectedVerse({ book: bName, chapter: cNum, verse: vNum });
      setShowColorPicker(false);
      // Save history for specific verse
      if (user) {
        saveReadingHistory(user.id, bName, cNum, vNum);
      }
    }
  };

  const handleNextChapter = () => {
    const chapters = chaptersInBook.length;
    if (currentChapter < chapters) {
      setCurrentChapter(prev => prev + 1);
    } else {
      const bookIndex = BIBLE_BOOKS.indexOf(currentBook);
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        setCurrentBook(BIBLE_BOOKS[bookIndex + 1]);
        setCurrentChapter(1);
      }
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      const bookIndex = BIBLE_BOOKS.indexOf(currentBook);
      if (bookIndex > 0) {
        const prevBook = BIBLE_BOOKS[bookIndex - 1];
        setCurrentBook(prevBook);
        getChaptersList(prevBook).then(list => {
          setCurrentChapter(list.length);
        });
      }
    }
  };

  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';

  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveTab('NT');
      else setActiveTab('OT');
    }
    touchStartX.current = null;
  };

  return (
    <div className={`max-w-4xl mx-auto min-h-screen ${currentTheme.bg} ${currentTheme.text} p-4 md:p-6 animate-in fade-in duration-500`}>
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Bíblia</h1>
          <div className="relative">
            <button 
              onClick={() => setShowVersionSelector(!showVersionSelector)}
              className={`${currentTheme.button} px-3 py-1 rounded-md text-xs font-bold flex items-center gap-2 border ${currentTheme.border}`}
            >
              {version === 'Nova Versão Internacional' ? 'NVI' : 
               version === 'Almeida Revista e Corrigida' ? 'ARC' :
               version === 'Almeida Corrigida e Fiel' ? 'ACF' :
               version === 'Almeida Revista e Atualizada' ? 'ARA' :
               version === 'King James Atualizada' ? 'KJA' :
               version === 'Tradução Brasileira' ? 'TB' :
               version === 'King James Version' ? 'KJV' :
               version === 'João Ferreira de Almeida' ? 'JFA' : 'Versão'} <ChevronDown size={14} />
            </button>
            {showVersionSelector && (
              <div className={`absolute top-full left-0 mt-2 w-48 ${currentTheme.card} border ${currentTheme.border} rounded-xl shadow-2xl z-[100] p-2`}>
                {availableVersions.map(v => (
                  <button 
                    key={v} 
                    onClick={() => { setVersion(v); setShowVersionSelector(false); }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 ${version === v ? `${currentTheme.accent} font-bold` : 'text-gray-400'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 ${currentTheme.button} px-3 py-1.5 rounded-full border ${currentTheme.border}`}>
            <Flame size={16} className="text-orange-500" fill="currentColor" />
            <span className="text-xs font-bold">{streak} dias</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadFullBible}
            disabled={isDownloadingFull}
            className={`p-2 ${currentTheme.button} rounded-full text-gray-400 hover:text-white transition-all ${isDownloadingFull ? 'animate-pulse' : ''}`}
            title="Baixar Bíblia Completa (ACF)"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 ${currentTheme.button} rounded-full text-gray-400 hover:text-white transition-all`}
            title="Histórico de Leitura"
          >
            <Hash size={20} />
          </button>
        </div>
      </header>

      {/* DOWNLOAD PROGRESS */}
      {downloadProgress && (
        <div className="mb-8 bg-[#8B7355]/10 p-6 rounded-2xl border border-[#8B7355]/20 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm flex items-center gap-2"><Download size={16} className="animate-bounce" /> {downloadProgress.book || 'Baixando...'}</h3>
            <span className="text-xs font-black">{Math.round((downloadProgress.current / downloadProgress.total) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#8B7355] transition-all duration-300" 
              style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic">Não feche o aplicativo durante o download para garantir a integridade dos dados.</p>
        </div>
      )}

      {/* HISTORY PANEL */}
      {showHistory && (
        <div className={`mb-8 ${currentTheme.card} p-6 rounded-2xl border ${currentTheme.border} animate-in slide-in-from-top-4 duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Hash size={18} /> Histórico Recente</h3>
            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {readingHistory.length > 0 ? readingHistory.map((h, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setCurrentBook(h.book);
                  setCurrentChapter(h.chapter);
                  setViewMode('VERSES');
                  if (h.verse) {
                    setTimeout(() => jumpToVerse(h.verse), 500);
                  }
                  setShowHistory(false);
                }}
                className={`w-full flex items-center justify-between p-3 ${currentTheme.id === 'black' ? 'bg-white/5' : 'bg-black/5'} rounded-xl text-xs hover:bg-[#8B7355]/20 transition-all text-left`}
              >
                <span>{h.book} {h.chapter}{h.verse ? `:${h.verse}` : ''}</span>
                <span className="text-gray-500">{new Date(h.read_at).toLocaleDateString()}</span>
              </button>
            )) : <p className="text-center text-gray-500 py-4 italic text-xs">Nenhum histórico encontrado.</p>}
          </div>
        </div>
      )}

      {/* TESTAMENT TABS */}
      {viewMode === 'BOOKS' && (
        <div 
          className={`flex ${currentTheme.button} p-1 rounded-2xl mb-8`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            onClick={() => setActiveTab('OT')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'OT' ? `${currentTheme.id === 'black' ? 'bg-white text-black' : 'bg-black text-white'}` : 'text-gray-400'}`}
          >
            Antigo Testamento
          </button>
          <button 
            onClick={() => setActiveTab('NT')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'NT' ? `${currentTheme.id === 'black' ? 'bg-white text-black' : 'bg-black text-white'}` : 'text-gray-400'}`}
          >
            Novo Testamento
          </button>
        </div>
      )}

      {/* SEARCH & FAVORITES */}
      {viewMode === 'BOOKS' && (
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Pesquisar na Bíblia" 
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className={`w-full ${currentTheme.card} border ${currentTheme.border} rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#8B7355] transition-all`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
          <button className={`w-14 h-14 ${currentTheme.button} rounded-2xl flex items-center justify-center text-gray-400 border ${currentTheme.border}`}>
            <Bookmark size={24} />
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="space-y-4">
        {viewMode === 'BOOKS' && (
          <div className="grid grid-cols-1 gap-3">
            {filteredBooks.map(book => {
              const isOffline = offlineBooks.includes(book);
              const bookInfo = BIBLE_STRUCTURE.find(b => b.name === book);
              return (
                <div key={book} className="relative group">
                  <button 
                    onClick={() => { setCurrentBook(book); setViewMode('CHAPTERS'); }}
                    className={`w-full ${currentTheme.card} p-6 rounded-2xl text-left flex items-center justify-between group-hover:bg-[#8B7355]/5 transition-all border ${currentTheme.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{book}</span>
                      {isOffline && <CheckCircle2 size={14} className="text-green-500" title="Disponível Offline" />}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <BookOpen size={18} />
                        <span className="text-xs font-bold">{bookInfo?.chapters || 0}</span>
                      </div>
                    </div>
                  </button>
                  <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isOffline ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveOffline(book); }}
                        className="p-2 text-gray-500 hover:text-red-500 transition-all"
                        title="Remover Offline"
                      >
                        <CloudOff size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadBook(book); }}
                        className="p-2 text-gray-500 hover:text-[#8B7355] transition-all"
                        title="Baixar Livro"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'CHAPTERS' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setViewMode('BOOKS')} className={`p-2 ${currentTheme.button} rounded-full`}><ArrowLeft size={20}/></button>
              <div>
                <h2 className="text-3xl font-bold">{currentBook}</h2>
                <p className="text-gray-500 text-sm">{chaptersInBook.length} Capítulos</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {chaptersInBook.map(c => (
                <button 
                  key={c}
                  onClick={() => { setCurrentChapter(c); setViewMode('VERSES'); }}
                  className={`w-full ${currentTheme.card} p-6 rounded-2xl text-left text-lg font-bold border ${currentTheme.border} ${currentTheme.hover} transition-all`}
                >
                  Capítulo {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'VERSES' && (
          <div className="animate-in fade-in duration-500">
            <div className={`flex items-center justify-between mb-8 sticky top-0 ${currentTheme.bg}/90 backdrop-blur-md py-4 z-40 border-b ${currentTheme.border}`}>
              <button onClick={() => setViewMode('CHAPTERS')} className={`p-2 ${currentTheme.button} rounded-full`}><ArrowLeft size={20}/></button>
              <h2 className="text-sm font-bold">{currentBook} {currentChapter} - {version.includes('NVI') ? 'NVI' : version.includes('ACF') ? 'ACF' : 'Bíblia'}</h2>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleGlobalTheme?.()} 
                  className={`p-2 ${currentTheme.button} rounded-full border ${currentTheme.border} text-gray-400 hover:text-white transition-all`}
                  title="Alternar Tema Claro/Escuro"
                >
                  {globalTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className={`flex items-center ${currentTheme.button} rounded-full border ${currentTheme.border} p-1`}>
                  {BIBLE_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setBibleThemeId(t.id as any)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${t.bg} ${bibleThemeId === t.id ? 'border-[#8B7355] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      title={t.name}
                    />
                  ))}
                </div>
                <button onClick={() => setFontSize(prev => prev === 20 ? 24 : 20)} className={`w-10 h-10 ${currentTheme.button} rounded-full flex items-center justify-center text-xs font-bold border ${currentTheme.border}`}>Aa</button>
              </div>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-8">{currentBook} {currentChapter}</h1>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#8B7355]" size={40} />
                <p className="text-gray-500 italic">Carregando versículos...</p>
              </div>
            ) : (
              <div className="space-y-6 pb-24">
                {loadedChapters[0]?.verses.map(v => {
                  const isSelected = selectedVerse?.verse === v.number;
                  const ref = `${currentBook} ${currentChapter}:${v.number}`;
                  const fullRef = `${currentBook}_${currentChapter}_${v.number}`;
                  const isFav = favoriteVerses.includes(ref);
                  const highlightColor = verseHighlights[fullRef];
                  const highlightData = HIGHLIGHT_COLORS.find(hc => hc.name === highlightColor);

                  return (
                    <div key={v.number} id={`v-${currentBook}-${currentChapter}-${v.number}`} className="relative">
                      <p 
                        onClick={() => handleVerseClick(v.number, currentBook, currentChapter)}
                        className={`leading-relaxed transition-all cursor-pointer ${highlightData ? highlightData.class : ''} ${isSelected ? `${currentTheme.id === 'black' ? 'bg-white/5' : 'bg-black/5'} rounded-lg` : ''}`}
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        <span className={`${currentTheme.accent} font-bold mr-3 text-sm`}>{v.number}</span>
                        <span className={isFav ? `underline decoration-[#8B7355]/40` : ''}>{v.text.replace(/\\/g, '')}</span>
                      </p>

                      {isSelected && (
                        <div className="flex flex-col items-center gap-2 absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="bg-white text-black px-2 py-1.5 rounded-2xl shadow-2xl flex items-center gap-1 border border-gray-200 relative">
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'comment')}} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Comentar"><MessageSquare size={18} /></button>
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'favorite')}} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Favoritar"><Bookmark size={18} fill={isFav ? "black" : "none"} /></button>
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'share')}} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Compartilhar"><Share2 size={18} /></button>
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'social')}} disabled={isPostingToCommunity} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Postar no Mural">{isPostingToCommunity ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}</button>
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'copy')}} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title="Copiar"><Copy size={18} /></button>
                            <button onClick={(e) => {e.stopPropagation(); handleVerseAction(v.number, currentBook, currentChapter, 'color')}} className={`p-2.5 rounded-xl transition-all ${showColorPicker ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Pintar"><Palette size={18} /></button>
                            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
                          </div>

                          {showColorPicker && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200">
                              {HIGHLIGHT_COLORS.map(hc => (
                                <button
                                  key={hc.name}
                                  onClick={(e) => { e.stopPropagation(); handleSaveHighlight(hc.name); }}
                                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${hc.class.split(' ')[0]} ${highlightColor === hc.name ? 'border-black' : 'border-transparent'}`}
                                />
                              ))}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSaveHighlight(null); }}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                                title="Remover Cor"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className={`flex items-center justify-between pt-12 border-t ${currentTheme.border}`}>
                  <button 
                    onClick={handlePrevChapter}
                    className={`flex items-center gap-2 ${currentTheme.button} px-6 py-3 rounded-2xl font-bold text-sm ${currentTheme.hover} transition-all`}
                  >
                    <ArrowLeft size={18} /> Anterior
                  </button>
                  <button 
                    onClick={handleNextChapter}
                    className={`flex items-center gap-2 ${currentTheme.button} px-6 py-3 rounded-2xl font-bold text-sm ${currentTheme.hover} transition-all`}
                  >
                    Próximo <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4">
          <div className="bg-[#8B7355] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2 border border-white/20">
            <Check size={18} /> {feedback}
          </div>
        </div>
      )}

      {/* COMMENT MODAL */}
      {showCommentInput && selectedVerse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCommentInput(false)} />
          <div className={`relative w-full max-w-lg ${currentTheme.card} rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 border ${currentTheme.border}`}>
            <button onClick={() => setShowCommentInput(false)} className="absolute top-6 right-6 text-gray-500 hover:text-red-500 transition-colors"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-2">Anotação</h3>
            <p className={`text-xs ${currentTheme.accent} font-black uppercase tracking-widest mb-6`}>{selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}</p>
            <textarea value={tempComment} onChange={e => setTempComment(e.target.value)} placeholder="Sua reflexão..." className={`w-full min-h-[160px] ${currentTheme.button} rounded-2xl p-6 outline-none text-lg italic border ${currentTheme.border} focus:border-[#8B7355] transition-all`} />
            <button onClick={handleSaveComment} disabled={isSavingComment} className="w-full bg-[#8B7355] text-white py-5 rounded-2xl font-bold shadow-2xl mt-8 flex items-center justify-center gap-3">
              {isSavingComment ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              Salvar Anotação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleView;
