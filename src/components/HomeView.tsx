import React from 'react';
import { 
  Swords, 
  RefreshCw, 
  Zap, 
  Flame, 
  ArrowRight, 
  Check, 
  Download
} from 'lucide-react';
import { ViewMode } from '../types';
import { PRODUCTS, MODULES } from '../data/mockData';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onOpenBuyModal: (productId?: string) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenBuyModal
}) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-8 text-center max-w-4xl mx-auto space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141418] border border-white/10 text-zinc-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
          DEXUM CLIENT • FABRIC 1.21.x
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Приватный мод Dexum для Minecraft 1.21
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Aura, TriggerBot, AimAssist, NoSlow, NoFall, ClickGui с drag &amp; drop панелями,
          система конфигов и команд, Friend-система с ESP и HUD. Fabric 1.21.x.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="hero-buy-lifetime-btn"
            onClick={() => onOpenBuyModal('dexum-lifetime')}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-zinc-200 text-zinc-950 shadow-lg shadow-white/5 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            Купить Lifetime — 1,990 ₽
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-explore-modules-btn"
            onClick={() => onNavigate('modules')}
            className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-[#18181b] border border-white/10 text-zinc-300 hover:text-white hover:bg-[#27272a] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-zinc-300" />
            Список модулей (28)
          </button>

          <button
            id="hero-all-plans-btn"
            onClick={() => onNavigate('store')}
            className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-[#121215] border border-white/10 text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            Все тарифы от 490 ₽
          </button>
        </div>

      </section>

      {/* 2. СОВМЕСТИМОСТЬ */}
      <section className="p-6 rounded-2xl bg-[#111114] border border-white/10">
        <div className="text-center mb-5">
          <h2 className="text-base font-bold text-white">
            Совместимость
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Работает как клиентский мод — сервер не видит разницы
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {[
            { name: 'Minecraft 1.21.x', status: 'Поддерживается', sub: 'Fabric Loader' },
            { name: 'Vanilla Servers', status: 'Совместимо', sub: 'Любые сервера' },
            { name: 'Fabric Servers', status: 'Совместимо', sub: 'С модами' },
            { name: 'Windows 10 / 11', status: 'Поддерживается', sub: 'x64' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0b0b0e] border border-white/5 text-center">
              <h4 className="font-bold text-white text-xs">{item.name}</h4>
              <div className="text-[11px] font-mono text-zinc-300 mt-1">
                {item.status}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PRICING CARDS */}
      <section id="pricing-section" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white">
            Тарифы Dexum
          </h2>
          <p className="text-xs text-zinc-400">
            Один клиент, три срока. Моментальная выдача ключа после оплаты.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PRODUCTS.map((prod) => {
            const isLifetime = prod.id === 'dexum-lifetime';

            return (
              <div
                key={prod.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  isLifetime
                    ? 'bg-[#141418] border-2 border-white/40 shadow-xl'
                    : 'bg-[#101014] border border-white/10 hover:border-white/20'
                }`}
              >
                {prod.badge && (
                  <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded bg-white text-zinc-950 font-mono font-bold text-[9px] uppercase tracking-wider">
                    {prod.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-zinc-400 min-h-[32px]">
                    {prod.tagline}
                  </p>

                  <div className="my-4 pb-4 border-b border-white/5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white font-mono">
                        {prod.price} ₽
                      </span>
                      {prod.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          {prod.originalPrice} ₽
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {prod.durationLabel}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-zinc-300">
                    {prod.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-200 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  id={`buy-plan-${prod.id}`}
                  onClick={() => onOpenBuyModal(prod.id)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLifetime
                      ? 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md shadow-white/5'
                      : 'bg-[#1c1c21] hover:bg-white hover:text-zinc-950 text-white border border-white/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Купить за {prod.price} ₽
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. МОДУЛИ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Модули клиента
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {MODULES.length} модулей в 5 категориях
            </p>
          </div>
          <button
            onClick={() => onNavigate('modules')}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            Смотреть все модули
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MODULES.slice(0, 6).map((mod) => (
            <div
              key={mod.id}
              className="p-4 rounded-xl bg-[#101014] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">
                    {mod.name}
                  </span>
                  {mod.hotkey && (
                    <span className="px-1.5 py-0.5 rounded bg-[#1c1c21] border border-white/10 text-[10px] font-mono text-zinc-300">
                      [{mod.hotkey}]
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3 min-h-[44px]">
                  {mod.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex flex-wrap gap-1">
                {mod.bypasses.map((byp, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-[#0b0b0e] text-[10px] font-mono text-zinc-400 border border-white/5">
                    ✓ {byp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY DEXUM */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#111114] border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              ClickGui на Right Shift
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Панели по категориям, поиск модулей, drag &amp; drop. Позиции сохраняются между сессиями.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Система конфигов
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Автосохранение при выходе, ручные профили через <code className="text-zinc-200">.config save</code>.
              Файлы в папке <code className="text-zinc-200">dexum/configs/</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Команды и бинды
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Управление через чат: <code className="text-zinc-200">.bind</code>,{' '}
              <code className="text-zinc-200">.toggle</code>,{' '}
              <code className="text-zinc-200">.friend</code>. Автодополнение в чате.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};