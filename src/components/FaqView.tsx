import React, { useState } from 'react';
import { 
  ChevronDown, 
  Send, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';

interface FaqViewProps {
  onOpenBuyModal: (productId?: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">
          Часто задаваемые вопросы (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Ответы по установке чита, привязке HWID, лаунчеру и способам оплаты.
        </p>
      </div>

      {/* Questions Accordion */}
      <div className="max-w-3xl mx-auto space-y-2.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;

          return (
            <div
              key={idx}
              className="rounded-xl bg-[#101014] border border-white/10 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-sm text-white">
                  {item.question}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  isOpen ? 'rotate-180 text-white' : ''
                }`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-zinc-300 leading-relaxed border-t border-white/5 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Community Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl mx-auto">
        
        {/* Telegram Card */}
        <div className="p-5 rounded-xl bg-[#101014] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-zinc-300" />
              <h3 className="font-bold text-white text-sm">Telegram Канал</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Новости обновлений и поддержка 24/7.
            </p>
          </div>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-white hover:text-zinc-950 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1 shrink-0"
          >
            Открыть <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Discord Card */}
        <div className="p-5 rounded-xl bg-[#101014] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-300" />
              <h3 className="font-bold text-white text-sm">Discord Сообщество</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Тикеты и общение с игроками.
            </p>
          </div>
          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-white hover:text-zinc-950 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1 shrink-0"
          >
            Войти <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>

    </div>
  );
};
