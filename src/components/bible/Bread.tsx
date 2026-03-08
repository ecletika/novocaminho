
import React, { useState, useEffect } from 'react';
import { DailyBread } from '@/types/bible';
import { Coffee, Edit3, Save, Sparkles, Loader2, Heart, CheckCircle2, Database, Terminal, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getDailyBread } from '@/integrations/supabase/bibleDataService';

interface BreadViewProps {
  dailyBread: DailyBread | null;
}

const BreadView: React.FC<BreadViewProps> = ({ dailyBread: initialBread }) => {
  const [bread, setBread] = useState<DailyBread | null>(initialBread);
  const [loading, setLoading] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [reflection, setReflection] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Data inicial local
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toLocaleDateString('en-CA'));

  useEffect(() => {
    const fetchBread = async () => {
      setLoading(true);
      try {
        const data = await getDailyBread(selectedDate);
        setBread(data);
        setTableMissing(false);
      } catch (err: any) {
        if (err.code === 'PGRST204' || err.code === '42P01' || err.message?.includes('not found')) {
          setTableMissing(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBread();
  }, [selectedDate]);

  const handleSaveReflection = () => {
    if (!reflection.trim()) return;
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setReflection('');
    }, 2000);
  };

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toLocaleDateString('en-CA'));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const isToday = selectedDate === new Date().toLocaleDateString('en-CA');

  if (tableMissing) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] p-10 shadow-xl">
          <Database size={64} className="text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">Tabela Necessária</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-left">
            Maurício, a tabela <strong>daily_bread</strong> não foi encontrada. Rode o SQL abaixo no Supabase:
          </p>
          
          <div className="bg-gray-900 text-green-400 p-6 rounded-2xl text-left font-mono text-xs overflow-x-auto shadow-inner relative">
             <div className="absolute top-2 right-4 flex items-center gap-2 text-gray-500"><Terminal size={14} /> SQL</div>
             <pre>{`CREATE TABLE daily_bread (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  verse TEXT NOT NULL,
  prayer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_bread ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select Public" ON daily_bread FOR SELECT USING (true);`}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* NAVEGAÇÃO DE DATA */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => navigateDate(-1)} 
          className="p-3 text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-full transition-all active:scale-90"
          title="Dia Anterior"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest mb-1">
            <CalendarIcon size={12} />
            {isToday ? 'Hoje' : 'Navegando no Acervo'}
          </div>
          <span className="font-serif font-bold text-gray-900 dark:text-gray-100 text-lg">
            {formatDate(selectedDate)}
          </span>
          {!isToday && (
            <button 
              onClick={() => setSelectedDate(new Date().toLocaleDateString('en-CA'))}
              className="mt-2 text-[10px] font-black uppercase text-[#1E40AF] underline hover:opacity-70"
            >
              Voltar para Hoje
            </button>
          )}
        </div>

        <button 
          onClick={() => navigateDate(1)} 
          className="p-3 text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-full transition-all active:scale-90"
          title="Próximo Dia"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-6">
          <Loader2 className="animate-spin text-[#1E40AF]" size={64} />
          <p className="text-[#1E40AF] italic font-serif text-xl animate-pulse">Sintonizando com o Céu...</p>
        </div>
      ) : !bread ? (
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 text-center border-4 border-dashed border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
           <Clock size={80} className="mx-auto mb-6 text-gray-200 dark:text-gray-700" />
           <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">Ainda em Preparo</h2>
           <p className="text-gray-500 dark:text-gray-400 font-serif italic text-lg mb-6 max-w-lg mx-auto leading-relaxed">
             Não encontramos uma mensagem para esta data.
           </p>
           
           <p className="text-gray-400 text-sm">
             Use as setas acima para navegar ou aguarde a nova revelação ser publicada.
           </p>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 text-left">
          {/* HEADER DO PÃO */}
          <header className="bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden text-center">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
               <Coffee size={280} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-2 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
                   <Sparkles size={14} className="text-amber-300" /> Alimento do Dia
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight italic drop-shadow-md">
                   "{bread.title}"
                </h1>
                <p className="text-white/60 font-bold tracking-[0.3em] uppercase text-xs">
                  {formatDate(bread.date)}
                </p>
             </div>
          </header>

          <div className="grid grid-cols-1 gap-10">
            {/* MENSAGEM */}
            <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Coffee size={180} /></div>
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-[#1E40AF]/10 text-[#1E40AF] rounded-2xl flex items-center justify-center"><Edit3 size={24} /></div>
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#1E40AF]">A Palavra</h3>
               </div>
               <div className="font-serif text-xl md:text-2xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap italic">
                 {bread.message}
               </div>
            </section>

            {/* VERSÍCULO */}
            <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-14 shadow-xl border-l-[16px] border-[#1E40AF]/40 relative">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-[#1E40AF] text-white rounded-2xl flex items-center justify-center shadow-lg"><Database size={24} /></div>
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#1E40AF]">Versículo Chave</h3>
               </div>
               <p className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4 italic">
                  "{bread.verse}"
               </p>
            </section>

            {/* ORAÇÃO */}
            <section className="bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] text-white rounded-[4rem] p-12 text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               <div className="relative z-10 space-y-6">
                <Heart size={48} className="mx-auto text-red-400 animate-pulse" fill="currentColor" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-80">Momento com Deus</h3>
                <p className="text-3xl md:text-4xl font-serif italic leading-tight text-white drop-shadow-md">
                  "{bread.prayer}"
                </p>
               </div>
            </section>

            {/* DIÁRIO */}
            <section className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-[#1E40AF]/20 shadow-2xl">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="font-serif font-bold text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Edit3 size={28} className="text-[#1E40AF]" /> Minha Resposta de Fé
                  </h4>
               </div>
               <textarea 
                 value={reflection} 
                 onChange={(e) => setReflection(e.target.value)} 
                 placeholder="O que Deus falou consigo hoje através desta palavra?" 
                 className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[2rem] p-8 min-h-[160px] outline-none font-serif text-xl italic text-gray-800 dark:text-gray-200 shadow-inner transition-all focus:ring-4 ring-[#1E40AF]/10" 
               />
               <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSaveReflection} 
                    className={`flex items-center gap-3 px-12 py-5 rounded-full font-bold text-lg shadow-2xl transition-all active:scale-95 ${saveSuccess ? 'bg-green-500 text-white' : 'bg-[#1E40AF] text-white hover:bg-[#1e3a8a]'}`}
                  >
                    {saveSuccess ? <CheckCircle2 size={24} /> : <Save size={24} />}
                    {saveSuccess ? 'Guardado!' : 'Guardar no Diário'}
                  </button>
               </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreadView;
