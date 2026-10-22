import React, { useState } from 'react';
import { 
  X, 
  Gamepad2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'forgot_password';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose
}) => {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>(initialTab);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoHintCode, setDemoHintCode] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetAllFields = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setNeeds2FA(false);
    setTotpCode('');
    setResetStep('request');
    setResetToken('');
    setResetCode('');
    setNewPassword('');
    setDemoHintCode(null);
  };

  const handleTabChange = (tab: 'login' | 'register' | 'forgot_password') => {
    resetAllFields();
    setActiveTab(tab);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password, needs2FA ? totpCode : undefined);
        setIsSubmitting(false);

        if (res.requires2FA) {
          setNeeds2FA(true);
          setErrorMsg('');
          return;
        }

        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.message);
        }
      } else if (activeTab === 'register') {
        const res = await register(name, email, password);
        setIsSubmitting(false);

        if (res.success) {
          setSuccessMsg(res.message);
          if (res.demoCode) {
            setDemoHintCode(res.demoCode);
          }
          setTimeout(() => {
            onClose();
          }, 1800);
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Произошла непредвиденная ошибка');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      if (res.resetToken) setResetToken(res.resetToken);
      if (res.demoCode) setDemoHintCode(res.demoCode);
      setResetStep('verify');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await confirmPasswordReset(resetToken, resetCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Пароль успешно обновлен! Вы можете войти с новым паролем.');
      setDemoHintCode(null);
      setTimeout(() => {
        handleTabChange('login');
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-[#101014] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-2.5">
            {activeTab === 'forgot_password' ? (
              <KeyRound className="w-5 h-5" />
            ) : needs2FA ? (
              <Smartphone className="w-5 h-5 text-amber-400" />
            ) : (
              <Gamepad2 className="w-5 h-5" />
            )}
          </div>

          <h3 className="text-xl font-bold text-white">
            {activeTab === 'forgot_password'
              ? 'Восстановление доступа'
              : needs2FA
              ? 'Двухфакторная защита (2FA)'
              : activeTab === 'login'
              ? 'Вход в аккаунт Dexum'
              : 'Создать аккаунт'}
          </h3>

          <p className="text-xs text-zinc-400 mt-0.5">
            {activeTab === 'forgot_password'
              ? 'Сброс пароля с подтверждением через защищенный код на Email'
              : needs2FA
              ? 'Введите 6-значный одноразовый код из приложения Google Authenticator'
              : activeTab === 'login'
              ? 'Управление вашими лицензиями, HWID и лаунчером'
              : 'Регистрация дает мгновенный доступ к клиенту и CFG'}
          </p>
        </div>

        {activeTab !== 'forgot_password' && !needs2FA && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0b0b0e] border border-white/5 mb-4">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
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
              onClick={() => handleTabChange('register')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-3.5 p-2.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {demoHintCode && (
          <div className="mb-3.5 p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
            <span>Одноразовый код на почту (Демо):</span>
            <span className="font-mono font-bold text-sm bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
              {demoHintCode}
            </span>
          </div>
        )}

        {activeTab === 'forgot_password' && (
          <div className="space-y-3.5">
            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ваш Email адрес:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить код сброса'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    6-значный код подтверждения из письма:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-center text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Новый пароль:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Минимум 6 символов"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Сохранение...' : 'Установить новый пароль'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className="w-full text-center text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Вернуться ко входу
            </button>
          </div>
        )}

        {activeTab === 'login' && needs2FA && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Код Google Authenticator:
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={6}
                placeholder="000 000"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 bg-[#141418] border border-amber-500/30 rounded-xl text-center text-base font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || totpCode.length < 6}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Проверка...' : 'Подтвердить вход'}
            </button>

            <button
              type="button"
              onClick={() => setNeeds2FA(false)}
              className="w-full text-center text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Отмена
            </button>
          </form>
        )}

        {activeTab !== 'forgot_password' && !needs2FA && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Логин:
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Пароль:
                </label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot_password')}
                    className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
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
                ? 'Обработка...'
                : activeTab === 'login'
                ? 'Войти в личный кабинет'
                : 'Зарегистрироваться'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};