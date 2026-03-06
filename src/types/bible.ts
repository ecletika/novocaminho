
export interface Verse {
    text: string;
    book: string;
    chapter: number;
    verseNumber: number;
    reference: string;
}

export interface DailyBread {
    id: string;
    date: string;
    title: string;
    message: string;
    verse: string;
    prayer: string;
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
