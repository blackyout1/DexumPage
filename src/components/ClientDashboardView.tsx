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
  AlertCircle
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
    orders 
  } = useAuth();

  const [inputKey, setInputKey] = useState('');
  const [activationMessage, setActivationMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [hwidToast, setHwidToast] = useState<string | null>(null);
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [mcNick, setMcNick] = useState(currentUser?.minecraftNick || '');

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
          Для доступа к подпискам, загрузке лаунчера и сбросу HWID войдите в свой аккаунт.
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

  const handleSaveNick = () => {
    if (mcNick.trim()) {
      updateMinecraftNick(mcNick.trim());
    }
    setIsEditingNick(false);
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

      {/* Top Profile Card */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
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
            </div>

            {/* Minecraft Nick Editor */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-400">Ник в игре:</span>
              {isEditingNick ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={mcNick}
                    onChange={e => setMcNick(e.target.value)}
                    className="px-2 py-0.5 bg-[#18181c] border border-white/20 rounded text-xs text-white font-mono"
                  />
                  <button onClick={handleSaveNick} className="text-white hover:text-zinc-300 p-1 cursor-pointer">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-200">{currentUser.minecraftNick || 'Не указан'}</span>
                  <button onClick={() => setIsEditingNick(true)} className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              HWID: <span className="text-zinc-400">{currentUser.hwid || 'Не привязан (привяжется при первом входе)'}</span>
            </p>
          </div>
        </div>

        {/* Quick Buy CTA */}
        <button
          onClick={() => onOpenBuyModal('dexum-lifetime')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
        >
          Купить подписку
        </button>

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
                        className="px-2.5 py-1 rounded-lg bg-[#18181c] hover:bg-white hover:text-zinc-950 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedKeyId === lic.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-200" />
                            Скопирован
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Копировать
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hardware binding info */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Привязка: {lic.hwid ? <span className="text-zinc-300">{lic.hwid}</span> : <span className="text-zinc-400 font-medium">Ожидает первого входа</span>}</span>
                      {lic.lastHwidReset && (
                        <span>Последний сброс: {lic.lastHwidReset}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#101014] border border-white/10 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#141418] border border-white/5 flex items-center justify-center text-zinc-500 mx-auto">
                  <Key className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">У вас пока нет активных лицензий</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Купите подписку в магазине или активируйте подарочный ключ для доступа к лаунчеру.
                </p>
                <button
                  onClick={() => onOpenBuyModal('dexum-lifetime')}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs cursor-pointer mt-1"
                >
                  Перейти в каталог
                </button>
              </div>
            )}
          </div>

          {/* Download Center */}
          <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-zinc-300" />
                Центр загрузок лаунчера
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Поддерживает Windows 10/11 x64 с авто-подгрузкой последних версий.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Launcher EXE */}
              <div className="p-4 rounded-xl bg-[#0b0b0e] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white font-mono">DexumLauncher.exe</span>
                    <span className="text-[10px] font-mono text-zinc-400">42.8 MB</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    Основной установщик с графическим интерфейсом.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLauncher('DexumLauncher_v4.4.2.exe')}
                  className="w-full py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать .EXE (Windows)
                </button>
              </div>

              {/* Jar version */}
              <div className="p-4 rounded-xl bg-[#0b0b0e] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white font-mono">Dexum_Mod.jar</span>
                    <span className="text-[10px] font-mono text-zinc-400">38.2 MB</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    Мод-версия для Fabric 1.21 и NeoForge 1.21.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLauncher('Dexum_Universal_v4.4.2.jar')}
                  className="w-full py-2 rounded-lg bg-[#18181c] hover:bg-[#24242a] text-zinc-200 border border-white/5 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать .JAR
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Key Activation & Order History */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Key Activation Box */}
          <div className="p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Key className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Активация ключа
              </h3>
            </div>

            <p className="text-xs text-zinc-400">
              Купили ключ у реселлера? Введите его здесь для привязки к аккаунту.
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

    </div>
  );
};
