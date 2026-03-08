
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { searchDictionary, getDictionaryStats, saveDictionaryEntry, supabase } from '@/integrations/supabase/bibleDataService';
// Added missing icons: Terminal, ListOrdered, Trash2
import { Search, Book, Info, Database, Loader2, X, Plus, Save, History, Sparkles, ChevronRight, Languages, BookOpen, Quote, Star, Scroll, Users, Footprints, MessageCircle, FileText, Upload, CheckCircle2, Terminal, ListOrdered, Trash2 } from 'lucide-react';
import { StrongDefinition } from '@/types/bible';

const GROK_API_KEY = "xai-f4iWZGzvdpQ5k14eCxaFf3i4KuwIdfTOHdkHQgbKGIIV6RZRODjE9CHmWQmUr1TkX3sfV6WHhtL3MFLs";

const DictionaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StrongDefinition[]>([]);
  const [selectedResult, setSelectedResult] = useState<StrongDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbCount, setDbCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // IA / PDF States
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<string | null>(null);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<StrongDefinition[]>([]);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDictionaryStats().then(setDbCount);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const isAdmin = useMemo(() => {
    const email = user?.email || '';
    const fullName = user?.user_metadata?.full_name || '';
    return email === 'mauricio.junior@ecletika.com' || fullName.toLowerCase().includes('mauricio da silva junior');
  }, [user]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setResults([]);
    setSelectedResult(null);
    setIsSearching(true);

    try {
      const data = await searchDictionary(searchTerm);
      setResults(data);
      if (data.length === 1) setSelectedResult(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    if (!(window as any).pdfjsLib) {
      throw new Error("Biblioteca PDF não carregada. Recarregue a página.");
    }
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    // Processar as primeiras 15 páginas para evitar limites de token excessivos
    const pagesToRead = Math.min(pdf.numPages, 15);
    for (let i = 1; i <= pagesToRead; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    setIsProcessingPdf(true);
    setPdfFeedback("Extraindo texto do documento...");

    try {
      const text = await extractTextFromPdf(file);
      setPdfFeedback("Grok analisando conteúdo teológico...");

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { 
              role: "system", 
              content: "É um assistente teológico especialista em léxico bíblico. Sua tarefa é extrair termos importantes do texto fornecido e formatá-los como um ARRAY de objetos JSON seguindo a estrutura de um dicionário bíblico (Strong). " +
                       "Campos necessários por objeto: term, originalWord, transliteration, languagesInfo, definition, etymology, grammaticalForms (array), culturalContext, biblicalOccurrences (array de objetos {reference, text, explanation}), theologicalPerspectives (array de objetos {tradition, view}), practicalApplication. " +
                       "Retorne APENAS o JSON puro, sem explicações."
            },
            { 
              role: "user", 
              content: `Analise o seguinte texto e extraia pelo menos 5 termos bíblicos relevantes em formato JSON:\n\n${text.substring(0, 15000)}` 
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      const data = await response.json();
      
      if (!data || !data.choices || data.choices.length === 0) {
        throw new Error(data?.error?.message || "Resposta vazia da API do Grok.");
      }

      const content = data.choices[0].message.content;
      
      // Tentar extrair o JSON
      let parsed;
      try {
        parsed = JSON.parse(content);
        if (parsed.terms) parsed = parsed.terms; // Lidar com envólucros comuns
        if (!Array.isArray(parsed)) {
            // Se for um único objeto, envolver em array
            parsed = [parsed];
        }
      } catch (e) {
        console.error("Erro ao parsear JSON do Grok:", e);
        throw new Error("Resposta da IA inválida.");
      }

      setAiAnalysisResults(parsed);
      setPdfFeedback(`IA identificou ${parsed.length} novos termos!`);
    } catch (err: any) {
      console.error(err);
      setPdfFeedback(`Erro: ${err.message || "Falha ao processar PDF com Grok"}`);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleSaveAiResults = async () => {
    setIsProcessingPdf(true);
    setPdfFeedback("Salvando termos no acervo sagrado...");
    
    let savedCount = 0;
    for (const entry of aiAnalysisResults) {
        const res = await saveDictionaryEntry(entry);
        if (res.success) savedCount++;
    }

    setPdfFeedback(`Sucesso! ${savedCount} termos adicionados.`);
    setAiAnalysisResults([]);
    getDictionaryStats().then(setDbCount);
    
    setTimeout(() => {
        setPdfFeedback(null);
        setShowAddModal(false);
    }, 3000);
    setIsProcessingPdf(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER DE BUSCA */}
      <div className="bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
          <BookOpen size={300} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight text-center">Léxico de Fé</h1>
          <p className="text-white/80 text-lg md:text-xl font-serif italic mb-10 leading-relaxed text-center">
            Mergulhe na profundidade original das Escrituras.
          </p>
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Digite fe, amor, strong..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none text-gray-900 placeholder-gray-400 rounded-full px-10 py-6 outline-none shadow-2xl focus:ring-8 focus:ring-white/10 transition-all text-xl pr-24"
            />
            <button type="submit" className="absolute right-3 top-3 bg-[#1E40AF] text-white p-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl">
              <Search size={28} />
            </button>
          </form>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest bg-black/10 px-5 py-2.5 rounded-full border border-white/5">
              <Database size={14} className="text-amber-400" /> {dbCount} Termos no Acervo
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddModal(true)} className="bg-white text-[#1E40AF] px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2">
                <Sparkles size={14} /> Módulo IA Grok
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-24 flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-[#1E40AF] animate-spin" />
          <p className="text-[#1E40AF] italic font-serif text-xl animate-pulse">Sintonizando as origens...</p>
        </div>
      )}

      {/* RESULTADOS MÚLTIPLOS */}
      {!loading && results.length > 1 && !selectedResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="col-span-full mb-4">
            <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-200">Escolha o termo desejado:</h2>
          </div>
          {results.map((res, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedResult(res)}
              className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between group text-left"
            >
              <div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">{res.term}</h3>
                <p className="text-xs text-[#1E40AF] font-bold uppercase tracking-widest mt-1 opacity-60 line-clamp-1">{res.languagesInfo}</p>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-[#1E40AF] transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* RESULTADO SELECIONADO (DOSSIÊ COMPLETO) */}
      {!loading && selectedResult ? (
        <div className="animate-in slide-in-from-bottom-8 duration-700 text-left space-y-12">
           {results.length > 1 && (
             <button onClick={() => setSelectedResult(null)} className="flex items-center gap-2 text-[#1E40AF] font-black uppercase text-[10px] tracking-widest hover:underline">
               <ChevronRight size={16} className="rotate-180" /> Voltar aos resultados
             </button>
           )}
           
           {/* HEADER DO TERMO */}
           <header className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 text-[#1E40AF] pointer-events-none"><Quote size={220} /></div>
              <div className="space-y-4">
                <h2 className="text-7xl md:text-9xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tighter">
                  {selectedResult.term}
                </h2>
                <div className="text-4xl md:text-5xl font-serif text-[#1E40AF] py-4 border-y border-gray-100 dark:border-gray-800 inline-block px-12">
                   {selectedResult.originalWord} {selectedResult.transliteration && <span className="text-2xl text-gray-400">({selectedResult.transliteration})</span>}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-gray-500 font-serif italic text-lg">
                 <span className="bg-gray-50 dark:bg-gray-800 px-6 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                   {selectedResult.languagesInfo}
                 </span>
                 {selectedResult.pronunciation && (
                   <span className="bg-gray-50 dark:bg-gray-800 px-6 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                     Pronúncia: {selectedResult.pronunciation}
                   </span>
                 )}
              </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DEFINIÇÃO */}
            <section className="col-span-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-[3rem] p-10 md:p-14 border-l-[12px] border-amber-500 shadow-xl relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Star size={24} /></div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-700 dark:text-amber-400">Definição Teológica</h3>
              </div>
              <p className="text-2xl md:text-3xl text-gray-800 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-wrap italic">
                {selectedResult.definition}
              </p>
            </section>

            {/* ETIMOLOGIA */}
            {selectedResult.etymology && (
              <section className="bg-white dark:bg-gray-950 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg"><History size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Etimologia</h3>
                </div>
                <p className="text-xl text-gray-700 dark:text-gray-300 font-serif leading-relaxed italic">
                  {selectedResult.etymology}
                </p>
              </section>
            )}

            {/* FORMAS GRAMATICAIS */}
            {selectedResult.grammaticalForms && selectedResult.grammaticalForms.length > 0 && (
              <section className="bg-white dark:bg-gray-950 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Scroll size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Formas Gramaticais</h3>
                </div>
                <ul className="space-y-3">
                   {selectedResult.grammaticalForms.map((form, i) => (
                     <li key={i} className="text-lg font-serif text-gray-800 dark:text-gray-200 flex items-center gap-2">
                       <div className="w-2 h-2 bg-purple-400 rounded-full"></div> {form}
                     </li>
                   ))}
                </ul>
              </section>
            )}

            {/* CONTEXTO CULTURAL */}
            {selectedResult.culturalContext && (
              <section className="bg-white dark:bg-gray-950 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Users size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Contexto Cultural</h3>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-serif leading-relaxed">
                  {selectedResult.culturalContext}
                </p>
              </section>
            )}

            {/* OCORRÊNCIAS BÍBLICAS */}
            {selectedResult.biblicalOccurrences && selectedResult.biblicalOccurrences.length > 0 && (
              <section className="col-span-full bg-white dark:bg-gray-950 rounded-[3rem] p-10 md:p-14 border border-gray-100 dark:border-gray-800 shadow-2xl">
                 <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Book size={24} /></div>
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-700 dark:text-indigo-400">Ocorrências Bíblicas</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {selectedResult.biblicalOccurrences.map((occ, i) => (
                     <div key={i} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
                       <h4 className="text-[#1E40AF] font-black uppercase tracking-widest text-[10px]">{occ.reference}</h4>
                       <p className="text-xl font-serif italic text-gray-800 dark:text-gray-200">"{occ.text}"</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{occ.explanation}</p>
                     </div>
                   ))}
                 </div>
              </section>
            )}

            {/* PERSPECTIVAS TEOLÓGICAS */}
            {selectedResult.theologicalPerspectives && selectedResult.theologicalPerspectives.length > 0 && (
              <section className="col-span-full bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] p-10 border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><MessageCircle size={20} /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-700 dark:text-indigo-400">Perspectivas Teológicas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {selectedResult.theologicalPerspectives.map((persp, i) => (
                     <div key={i} className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-indigo-400">{persp.tradition}</span>
                        <p className="text-gray-700 dark:text-gray-300 font-serif leading-relaxed text-lg">{persp.view}</p>
                     </div>
                   ))}
                </div>
              </section>
            )}

            {/* APLICAÇÃO PRÁTICA */}
            {selectedResult.practicalApplication && (
              <section className="col-span-full bg-[#1E40AF] text-white rounded-[3rem] p-12 shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000"><Footprints size={240} /></div>
                <div className="relative z-10">
                  <Sparkles size={32} className="mx-auto mb-6 text-amber-300 animate-pulse" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 mb-6">Aplicação Prática na Jornada</h3>
                  <p className="text-2xl md:text-4xl font-serif italic leading-tight max-w-4xl mx-auto drop-shadow-md">
                    {selectedResult.practicalApplication}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      ) : !loading && isSearching && searchTerm ? (
        <div className="py-24 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
           <Search size={64} className="mx-auto mb-4 text-gray-100 dark:text-gray-800" />
           <p className="text-gray-500 font-serif italic text-xl">Não encontramos nada para "{searchTerm}".</p>
           {isAdmin && (
             <button onClick={() => setShowAddModal(true)} className="mt-6 text-[#1E40AF] font-bold underline flex items-center gap-2 mx-auto">
               <Plus size={16} /> Registar "{searchTerm}" no acervo
             </button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left opacity-60">
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-[#1E40AF]/10 text-[#1E40AF] rounded-3xl flex items-center justify-center shrink-0"><Book size={32} /></div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Busca Inteligente</h3>
                <p className="text-sm text-gray-500">Normalização por vogais e acentos.</p>
              </div>
           </div>
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-[#556B2F]/10 text-[#556B2F] rounded-3xl flex items-center justify-center shrink-0"><Scroll size={32} /></div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Dossiê Completo</h3>
                <p className="text-sm text-gray-500">História, gramática e ocorrências.</p>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE ADIÇÃO (IA GROK / MANUAL) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isProcessingPdf && setShowAddModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Sparkles className="text-amber-500" /> Assistente IA Grok
              </h2>
              <button onClick={() => setShowAddModal(false)} disabled={isProcessingPdf} className="text-gray-400 hover:text-red-500"><X size={28} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="space-y-6">
                  <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-[2.5rem] text-center group cursor-pointer hover:border-amber-500 transition-all" onClick={() => pdfInputRef.current?.click()}>
                    <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfUpload} disabled={isProcessingPdf} />
                    <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                       {isProcessingPdf ? <Loader2 className="animate-spin" size={40} /> : <FileText size={40} />}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Importar do PDF</h4>
                    <p className="text-sm text-gray-500 mt-2">Grok analisará o texto e extrairá os termos para si.</p>
                  </div>
                  
                  {pdfFeedback && (
                    <div className="p-4 bg-gray-900 text-amber-500 rounded-2xl font-mono text-xs flex items-center gap-3 animate-pulse">
                       <Terminal size={16} /> {pdfFeedback}
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><ListOrdered size={18} /> Termos Identificados pela IA</h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                     {aiAnalysisResults.length === 0 ? (
                       <div className="py-20 text-center opacity-30 border-2 border-dashed border-gray-100 rounded-[2rem]">
                          <p className="text-sm italic">Nenhum termo processado ainda.</p>
                       </div>
                     ) : (
                       aiAnalysisResults.map((entry, idx) => (
                         <div key={idx} className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-between group">
                            <div className="text-left">
                               <p className="font-bold text-[#1E40AF]">{entry.term}</p>
                               <p className="text-[10px] text-gray-400 uppercase font-black">{entry.originalWord}</p>
                            </div>
                            <button onClick={() => setAiAnalysisResults(prev => prev.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                         </div>
                       ))
                     )}
                  </div>
                  
                  {aiAnalysisResults.length > 0 && (
                    <button 
                        onClick={handleSaveAiResults}
                        disabled={isProcessingPdf}
                        className="w-full bg-[#1E40AF] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {isProcessingPdf ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Guardar tudo no Acervo
                    </button>
                  )}
               </div>
            </div>
            
            <div className="pt-8 border-t border-gray-50 dark:border-gray-800 text-center">
               <p className="text-xs text-gray-400 font-serif italic">Integração alimentada pela inteligência Grok da xAI</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryView;
