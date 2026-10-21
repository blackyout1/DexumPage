import React, { useState } from 'react';
import { 
  Download, 
  Key, 
  RotateCcw, 
  Check, 
  Copy, 
  ShieldCheck, 
  User as UserIcon, 
  CheckCircle2, 
  ShoppingBag,
  Edit2,
  Save,
  AlertCircle,
  Smartphone,
  MailCheck,
  Lock,
  QrCode,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ClientDashboardViewProps {
  onOpenBuyModal: (productId?: string) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  onOpenBuyModal,
  onOpenAuth
}) => {
  const { 
    currentUser, 
    resetHwid, 
    activateKey, 
    updateMinecraftNick, 
    orders,
    confirmEmailVerification,
    setup2FA,
    enable2FA,
    disable2FA
  } = useAuth();

  const [inputKey, setInputKey] = useState('');
  const [activationMessage, setActivationMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [hwidToast, setHwidToast] = useState<string | null>(null);

  // 2FA Setup Dialog states
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaSuccess, setTwoFaSuccess] = useState('');

  // Email Verification modal / state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!currentUser) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#141418] border border-white/10 flex items-center justify-center text-white mx-auto">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Личный кабинет Dexum
        </h2>
        <p className="text-xs text-zinc-400">
          Для доступа к подпискам, загрузке лаунчера, двухфакторной защите и сбросу HWID войдите в свой аккаунт.
        </p>
        <div className="flex justify-center gap-2.5 pt-2">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Войти в аккаунт
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 rounded-xl bg-[#18181b] border border-white/10 text-white font-semibold text-xs hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            Регистрация
          </button>
        </div>
      </div>
    );
  }

  const handleCopyKey = (keyString: string, id: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleResetHwid = (licId: string) => {
    const res = resetHwid(licId);
    setHwidToast(res.message);
    setTimeout(() => setHwidToast(null), 4000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsActivating(true);
    setTimeout(() => {
      const res = activateKey(inputKey);
      setIsActivating(false);
      setActivationMessage({
        success: res.success,
        text: res.message
      });
      if (res.success) {
        setInputKey('');
      }
    }, 600);
  };

  const handleDownloadLauncher = (filename: string) => {
    const fakeLauncher = `REM Dexum Official Launcher Bootstrap\nECHO Starting Dexum Client v4.4.2 for Minecraft...\n`;
    const blob = new Blob([fakeLauncher], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Open 2FA setup modal
  const handleOpen2FASetup = async () => {
    setTwoFaError('');
    setTwoFaSuccess('');
    setVerificationCode('');
    setTwoFaLoading(true);
    setIs2FAModalOpen(true);

    const res = await setup2FA();
    setTwoFaLoading(false);
    if (res.success && res.qrCode && res.secret) {
      setQrCodeUrl(res.qrCode);
      setTotpSecret(res.secret);
    } else {
      setTwoFaError(res.message || 'Ошибка генерации 2FA');
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSecret || !verificationCode.trim()) return;
    setTwoFaLoading(true);
    setTwoFaError('');

    const res = await enable2FA(totpSecret, verificationCode);
    setTwoFaLoading(false);
    if (res.success) {
      setTwoFaSuccess(res.message);
      setTimeout(() => {
        setIs2FAModalOpen(false);
      }, 1500);
    } else {
      setTwoFaError(res.message);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Введите текущий 6-значный код из Google Authenticator для отключения:');
    if (!code) return;
    const res = await disable2FA(code);
    alert(res.message);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode.trim()) return;
    const res = await confirmEmailVerification(emailCode);
    setEmailMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailMsg(null);
        setEmailCode('');
      }, 1500);
    }
  };

  const userOrders = orders.filter(o => o.userId === currentUser.id);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification */}
      {hwidToast && (
        <div className="p-3.5 bg-zinc-900 border border-white/20 rounded-xl text-xs text-zinc-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>{hwidToast}</span>
        </div>
      )}

      {/* Top Profile Card with 2FA and Security Badges */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                currentUser.role === 'admin' 
                  ? 'bg-white/15 text-white border border-white/20' 
                  : currentUser.licenses.length > 0 
                  ? 'bg-zinc-800 text-zinc-200 border border-white/15' 
                  : 'bg-[#18181c] text-zinc-400 border border-white/5'
              }`}>
                {currentUser.role === 'admin' ? '👑 Администратор' : currentUser.licenses.length > 0 ? '💎 Покупатель' : 'Игрок'}
              </span>

              {/* Email verification badge */}
              {currentUser.isEmailVerified ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                  <MailCheck className="w-3 h-3" /> Почта подтверждена
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <AlertCircle className="w-3 h-3" /> Подтвердить Email
                </button>
              )}

              {/* 2FA Status Badge */}
              {currentUser.totpEnabled ? (
                <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 2FA Включена
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 text-[10px] font-mono">
                  2FA Выключена
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 font-mono mt-1">
              HWID: <span className="text-zinc-400">{currentUser.hwid || 'Не привязан'}</span>
            </p>
          </div>
        </div>

        {/* Security Controls & Buy CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {currentUser.totpEnabled ? (
            <button
              onClick={handleDisable2FA}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Отключить 2FA
            </button>
          ) : (
            <button
              onClick={handleOpen2FASetup}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-xs text-blue-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-medium"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              Подключить Google Authenticator
            </button>
          )}

          <button
            onClick={() => onOpenBuyModal('dexum-lifetime')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Купить подписку
          </button>
        </div>

      </div>

      {/* Main Grid: Subscriptions / Downloads on Left + Key Activation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Licenses & Downloads */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Subscriptions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
                Мои активные лицензии
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                Всего: {currentUser.licenses.length}
              </span>
            </div>

            {currentUser.licenses.length > 0 ? (
              <div className="space-y-3">
                {currentUser.licenses.map((lic) => (
                  <div
                    key={lic.id}
                    className="p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{lic.productName}</h3>
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-white text-[9px] font-mono font-bold border border-white/15">
                            АКТИВНА
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">
                          Истекает: <strong className="text-zinc-200">{lic.expiresAt}</strong>
                        </span>
                      </div>

                      {/* HWID Reset Button */}
                      <button
                        type="button"
                        onClick={() => handleResetHwid(lic.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#24242a] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-zinc-300" />
                        Сбросить HWID
                      </button>
                    </div>

                    {/* License Key Display & Copy */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0b0e] border border-white/5">
                      <div className="overflow-hidden mr-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                          Лицензионный ключ:
                        </span>
                        <span className="font-mono text-xs font-bold text-zinc-200 truncate select-all">
                          {lic.key}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyKey(lic.key, lic.id)}
                        className="px-2.5 py-1 rounded bg-[#18181c] hover:bg-[#24242a] border border-white/10 text-xs text-zinc-200 font-mono flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      >
                        {copiedKeyId === lic.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Скопирован</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px]">Копировать</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hardware binding info */}
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
                      <span>Привязка к ПК: <strong className="text-zinc-300 font-mono">{lic.hwid ? 'Привязан' : 'Свободен'}</strong></span>
                      {lic.lastHwidReset && (
                        <span className="text-zinc-500 text-[10px]">Посл. сброс: {lic.lastHwidReset}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#101014] border border-white/10 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">У вас еще нет активных подписок</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Приобретите подписку или активируйте ключ, чтобы разблокировать доступ к читу и лаунчеру.
                </p>
                <button
                  onClick={() => onOpenBuyModal('dexum-lifetime')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Выбрать тариф
                </button>
              </div>
            )}
          </div>

          {/* Downloads Section */}
          <div className="p-6 rounded-2xl bg-[#101014] border border-white/10 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-zinc-300" />
                Загрузка лаунчера & клиента (1.21)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Автономный лаунчер сам установит Fabric / NeoForge и настроит оптимальные JVM-аргументы.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0b0b0e] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">DexumLauncher.exe</div>
                  <div className="text-[10px] text-zinc-400 font-mono">Windows 10 / 11 (x64) • 42.8 MB</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLauncher('DexumLauncher.exe')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0b0e] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Dexum-Fabric-1.21.jar</div>
                  <div className="text-[10px] text-zinc-400 font-mono">Мод для Fabric Loader • 24.1 MB</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLauncher('Dexum-Fabric-1.21.jar')}
                  className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#24242a] border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать JAR
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Key Activation & Order History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Key Activation Box */}
          <div className="p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-zinc-300" />
              <h3 className="text-sm font-bold text-white">
                Активация лицензионного ключа
              </h3>
            </div>

            <p className="text-xs text-zinc-400">
              Купили ключ на FunPay или у реселлера? Введите его здесь для привязки к аккаунту.
            </p>

            {activationMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                activationMessage.success
                  ? 'bg-zinc-900 text-zinc-200 border border-white/20'
                  : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
              }`}>
                {activationMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-zinc-200 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{activationMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleActivate} className="space-y-2.5">
              <input
                type="text"
                placeholder="DXM-XXXX-XXXX-XXXX"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0b0e] border border-white/10 rounded-lg text-xs text-white font-mono uppercase tracking-wider placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={isActivating || !inputKey.trim()}
                className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isActivating ? 'Проверка...' : 'Активировать ключ'}
              </button>
            </form>
          </div>

          {/* Orders History */}
          <div className="p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-white">
                История покупок
              </h3>
            </div>

            {userOrders.length > 0 ? (
              <div className="space-y-2">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl bg-[#0b0b0e] border border-white/5 text-xs space-y-0.5"
                  >
                    <div className="flex justify-between font-semibold text-white">
                      <span className="truncate mr-2">{ord.productName}</span>
                      <span className="font-mono text-zinc-200 shrink-0">{ord.amount} ₽</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{ord.date}</span>
                      <span className="text-zinc-300 uppercase">Оплачено ({ord.paymentMethod})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-3 font-mono">
                История заказов пуста
              </p>
            )}
          </div>

        </div>

      </div>

      {/* 2FA SETUP MODAL (GOOGLE AUTHENTICATOR) */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#101014] border border-white/10 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            
            <button
              onClick={() => setIs2FAModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Authenticator (2FA)</h3>
                <p className="text-xs text-zinc-400">Защита аккаунта от взлома и кражи лицензии</p>
              </div>
            </div>

            {twoFaError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{twoFaError}</span>
              </div>
            )}

            {twoFaSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{twoFaSuccess}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                1. Откройте приложение <strong>Google Authenticator</strong> на телефоне.
              </p>
              <p>
                2. Отсканируйте этот QR-код камерой приложения:
              </p>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0b0b0e] border border-white/10">
                {qrCodeUrl ? (
                  <div className="p-3 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 block" />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-zinc-500">
                    <QrCode className="w-10 h-10 animate-pulse" />
                  </div>
                )}
                {totpSecret && (
                  <div className="mt-3.5 w-full text-center">
                    <span className="text-[11px] text-zinc-400 block mb-1">
                      Либо добавьте в приложение вручную:
                    </span>
                    <div className="flex items-center justify-center gap-2 p-2 bg-[#141418] border border-white/10 rounded-lg">
                      <span className="font-mono text-xs font-bold text-amber-300 select-all tracking-wider">
                        {totpSecret.match(/.{1,4}/g)?.join(' ') || totpSecret}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(totpSecret);
                          alert('Секретный ключ скопирован: ' + totpSecret);
                        }}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white cursor-pointer"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirm2FA} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    3. Введите 6-значный код из Google Authenticator для проверки:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={twoFaLoading || verificationCode.length < 6}
                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {twoFaLoading ? 'Проверка...' : 'Включить защиту 2FA'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#101014] border border-white/10 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <MailCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Подтверждение Email</h3>
                <p className="text-xs text-zinc-400">{currentUser.email}</p>
              </div>
            </div>

            {emailMsg && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                emailMsg.success
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                <span>{emailMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-3 text-xs">
              <p className="text-zinc-400">
                Введите 6-значный код подтверждения, отправленный на ваш почтовый ящик.
              </p>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-значный код"
                  value={emailCode}
                  onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={emailCode.length < 4}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Подтвердить почту
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
