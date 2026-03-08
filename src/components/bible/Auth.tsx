
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';
import { signIn, signUp } from '@/integrations/supabase/bibleDataService';

interface AuthProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function Auth({ onClose, onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signIn(email, password);
        onSuccess();
        onClose();
      } else {
        await signUp(email, password, name);
        // Em vez de fechar, mostramos a mensagem de sucesso para verificação de email
        setIsSignedUp(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Se o registo foi realizado com sucesso, mostramos a ecrã de "Verificar Email"
  if (isSignedUp) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
           <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
           </div>
           <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Verifique seu e-mail</h2>
           <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed italic font-serif">
              Enviamos um link de confirmação para <strong className="text-[#1E40AF]">{email}</strong>. <br/><br/>
              Aceda à sua caixa de entrada e clique no link para ativar a sua conta e começar a sua jornada connosco.
           </p>
           <button 
             onClick={onClose} 
             className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-[#1E40AF]/30 active:scale-95 transition-all uppercase text-xs tracking-widest"
           >
              Entendido, vou verificar
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1E40AF] rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
            <span className="font-serif text-3xl font-bold italic">L</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin 
              ? 'Continue sua jornada de fé connosco.' 
              : 'Junte-se à nossa comunidade de oração.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password"
              placeholder="Sua palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E40AF] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-[#1E40AF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                {isLogin ? 'Entrar' : 'Registar'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm font-bold text-[#1E40AF] hover:underline"
          >
            {isLogin 
              ? 'Não tem uma conta? Registe-se' 
              : 'Já possui uma conta? Entre aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}
