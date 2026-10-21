import React, { useState } from 'react';
import { 
  Crown, 
  Key, 
  Users, 
  RotateCcw, 
  Ban, 
  Check, 
  Copy, 
  Search,
  DollarSign,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/mockData';
import { AccessDeniedCard } from './AccessDeniedCard';

export const AdminPanelView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    orders, 
    adminGenerateKey, 
    adminToggleBan, 
    adminResetUserHwid,
    adminDeleteUser,
    adminClearAllUsers
  } = useAuth();

  const [selectedProduct, setSelectedProduct] = useState<string>('dexum-lifetime');
  const [selectedDuration, setSelectedDuration] = useState<'30' | '90' | 'lifetime'>('lifetime');
  const [generatedKey, setGeneratedKey] = useState<{ key: string; expiresAt: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <AccessDeniedCard
        requiredRole="admin"
        currentRole={currentUser?.role || 'guest'}
        featureName="Панель администратора Dexum"
      />
    );
  }

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.amount : 0), 0);
  const totalBuyers = users.filter(u => u.licenses.length > 0).length;
  const totalActiveLicenses = users.reduce((sum, u) => sum + u.licenses.filter(l => l.status === 'active').length, 0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = adminGenerateKey(selectedProduct, selectedDuration);
    setGeneratedKey(res);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey.key);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.minecraftNick && u.minecraftNick.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.hwid && u.hwid.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111114] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-white text-xs font-mono font-semibold border border-white/15 mb-2">
            <Crown className="w-3.5 h-3.5" />
            ПАНЕЛЬ УПРАВЛЕНИЯ
          </div>
          <h1 className="text-2xl font-bold text-white">
            Администрация Dexum
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Генерация ключей, управление HWID и мониторинг пользователей.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#0b0b0e] border border-white/5 text-right">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block">Статус:</span>
          <span className="text-xs font-mono font-semibold text-zinc-200">
            ONLINE & ACTIVE
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-[#101014] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Выручка</span>
            <DollarSign className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {totalRevenue.toLocaleString()} ₽
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {orders.length} завершенных заказов
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101014] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Покупатели</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {totalBuyers} / {users.length}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Конверсия: {Math.round((totalBuyers / (users.length || 1)) * 100)}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#101014] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Активные ключи</span>
            <Key className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {totalActiveLicenses}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Без блокировок
          </div>
        </div>

      </div>

      {/* Grid: Key Generator on Left + Users Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Key Generator */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Key className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Генератор лицензионных ключей
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            
            {/* Product selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Выберите продукт:
              </label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
              >
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price} ₽)
                  </option>
                ))}
              </select>
            </div>

            {/* Duration selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Срок действия:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '30', label: '30 Дней' },
                  { id: '90', label: '90 Дней' },
                  { id: 'lifetime', label: 'Lifetime' }
                ].map(dur => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDuration === dur.id
                        ? 'bg-white text-zinc-950 font-bold shadow-sm'
                        : 'bg-[#141418] border border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Сгенерировать ключ
            </button>
          </form>

          {/* Result Key Box */}
          {generatedKey && (
            <div className="p-3 rounded-xl bg-[#0b0b0e] border border-white/10 space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Ключ ({generatedKey.expiresAt}):
              </span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#141418] border border-white/5">
                <span className="font-mono text-xs font-bold text-zinc-200 select-all truncate mr-2">
                  {generatedKey.key}
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2 py-1 rounded bg-[#1c1c21] hover:bg-white hover:text-zinc-950 text-[11px] font-semibold text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {isCopied ? <Check className="w-3 h-3 text-zinc-200" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Скопирован' : 'Копировать'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: User & HWID Management Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101014] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-white">
                Пользователи и HWID ({users.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Wipe All Registered Accounts Button */}
              <button
                type="button"
                onClick={() => {
                  const conf = window.confirm('ВНИМАНИЕ! Вы уверены, что хотите СТЕРЕТЬ ВСЕ зарегистрированные аккаунты? Останется только ваш профиль администратора.');
                  if (conf) {
                    adminClearAllUsers();
                    alert('Все тестовые и зарегистрированные аккаунты успешно удалены!');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Очистить всю базу пользователей"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                Стереть все аккаунты
              </button>

              <div className="relative">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-7 pr-3 py-1 bg-[#141418] border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`p-3 rounded-xl border transition-colors ${
                  u.isBanned
                    ? 'bg-rose-950/30 border-rose-500/40 opacity-75'
                    : 'bg-[#0b0b0e] border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{u.name}</span>
                        <span className={`text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded ${
                          u.role === 'admin' ? 'bg-white/15 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Ник: {u.minecraftNick || '—'}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono truncate max-w-[220px]">
                        HWID: {u.hwid || 'Не привязан'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => adminResetUserHwid(u.id)}
                      className="p-1.5 rounded-lg bg-[#18181c] hover:bg-[#24242a] text-zinc-300 transition-colors cursor-pointer"
                      title="Сбросить HWID"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>

                    {u.role !== 'admin' && (
                      <>
                        <button
                          type="button"
                          onClick={() => adminToggleBan(u.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.isBanned
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                          title={u.isBanned ? 'Разблокировать' : 'Заблокировать'}
                        >
                          <Ban className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Удалить аккаунт "${u.name}" (${u.email})?`)) {
                              adminDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white transition-colors cursor-pointer"
                          title="Удалить аккаунт навсегда"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                </div>

                <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>Лицензий: {u.licenses.length}</span>
                  <span>Регистрация: {u.registeredAt}</span>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
