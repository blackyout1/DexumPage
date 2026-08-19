import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Flame, 
  Check, 
  ShieldCheck, 
  FolderArchive, 
  Cpu, 
  Zap
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

interface StoreViewProps {
  onOpenBuyModal: (productId?: string) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({ onOpenBuyModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'client' | 'configs' | 'spoofer'>('all');

  const filteredProducts = selectedCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">
          Каталог продуктов Dexum
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Официальные тарифы чита, спуфера и базы конфигов с моментальной активацией.
        </p>

        {/* Promo Code Notification */}
        <div className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#18181c] border border-white/10 text-xs text-zinc-300 font-mono">
          Промокод <span className="font-bold text-zinc-950 bg-white px-1.5 py-0.5 rounded">DEXUM</span> дает скидку 15% при заказе
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {[
          { id: 'all', label: 'Все товары', icon: ShoppingCart },
          { id: 'client', label: 'Клиенты', icon: Zap },
          { id: 'configs', label: 'Конфиги CFG', icon: FolderArchive },
          { id: 'spoofer', label: 'HWID Spoofer', icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'bg-[#141418] border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const isLifetime = prod.id === 'dexum-lifetime';

          return (
            <div
              key={prod.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isLifetime
                  ? 'bg-[#141418] border-2 border-white/40 shadow-lg'
                  : 'bg-[#101014] border border-white/10 hover:border-white/20'
              }`}
            >
              {prod.badge && (
                <div className="absolute -top-2.5 right-5 px-2.5 py-0.5 rounded bg-white text-zinc-950 font-mono font-bold text-[9px] uppercase tracking-wider">
                  {prod.badge}
                </div>
              )}

              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase mb-1">
                  {prod.category} • {prod.version}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {prod.name}
                </h3>
                <p className="text-xs text-zinc-400 min-h-[34px] leading-relaxed">
                  {prod.tagline}
                </p>

                {/* Price */}
                <div className="my-4 py-3 border-y border-white/5 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white font-mono">
                        {prod.price} ₽
                      </span>
                      {prod.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          {prod.originalPrice} ₽
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {prod.durationLabel}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    {prod.downloadSize}
                  </span>
                </div>

                {/* Versions */}
                <div className="space-y-2 mb-5">
                  <div className="text-[11px] text-zinc-400 font-mono">
                    <span>Версии MC: </span>
                    <span className="text-zinc-200">{prod.supportedVersions.join(', ')}</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {prod.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-200 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
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

      {/* Security note */}
      <div className="p-4 rounded-xl bg-[#111114] border border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>Ключ и лаунчер доступны сразу в Личном кабинете после завершения платежа.</span>
        </div>
      </div>

    </div>
  );
};
