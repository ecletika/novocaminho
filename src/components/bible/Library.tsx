
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, X, Loader2, BookOpen, Eye, Save, Database, Terminal, Info, Globe, Upload, FileText, Maximize, Minimize, Edit, ExternalLink } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Book } from '@/types/bible';
import { getBooks, saveBook, deleteBook, checkIfUserIsAdmin, uploadBookFile } from '@/integrations/supabase/bibleDataService';

interface LibraryViewProps {
  user: User | null;
}

const LibraryView: React.FC<LibraryViewProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const loadBooks = async () => {
    setLoading(true);
    const data = await getBooks();
    if (data === "__TABLE_MISSING__") {
      setTableMissing(true);
    } else {
      setBooks(data as Book[]);
      setTableMissing(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadBooks();
    };
    init();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        const adminFromDb = await checkIfUserIsAdmin(user.email);
        const fullName = (user.user_metadata?.full_name || '').toLowerCase();
        const isHardcodedAdmin = user.email === 'mauricio.junior@ecletika.com' || 
                                fullName.includes('mauricio da silva junior');
        setIsAdmin(adminFromDb || isHardcodedAdmin);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  const handleOpenBook = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setNewTitle(book.title);
    setNewAuthor(book.author);
    setNewDesc(book.description || '');
    setNewPdfUrl(book.pdf_url);
    setNewCoverUrl(book.cover_url);
    setNewCategory(book.category || '');
    setUploadMethod('url');
    setShowAdminModal(true);
  };

  const resetForm = () => {
    setEditingBookId(null);
    setNewTitle('');
    setNewAuthor('');
    setNewDesc('');
    setNewPdfUrl('');
    setNewCoverUrl('');
    setNewCategory('');
    setSelectedFile(null);
    setFormError(null);
    setUploadMethod('file');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newTitle || !newAuthor) {
      setFormError("Título e Autor são obrigatórios.");
      return;
    }

    if (uploadMethod === 'file' && !selectedFile && !editingBookId) {
        setFormError("Selecione um arquivo PDF para upload.");
        return;
    }

    if (uploadMethod === 'url' && !newPdfUrl) {
        setFormError("Insira a URL do arquivo PDF.");
        return;
    }

    setIsSaving(true);
    
    let finalPdfUrl = newPdfUrl;

    if (uploadMethod === 'file' && selectedFile) {
        const uploadedUrl = await uploadBookFile(selectedFile);
        if (!uploadedUrl) {
            setFormError("Erro de Permissão (403). Execute o script SQL de Storage no Supabase.");
            setIsSaving(false);
            return;
        }
        finalPdfUrl = uploadedUrl;
    } else {
        if (finalPdfUrl.includes('drive.google.com') && finalPdfUrl.includes('/view')) {
            finalPdfUrl = finalPdfUrl.replace('/view', '/preview');
        } else if (finalPdfUrl.includes('dropbox.com') && !finalPdfUrl.includes('raw=1')) {
            finalPdfUrl = finalPdfUrl + (finalPdfUrl.includes('?') ? '&raw=1' : '?raw=1');
        }
    }

    const bookData: Partial<Book> = {
      title: newTitle,
      author: newAuthor,
      description: newDesc,
      pdf_url: finalPdfUrl,
      cover_url: newCoverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      category: newCategory || 'Geral'
    };

    if (editingBookId) {
        bookData.id = editingBookId;
    }

    const result = await saveBook(bookData);
    
    if (result.success) {
      await loadBooks();
      setShowAdminModal(false);
      resetForm();
    } else {
      if (result.code === '42P01') setTableMissing(true);
      setFormError(result.error || "Erro ao guardar livro.");
    }
    setIsSaving(false);
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm("Deseja excluir este livro permanentemente?")) return;
    const result = await deleteBook(id);
    if (result.success) loadBooks();
  };

  if (tableMissing) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem] p-10 shadow-xl">
          <Database size={64} className="text-[#1E40AF] mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">Configuração da Livraria</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-left">
            Maurício, execute este script no <strong>SQL Editor</strong> do Supabase para liberar o upload:
          </p>
          
          <div className="bg-gray-900 text-green-400 p-6 rounded-2xl text-left font-mono text-xs overflow-x-auto shadow-inner relative">
             <div className="absolute top-2 right-4 flex items-center gap-2 text-gray-500"><Terminal size={14} /> SQL</div>
             <pre>{`-- SQL para Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true) ON CONFLICT (id) DO UPDATE SET public = true;`}</pre>
          </div>
          
          <button 
            onClick={loadBooks}
            className="mt-10 bg-[#1E40AF] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
          >
            Tentar carregar novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter(b => 
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Livraria Cristã</h1>
          <p className="text-gray-500 dark:text-gray-400">Leitura espiritual online em nova aba.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Buscar livro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm outline-none focus:border-[#1E40AF] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E40AF]" size={18} />
          </div>
          {isAdmin && (
            <button 
              onClick={() => { resetForm(); setShowAdminModal(true); }}
              className="bg-[#1E40AF] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Novo Livro</span>
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#1E40AF]" size={40} />
          <p className="text-gray-400 italic">Carregando acervo...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-gray-800">
           <BookOpen size={48} className="mx-auto mb-4 text-gray-200" />
           <p className="text-gray-500 font-serif italic">Nenhum livro registado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative flex flex-col h-full">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                    onClick={() => handleOpenBook(book.pdf_url)}
                    className="bg-white text-gray-900 p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
                   >
                     <ExternalLink size={24} />
                   </button>
                </div>
              </div>
              <div className="p-5 text-left flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1E40AF] mb-2 block">{book.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-400 font-medium mb-4 italic">{book.author}</p>
                <div className="mt-auto flex gap-2">
                   <button 
                    onClick={() => handleOpenBook(book.pdf_url)}
                    className="flex-1 bg-gray-900 dark:bg-gray-800 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2"
                   >
                     <ExternalLink size={14} /> Abrir Livro
                   </button>
                   {isAdmin && (
                     <div className="flex gap-1">
                        <button onClick={() => handleEditBook(book)} className="p-2.5 text-[#1E40AF] bg-beige-50 dark:bg-gray-800 rounded-xl" title="Editar"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteBook(book.id)} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl"><Trash2 size={16} /></button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => { setShowAdminModal(false); resetForm(); }} />
          <div className="relative w-full max-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 max-h-[90dvh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">
                {editingBookId ? 'Editar Livro' : 'Novo Livro'}
            </h2>
            <form onSubmit={handleAddBook} className="space-y-4 text-left">
              {formError && <p className="text-red-500 text-sm mb-2 font-bold bg-red-50 p-3 rounded-xl">{formError}</p>}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 px-2">Título</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 px-2">Autor</label>
                <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Autor" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-2">Método de Upload</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setUploadMethod('file')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${uploadMethod === 'file' ? 'bg-[#1E40AF] text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>Arquivo PDF</button>
                  <button type="button" onClick={() => setUploadMethod('url')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${uploadMethod === 'url' ? 'bg-[#1E40AF] text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>URL Externa</button>
                </div>
              </div>
              {uploadMethod === 'file' ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all group">
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  {selectedFile ? <span className="text-xs font-bold text-[#1E40AF]">{selectedFile.name}</span> : <><Upload size={32} className="text-gray-300 group-hover:text-[#1E40AF]" /><span className="text-[10px] font-bold text-gray-400 uppercase">Selecionar PDF</span></>}
                </div>
              ) : (
                <input type="url" value={newPdfUrl} onChange={e => setNewPdfUrl(e.target.value)} placeholder="URL do PDF (Google Drive, Dropbox...)" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" />
              )}
              <input type="url" value={newCoverUrl} onChange={e => setNewCoverUrl(e.target.value)} placeholder="URL da Capa (Opcional)" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" />
              <button type="submit" disabled={isSaving} className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold shadow-xl">
                {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Publicar Livro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
