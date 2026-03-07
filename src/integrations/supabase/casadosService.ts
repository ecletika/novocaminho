
import { supabase } from "@/integrations/supabase/client";

export const getCasadosOnlineTopics = async () => {
    const { data } = await supabase
        .from('casados_online_topics')
        .select('*')
        .order('position', { ascending: true });
    return data || [];
};

export const getCasadosOnlineLessons = async (topicId: string) => {
    const { data } = await supabase
        .from('casados_online_lessons')
        .select('*')
        .eq('topic_id', topicId)
        .order('position', { ascending: true });
    return data || [];
};

export const getCasadosOnlineProgress = async (userId: string) => {
    const { data } = await supabase
        .from('casados_online_progress')
        .select('lesson_id')
        .eq('user_id', userId);
    return (data || []).map(d => d.lesson_id);
};

export const markCasadosLessonRead = async (userId: string, lessonId: string) => {
    const { error } = await supabase
        .from('casados_online_progress')
        .upsert({ user_id: userId, lesson_id: lessonId });
    return !error;
};

export const saveCasadosTopic = async (topic: any) => {
    const { data, error } = await supabase.from('casados_online_topics').upsert(topic).select().single();
    return { success: !error, data };
};

export const saveCasadosLesson = async (lesson: any) => {
    const { data, error } = await supabase.from('casados_online_lessons').upsert(lesson).select().single();
    return { success: !error, data };
};

export const deleteCasadosTopic = async (id: string) => {
    const { error } = await supabase.from('casados_online_topics').delete().eq('id', id);
    return !error;
};

export const deleteCasadosLesson = async (id: string) => {
    const { error } = await supabase.from('casados_online_lessons').delete().eq('id', id);
    return !error;
};

export const uploadCasadosFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('casados-material').upload(fileName, file);

    if (error) {
        console.error("Erro no upload:", error);
        return { publicUrl: null, error };
    }

    const { data: { publicUrl } } = supabase.storage.from('casados-material').getPublicUrl(data.path);
    return { publicUrl, error: null };
};
