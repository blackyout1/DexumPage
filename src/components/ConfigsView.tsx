import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Star, 
  Check 
} from 'lucide-react';
import { CLOUD_CONFIGS } from '../data/mockData';
import { CloudConfig } from '../types';

export const ConfigsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<string>('All');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const servers = ['All', 'HvH', 'Legit', 'Semi-Rage'];

  const filteredConfigs = CLOUD_CONFIGS.filter(cfg => {
    const matchesServer = selectedServer === 'All' || cfg.server === selectedServer;
    const matchesSearch = cfg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cfg.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cfg.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cfg.playstyle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesServer && matchesSearch;
  });

  const handleDownloadConfig = (cfg: CloudConfig) => {
    setDownloadingId(cfg.id);

    const configData = {
      client: "Dexum Client",
      name: cfg.name,
      server: cfg.server,
      playstyle: cfg.playstyle,
      author: cfg.author,
      timestamp: new Date().toISOString(),
      modules: {
        Aura: { enabled: true, distance: 6.0, critsOnly: true, smartSprint: false },
        TriggerBot: { enabled: true, onlyCriticalHit: true },
        NoSlow: { enabled: true, mode: 'Vanilla' },
        Sprint: { enabled: true },
        NoFall: { enabled: true, mode: 'Vanilla' },
        NoPush: { enabled: true, players: true, water: true },
        Nametags: { enabled: true, showHealth: true, showPing: true }
      }
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cfg.name.replace(/\s+/g, '_').toLowerCase()}.cfg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingId(null);
    }, 800);
  };

  return (
    <div className="space-y-8 pb-16">
      
      <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-white">
          Примеры конфигов (.CFG)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Стартовые пресеты. Скачайте .cfg и положите в{' '}
          <code className="text-zinc-200">dexum/configs/</code>, затем{' '}
          <code className="text-zinc-200">.config load &lt;name&gt;</code>
        </p>

        <div className="max-w-md mx-auto pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или стилю..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {servers.map((srv) => (
          <button
            key={srv}
            onClick={() => setSelectedServer(srv)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedServer === srv
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-[#141418] border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {srv === 'All' ? 'Все стили' : srv}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConfigs.map((cfg) => {
          const isDownloading = downloadingId === cfg.id;

          return (
            <div
              key={cfg.id}
              className="p-5 rounded-2xl bg-[#101014] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#1c1c21] text-[10px] font-mono text-zinc-300 border border-white/5">
                    {cfg.server} • {cfg.playstyle}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300">
                    <Star className="w-3 h-3 fill-zinc-300" />
                    <span>{cfg.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {cfg.name}
                </h3>
                <p className="text-xs text-zinc-400 min-h-[36px] leading-relaxed mb-3">
                  {cfg.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#0b0b0e] border border-white/5 space-y-1 text-[11px] font-mono text-zinc-400 mb-4">
                  <div className="flex justify-between">
                    <span>Стиль:</span>
                    <span className="text-zinc-200">{cfg.playstyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Модулей:</span>
                    <span className="text-zinc-200">{cfg.modulesCount} шт.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Обновлено:</span>
                    <span className="text-zinc-200">{cfg.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Автор: <strong className="text-zinc-400">{cfg.author}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => handleDownloadConfig(cfg)}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1c1c21] hover:bg-white hover:text-zinc-950 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Check className="w-3 h-3 text-zinc-200" />
                      Загружен
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Скачать CFG
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};