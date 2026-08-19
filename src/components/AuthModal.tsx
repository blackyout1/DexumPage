import React, { useState } from 'react';
import { 
  X, 
  Gamepad2, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose
}) => {
  const { login, register, users, switchDemoUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [minecraftNick, setMinecraftNick] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (activeTab === 'login') {
        const res = login(email, password);
        setIsSubmitting(false);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.message);
        }
      } else {
        const res = register(name, email, password, minecraftNick);
        setIsSubmitting(false);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.message);
        }
      }
    }, 400);
  };

  const handleQuickLogin = (userId: string) => {
    switchDemoUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-[#101014] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-2.5">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {activeTab === 'login' ? 'Вход в аккаунт Dexum' : 'Создать аккаунт'}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeTab === 'login'
              ? 'Авторизуйтесь для управления лицензиями и лаунчером'
              : 'Регистрация дает доступ к покупкам и базе CFG'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0b0b0e] border border-white/5 mb-4">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-rose-950/80 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Логин / Никнейм:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ваш логин"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ник в Minecraft (IGN):
                </label>
                <input
                  type="text"
                  placeholder="Ник персонажа на сервере"
                  value={minecraftNick}
                  onChange={e => setMinecraftNick(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Email адрес:
            </label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Пароль:
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md shadow-white/5 transition-colors cursor-pointer disabled:opacity-50 mt-1"
          >
            {isSubmitting
              ? 'Проверка...'
              : activeTab === 'login'
              ? 'Войти в личный кабинет'
              : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-5 pt-3.5 border-t border-white/5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block text-center mb-2">
            Быстрый тестовый вход (1 клик):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.id)}
                className="p-1.5 px-2 rounded-lg bg-[#0b0b0e] border border-white/5 hover:border-white/15 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-semibold text-white truncate text-[11px]">{u.name.split(' ')[0]}</div>
                <div className="text-[9px] text-zinc-400 font-mono">
                  {u.role === 'admin' ? '👑 Admin' : u.licenses.length > 0 ? '💎 Lifetime' : '🎮 User'}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
