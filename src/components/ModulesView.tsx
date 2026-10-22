import React, { useState } from 'react';
import { 
  Swords, 
  Search, 
  Compass, 
  Eye, 
  Layout, 
  Package, 
  Grid, 
  ShieldAlert, 
  Cpu, 
  Crosshair,
  Footprints,
  Plane,
  FastForward,
  ArrowUpRight,
  Shield,
  HeartHandshake,
  Zap
} from 'lucide-react';
import { MODULES } from '../data/mockData';

interface ModulesViewProps {
  onOpenBuyModal: (productId?: string) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({ onOpenBuyModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToggledModules, setActiveToggledModules] = useState<Record<string, boolean>>({
    aura: true,
    noslow: true,
    sprint: true,
    nofall: true,
    nametags: true
  });

  const categories = ['All', 'Combat', 'Movement', 'Render', 'Player', 'World'];

  const filteredModules = MODULES.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleModule = (id: string) => {
    setActiveToggledModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4" />;
      case 'Crosshair': return <Crosshair className="w-4 h-4" />;
      case 'Plane': return <Plane className="w-4 h-4" />;
      case 'FastForward': return <FastForward className="w-4 h-4" />;
      case 'Footprints': return <Footprints className="w-4 h-4" />;
      case 'ArrowUpRight': return <ArrowUpRight className="w-4 h-4" />;
      case 'Eye': return <Eye className="w-4 h-4" />;
      case 'Layout': return <Layout className="w-4 h-4" />;
      case 'Package': return <Package className="w-4 h-4" />;
      case 'Grid': return <Grid className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-white">
          Модули клиента
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          {MODULES.length} модулей в 5 категориях. Поддержка горячих клавиш и ClickGui.
        </p>

        <div className="max-w-md mx-auto pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск модуля..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-[#141418] border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {cat === 'All' ? 'Все категории' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredModules.map((m) => {
          const isToggled = !!activeToggledModules[m.id];

          return (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                isToggled
                  ? 'bg-[#141418] border-white/30'
                  : 'bg-[#101014] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                      {getModuleIcon(m.iconName)}
                    </div>
                    <span className="font-bold text-white text-sm">
                      {m.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {m.hotkey && (
                      <span className="px-1.5 py-0.5 rounded bg-[#1c1c21] text-[10px] font-mono text-zinc-300">
                        [{m.hotkey}]
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none ${
                        isToggled ? 'bg-white' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-150 ease-in-out ${
                          isToggled ? 'translate-x-4 bg-zinc-950' : 'translate-x-0 bg-zinc-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed min-h-[46px] mb-3">
                  {m.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 rounded bg-[#0b0b0e] text-[10px] font-mono text-zinc-400 border border-white/5">
                  {m.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-2">
        <h3 className="text-lg font-bold text-white">
          Готовы попробовать?
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Получите ключ, скачайте jar и установите в папку mods Fabric 1.21.x.
        </p>
        <button
          onClick={() => onOpenBuyModal('dexum-lifetime')}
          className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer mt-1"
        >
          Купить Dexum Client
        </button>
      </div>

    </div>
  );
};