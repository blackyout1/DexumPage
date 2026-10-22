import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { StoreView } from './components/StoreView';
import { ModulesView } from './components/ModulesView';
import { ConfigsView } from './components/ConfigsView';
import { ClientDashboardView } from './components/ClientDashboardView';
import { AdminPanelView } from './components/AdminPanelView';
import { FaqView } from './components/FaqView';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { ViewMode, SoftwareProduct } from './types';
import { PRODUCTS } from './data/mockData';
import { 
  Swords, 
  Send, 
  MessageSquare, 
  ExternalLink,
  ShoppingBag
} from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<SoftwareProduct | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleOpenBuyModal = (productId?: string) => {
    const prod = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
    setSelectedProductForBuy(prod);
    setIsBuyModalOpen(true);
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handlePaymentSuccess = (_key: string) => {
    // Keep modal open so user can copy key
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-white selection:text-black font-sans antialiased delta-grid-bg">
      
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenAuth={handleOpenAuth}
        onOpenBuyModal={handleOpenBuyModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'home' && (
          <HomeView
            onNavigate={setCurrentView}
            onOpenBuyModal={handleOpenBuyModal}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'store' && (
          <StoreView onOpenBuyModal={handleOpenBuyModal} />
        )}

        {currentView === 'modules' && (
          <ModulesView onOpenBuyModal={handleOpenBuyModal} />
        )}

        {currentView === 'configs' && (
          <ConfigsView />
        )}

        {currentView === 'client_dashboard' && (
          <ClientDashboardView
            onOpenBuyModal={handleOpenBuyModal}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'admin_panel' && (
          <AdminPanelView />
        )}

        {currentView === 'faq' && (
          <FaqView onOpenBuyModal={handleOpenBuyModal} />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0c0c0f] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Swords className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-base tracking-wider text-white">DEXUM CLIENT</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Приватный мод для Minecraft 26.2 на Fabric Loader. 28 модулей, ClickGui, система конфигов и команд.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Разделы</h4>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>
                  <button onClick={() => setCurrentView('store')} className="hover:text-white transition-colors cursor-pointer">
                    Тарифы
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('modules')} className="hover:text-white transition-colors cursor-pointer">
                    Модули клиента
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('configs')} className="hover:text-white transition-colors cursor-pointer">
                    Примеры конфигов
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('client_dashboard')} className="hover:text-white transition-colors cursor-pointer">
                    Личный кабинет & HWID
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Совместимость</h4>
              <div className="flex flex-wrap gap-1 text-[10px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-[#141418] border border-white/5">Minecraft 26.2</span>
                <span className="px-2 py-0.5 rounded bg-[#141418] border border-white/5">Fabric Loader</span>
                <span className="px-2 py-0.5 rounded bg-[#141418] border border-white/5">Vanilla Servers</span>
                <span className="px-2 py-0.5 rounded bg-[#141418] border border-white/5">Windows 10 / 11</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Купить и Поддержка</h4>
              <div className="flex flex-col gap-1.5">
                <a
                  href="https://funpay.com/uk/users/11146533/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 text-xs text-amber-300 hover:text-white flex items-center justify-between transition-colors font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    Купить на FunPay
                  </span>
                  <ExternalLink className="w-3 h-3 text-amber-400/70" />
                </a>

                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#202026] border border-white/5 text-xs text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-zinc-400" />
                    Telegram Канал
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>

                <a
                  href="https://discord.gg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#202026] border border-white/5 text-xs text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    Discord Сервер
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>

          </div>

          <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span>© 2026 Dexum Client. Все права защищены.</span>
            <span>Minecraft является товарным знаком Mojang AB.</span>
          </div>
        </div>
      </footer>

      <PaymentCheckoutModal
        product={selectedProductForBuy}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;