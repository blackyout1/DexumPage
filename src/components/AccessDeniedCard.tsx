import React from 'react';
import { 
  Lock, 
  ArrowRight, 
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedCardProps {
  requiredRole?: string;
  currentRole?: string;
  featureName?: string;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  featureName = 'Панель администратора Dexum'
}) => {
  const { currentUser, users, switchDemoUser } = useAuth();
  const adminUser = users.find(u => u.role === 'admin') || users[0];

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      <div className="relative rounded-3xl p-8 sm:p-10 text-center overflow-hidden bg-[#111114] border border-white/10 shadow-2xl">
        
        {/* Security Shield Lock Icon */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/10 border border-white/15 shadow-xl mb-5 text-white">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-mono font-bold uppercase mb-3">
          <Crown className="w-3.5 h-3.5" />
          ТРЕБУЮТСЯ ПРАВА АДМИНИСТРАТОРА
        </div>

        <h2 className="text-2xl font-black text-white">
          {featureName}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
          Этот раздел предназначен исключительно для разработчиков и администраторов софта Dexum.
        </p>

        {/* Current status */}
        <div className="my-5 inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#0b0b0e] border border-white/10 text-xs">
          {currentUser ? (
            <>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/15"
                referrerPolicy="no-referrer"
              />
              <span className="text-zinc-200 font-bold">{currentUser.name}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 font-mono">Роль: <strong className="text-white">{currentUser.role}</strong></span>
            </>
          ) : (
            <span className="text-zinc-400">Вы не авторизованы</span>
          )}
        </div>

        {/* 1-Click Switch to Admin */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => adminUser && switchDemoUser(adminUser.id)}
            className="px-6 py-3 rounded-2xl font-bold text-xs bg-white hover:bg-zinc-200 text-zinc-950 shadow-md shadow-white/5 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            Переключиться на аккаунт Администратора ({adminUser.name})
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
