
import React, { useState, useEffect } from 'react';
import { AppView, Verse, Devotional, DailyBread, CartItem, Product } from '@/types/bible';
import Navbar from '@/components/bible/Navbar';
import HomeView from '@/components/bible/Home';
import BibleView from '@/components/bible/Bible';
import DevotionalsView from '@/components/bible/Devotionals';
import BreadView from '@/components/bible/Bread';
import DictionaryView from '@/components/bible/Dictionary';
import ReflectionsView from '@/components/bible/Reflections';
import PrayerJournal from '@/components/bible/PrayerJournal';
import ShopView from '@/components/bible/Shop';
import CommunityView from '@/components/bible/Community';
import LibraryView from '@/components/bible/Library';
import CouplesStudyView from '@/components/bible/CouplesStudy';
import PurposesView from '@/components/bible/Purposes';
import ProfileView from '@/components/bible/Profile';
import Auth from '@/components/bible/Auth';
import { getRandomWisdomVerse, getDailyDevotional, getDailyBread, supabase, updateUserStreak } from '@/integrations/supabase/bibleDataService';
import { User } from '@supabase/supabase-js';
import { ArrowLeft } from 'lucide-react';

const BibliaPage: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.BIBLE);
    const [history, setHistory] = useState<AppView[]>([]);
    const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
    const [dailyDevo, setDailyDevo] = useState<Devotional | null>(null);
    const [dailyBread, setDailyBread] = useState<DailyBread | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshingVerse, setIsRefreshingVerse] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showAuth, setShowAuth] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && document.documentElement) {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light';
    });

    const [bibleNav, setBibleNav] = useState<{ book: string, chapter: number, verse?: number }>({ book: 'Atos', chapter: 2, verse: 42 });
    const [selectedDevoFromRef, setSelectedDevoFromRef] = useState<Devotional | null>(null);

    // Efeito para rolar para o topo sempre que a visualização mudar
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [view]);

    useEffect(() => {
        const initApp = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                updateUserStreak(currentUser.id);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                const u = session?.user ?? null;
                setUser(u);
                if (u) updateUserStreak(u.id);
            });

            setLoading(false);

            return () => {
                subscription.unsubscribe();
            };
        };

        initApp();
    }, []);

    const navigateTo = (newView: AppView) => {
        if (newView !== view) {
            setHistory(prev => [...prev, view]);
            setView(newView);
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevView = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setView(prevView);
        } else {
            setView(AppView.BIBLE);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleReadChapter = (book: string, chapter: number, verse?: number) => {
        setBibleNav({ book, chapter, verse });
        navigateTo(AppView.BIBLE);
    };

    const handleViewDevotional = (devo: Devotional) => {
        setSelectedDevoFromRef(devo);
        navigateTo(AppView.DEVOTIONALS);
    };

    const renderView = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
                    <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center">
                        <p className="text-[#1E40AF] font-serif italic text-xl dark:text-blue-400 mb-1">Invocando as Escrituras...</p>
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Biblia Diária está carregando</p>
                    </div>
                </div>
            );
        }

        switch (view) {
            case AppView.HOME:
                return (
                    <HomeView
                        verse={dailyVerse}
                        devotional={dailyDevo}
                        bread={dailyBread}
                        user={user}
                        onReadChapter={handleReadChapter}
                        onViewDevotional={handleViewDevotional}
                        onAuthRequired={() => setShowAuth(true)}
                        setView={navigateTo}
                    />
                );
            case AppView.BIBLE:
                return (
                    <BibleView
                        user={user}
                        initialBook={bibleNav.book}
                        initialChapter={bibleNav.chapter}
                        initialVerse={bibleNav.verse}
                        onAuthRequired={() => setShowAuth(true)}
                        globalTheme={theme}
                        toggleGlobalTheme={toggleTheme}
                    />
                );
            case AppView.PURPOSES:
                return <PurposesView onReadChapter={handleReadChapter} />;
            case AppView.DEVOTIONALS:
                return <DevotionalsView user={user} initialDevotional={selectedDevoFromRef || dailyDevo} onAuthRequired={() => setShowAuth(true)} />;
            case AppView.BREAD:
                return <BreadView dailyBread={dailyBread} />;
            case AppView.DICTIONARY:
                return <DictionaryView />;
            case AppView.REFLECTIONS:
                return <ReflectionsView user={user} onAuthRequired={() => setShowAuth(true)} onReadChapter={handleReadChapter} onViewDevotional={handleViewDevotional} />;
            case AppView.PRAYER:
                return <PrayerJournal user={user} onAuthRequired={() => setShowAuth(true)} />;
            case AppView.SHOP:
                return <ShopView user={user} cart={cart} setCart={setCart} addToCart={addToCart} />;
            case AppView.COMMUNITY:
                return <CommunityView user={user} onAuthRequired={() => setShowAuth(true)} />;
            case AppView.LIVRARIA:
                return <LibraryView user={user} />;
            case AppView.COUPLES:
                return <CouplesStudyView user={user} onAuthRequired={() => setShowAuth(true)} />;
            case AppView.PROFILE:
                return <ProfileView user={user} onAuthRequired={() => setShowAuth(true)} setView={navigateTo} onReadChapter={handleReadChapter} onViewDevotional={handleViewDevotional} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4FD] dark:bg-gray-950 transition-colors duration-300 pt-0">
            <Navbar
                currentView={view}
                setView={navigateTo}
                user={user}
                onAuthClick={() => setShowAuth(true)}
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <main className={`${view === AppView.BIBLE || view === AppView.COUPLES || view === AppView.PROFILE ? 'max-w-none px-6' : 'max-w-5xl px-4'} mx-auto pt-24 md:pt-32 pb-20 transition-all duration-500`}>
                {view !== AppView.HOME && (
                    <div className="mb-6 flex animate-in slide-in-from-left-4 duration-300">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 text-[#1E40AF] rounded-full shadow-md hover:shadow-lg transition-all border border-beige-200 dark:border-gray-800 font-bold text-sm uppercase tracking-widest active:scale-95 group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </button>
                    </div>
                )}
                {renderView()}
            </main>
            {showAuth && <Auth onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
            <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p className="font-serif italic">&copy; 2024 Biblia Diária - Espalhando a Palavra</p>
            </footer>
        </div>
    );
};

export default BibliaPage;
