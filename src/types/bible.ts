
export interface PurposeContent {
    id: string;
    purpose_id: string;
    day_number: number;
    title: string;
    content: string;
    verse_references: string[];
}

export interface Verse {
    text: string;
    book: string;
    chapter: number;
    verseNumber: number;
    reference: string;
}

export interface BiblicalOccurrence {
    reference: string;
    text: string;
    explanation: string;
}

export interface TheologicalPerspective {
    tradition: string;
    view: string;
}

export interface RelatedWord {
    word: string;
    meaning: string;
}

export interface StrongDefinition {
    term: string;
    originalWord: string;
    transliteration: string;
    languagesInfo: string;
    pronunciation: string;
    definition: string;
    etymology: string;
    grammaticalForms: string[];
    periodUsage: string;
    culturalContext: string;
    biblicalOccurrences: BiblicalOccurrence[];
    relatedWords: RelatedWord[];
    synonyms: string[];
    theologicalPerspectives: TheologicalPerspective[];
    practicalApplication: string;
}

export interface Devotional {
    id: string;
    title: string;
    summary: string;
    content: string;
    historicalContext?: string;
    deepReflection?: string;
    practicalApplication?: string;
    prayer?: string;
    date: string;
    author: string;
    user_id?: string;
    purpose_id?: string;
    day_number?: number;
    bg_color?: string;
    image_url?: string;
}

export interface CouplesTopic {
    id: string;
    title: string;
    position: number;
}

export interface CouplesLesson {
    id: string;
    topic_id: string;
    title: string;
    content: string;
    pdf_url?: string;
    image_url?: string;
    video_url?: string;
    position: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    created_at?: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    pdf_url: string;
    cover_url: string;
    category: string;
    created_at?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface DailyBread {
    id: string;
    date: string;
    title: string;
    message: string;
    verse: string;
    prayer: string;
}

export interface PrayerRequest {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_answered: boolean;
    created_at: string;
}

export const AppView = {
    HOME: 'home',
    BIBLE: 'bible',
    PURPOSES: 'purposes',
    DEVOTIONALS: 'devotionals',
    BREAD: 'bread',
    DICTIONARY: 'dictionary',
    REFLECTIONS: 'reflections',
    PRAYER: 'prayer',
    SHOP: 'shop',
    COMMUNITY: 'community',
    LIVRARIA: 'livraria',
    COUPLES: 'couples',
    PROFILE: 'profile'
} as const;

export type AppView = typeof AppView[keyof typeof AppView];
