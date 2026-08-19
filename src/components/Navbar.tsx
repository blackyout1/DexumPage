import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Swords, 
  FolderArchive, 
  HelpCircle, 
  Crown, 
  LogOut, 
  ChevronDown, 
  Download, 
  Flame, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onOpenBuyModal: (productId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenBuyModal
}) => {
  const { currentUser, users, switchDemoUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const hasActiveLicense = currentUser?.licenses && currentUser.licenses.length > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white group-hover:border-white/40 transition-colors">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-wider text-white">
                    DEXUM
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-white/10 text-zinc-300 border border-white/10">
                    CLIENT
                  </span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-white/10">
              
              <button
                id="nav-home-btn"
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Главная
              </button>

              <button
                id="nav-store-btn"
                onClick={() => onNavigate('store')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'store'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Магазин
              </button>

              <button
                id="nav-modules-btn"
                onClick={() => onNavigate('modules')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'modules'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                Функции
              </button>

              <button
                id="nav-configs-btn"
                onClick={() => onNavigate('configs')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'configs'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                Конфиги
              </button>

              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate('client_dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'client_dashboard'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Кабинет
                {hasActiveLicense && (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                )}
              </button>

              {isAdmin && (
                <button
                  id="nav-admin-btn"
                  onClick={() => onNavigate('admin_panel')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin_panel'
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  Админ
                </button>
              )}

              <button
                id="nav-faq-btn"
                onClick={() => onNavigate('faq')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'faq'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                FAQ
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Quick Buy CTA */}
            <button
              id="quick-buy-btn"
              onClick={() => onOpenBuyModal('dexum-lifetime')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 transition-colors cursor-pointer shadow-md shadow-white/5"
            >
              <Flame className="w-3.5 h-3.5" />
              Купить софт
            </button>

            {/* User Account / Auth Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-account-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pl-3 rounded-xl bg-[#121215] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className={`text-[9px] uppercase font-mono font-semibold ${
                      currentUser.role === 'admin' ? 'text-zinc-300' : hasActiveLicense ? 'text-zinc-200' : 'text-zinc-500'
                    }`}>
                      {currentUser.role === 'admin' ? 'Admin' : hasActiveLicense ? 'Subscribed' : 'User'}
                    </span>
                  </div>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pr-1" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#121215] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                      <div className="p-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                            <p className="text-[11px] text-zinc-400 font-mono truncate">Ник: {currentUser.minecraftNick || '—'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Demo Quick Account Switch */}
                      <div className="py-2">
                        <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Переключить аккаунт (тест):
                        </div>
                        <div className="space-y-1 mt-1">
                          {users.map(u => (
                            <button
                              key={u.id}
                              onClick={() => {
                                switchDemoUser(u.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                u.id === currentUser.id
                                  ? 'bg-white/15 text-white font-bold'
                                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="truncate">{u.name}</span>
                              <span className="text-[10px] font-mono">
                                {u.role === 'admin' ? '👑 Admin' : u.licenses.length > 0 ? '💎 Lifetime' : '🎮 User'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                        <button
                          onClick={() => {
                            onNavigate('client_dashboard');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-300" />
                          Мои лицензии и лаунчер
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Выйти
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="auth-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Вход
                </button>
                <button
                  id="auth-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 transition-colors cursor-pointer shadow-sm"
                >
                  Регистрация
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 space-y-1">
            <button
              onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'home' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              Главная
            </button>
            <button
              onClick={() => { onNavigate('store'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'store' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              <ShoppingCart className="w-4 h-4" /> Магазин
            </button>
            <button
              onClick={() => { onNavigate('modules'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'modules' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              <Swords className="w-4 h-4" /> Функции
            </button>
            <button
              onClick={() => { onNavigate('configs'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'configs' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              <FolderArchive className="w-4 h-4" /> Конфиги
            </button>
            <button
              onClick={() => { onNavigate('client_dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'client_dashboard' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              <Download className="w-4 h-4" /> Кабинет
            </button>
            {isAdmin && (
              <button
                onClick={() => { onNavigate('admin_panel'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'admin_panel' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-400'}`}
              >
                <Crown className="w-4 h-4" /> Админ-панель
              </button>
            )}
            <button
              onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${currentView === 'faq' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'}`}
            >
              <HelpCircle className="w-4 h-4" /> FAQ
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
