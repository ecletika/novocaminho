
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Trash2, X, Loader2, Settings, ShoppingBag, Minus, CheckCircle2 as CheckIcon, Zap, ExternalLink, ShieldCheck } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Product, CartItem } from '@/types/bible';
import { getProducts, saveProduct, deleteProduct, checkIfUserIsAdmin } from '@/integrations/supabase/bibleDataService';

interface ShopViewProps {
  user: User | null;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product) => void;
}

type CheckoutStep = 'cart' | 'payment_details' | 'processing' | 'success';

const SUMUP_PAY_LINK = "https://pay.sumup.com/b2c/QO1BJO4C";

const ShopView: React.FC<ShopViewProps> = ({ user, cart, setCart, addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await loadProducts();
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newName || !newPrice || !newCategory || !newImage) {
      setFormError("Por favor, preencha todos os campos.");
      return;
    }
    setIsSaving(true);
    const result = await saveProduct(newName, parseFloat(newPrice.replace(',', '.')), newCategory, newImage);
    if (result.success) {
      await loadProducts();
      setShowAdminModal(false);
      setNewName(''); setNewPrice(''); setNewCategory(''); setNewImage('');
    } else {
      setFormError(result.error || "Erro desconhecido ao guardar.");
    }
    setIsSaving(false);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const startCheckout = () => {
    setCheckoutStep('cart');
    setShowCheckoutModal(true);
  };

  const processPayment = () => {
    setCheckoutStep('processing');
    setTimeout(() => {
      setCart([]);
      window.location.href = SUMUP_PAY_LINK;
    }, 1500);
  };

  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const category = p.category || '';
    const searchLow = (searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(searchLow) ||
           category.toLowerCase().includes(searchLow);
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">Lojinha Gospel</h1>
          <p className="text-gray-500 dark:text-gray-400">Produtos que edificam e inspiram sua caminhada.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm outline-none focus:border-[#1E40AF] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E40AF]" size={18} />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => { setFormError(null); setShowAdminModal(true); }}
              className="bg-[#1E40AF] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-2"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>
          )}

          <button 
            onClick={startCheckout}
            className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-[#1E40AF] relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm"
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1E40AF] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-gray-950 animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#1E40AF]" size={40} />
          <p className="text-gray-400 italic">Carregando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
           <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
           <p className="text-gray-500 font-serif italic">Nenhum produto em stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative">
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6 text-left">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1E40AF] mb-2 block">{product.category}</span>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[#1E40AF] transition-colors h-12 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">€ {product.price.toFixed(2).replace('.', ',')}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-gray-900 dark:bg-gray-800 text-white p-2.5 rounded-xl hover:bg-[#1E40AF] transition-colors shadow-lg active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCheckoutModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCheckoutModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">
                  {checkoutStep === 'cart' ? 'O Meu Carrinho' : 'Finalizar com SumUp'}
                </h2>
                <p className="text-xs text-[#1E40AF] font-bold uppercase tracking-widest mt-1">Total: € {cartTotal.toFixed(2).replace('.', ',')}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {checkoutStep === 'cart' && (
                <div className="space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-10">
                      <ShoppingBag size={64} className="mx-auto text-gray-100 mb-4" />
                      <p className="text-gray-500 italic font-serif">Seu carrinho está vazio.</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center text-left">
                          <img src={item.product.image} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.product.name}</h4>
                            <p className="text-[#1E40AF] font-bold text-sm">€ {item.product.price.toFixed(2).replace('.', ',')}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 bg-gray-50 dark:bg-gray-900 rounded-lg"><Minus size={12} /></button>
                              <span className="text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 bg-gray-50 dark:bg-gray-900 rounded-lg"><Plus size={12} /></button>
                              <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setCheckoutStep('payment_details')} className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 mt-6">
                        Pagar Agora <Zap size={18} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {checkoutStep === 'payment_details' && (
                <div className="space-y-6 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2rem] border-2 border-blue-100 dark:border-blue-800">
                    <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />
                    <h4 className="font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">SumUp Express</h4>
                    <p className="text-sm text-gray-500">Você será redirecionado para concluir o pagamento de forma 100% segura.</p>
                  </div>
                  <button onClick={processPayment} className="w-full bg-[#0052FF] text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">
                    Ir para Checkout <ExternalLink size={18} />
                  </button>
                  <button onClick={() => setCheckoutStep('cart')} className="text-xs text-gray-400 uppercase font-bold tracking-widest">Voltar</button>
                </div>
              )}

              {checkoutStep === 'processing' && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                  <Loader2 className="animate-spin text-[#0052FF]" size={64} />
                  <h3 className="text-xl font-serif font-bold">Abrindo SumUp...</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowAdminModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <h2 className="text-2xl font-serif font-bold mb-8">Novo Produto</h2>
            <form onSubmit={handleAddProduct} className="space-y-5 text-left">
              {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Preço (€)" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Categoria" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              <input type="url" value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="URL Imagem" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none" required />
              <button type="submit" disabled={isSaving} className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold">
                {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopView;
