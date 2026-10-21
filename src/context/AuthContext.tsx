import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SoftwareProduct, Order, License } from '../types';
import { INITIAL_USERS, PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  products: SoftwareProduct[];
  login: (email: string, pass: string, totpCode?: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean }>;
  register: (name: string, email: string, pass: string, minecraftNick?: string) => Promise<{ success: boolean; message: string; demoCode?: string }>;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  purchaseProduct: (productId: string, paymentMethod: 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance' | 'funpay', promoCode?: string) => { success: boolean; message: string; licenseKey?: string };
  resetHwid: (licenseId: string) => { success: boolean; message: string };
  activateKey: (key: string) => { success: boolean; message: string; license?: License };
  adminGenerateKey: (productId: string, duration: '30' | '90' | 'lifetime') => { key: string; expiresAt: string };
  adminToggleBan: (userId: string) => void;
  adminResetUserHwid: (userId: string) => void;
  updateMinecraftNick: (nick: string) => void;
  
  // New backend features
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string; demoCode?: string }>;
  confirmPasswordReset: (token: string, code: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  confirmEmailVerification: (code: string) => Promise<{ success: boolean; message: string }>;
  setup2FA: () => Promise<{ success: boolean; secret?: string; qrCode?: string; message?: string }>;
  enable2FA: (secret: string, code: string) => Promise<{ success: boolean; message: string }>;
  disable2FA: (code: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dexum_store_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dexum_store_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('dexum_current_user_id');
    return saved || 'usr-buyer';
  });

  const currentUser = users.find(u => u.id === currentUserId) || null;

  useEffect(() => {
    localStorage.setItem('dexum_store_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dexum_store_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('dexum_current_user_id', currentUserId);
    } else {
      localStorage.removeItem('dexum_current_user_id');
    }
  }, [currentUserId]);

  // Login via Server API with fallback
  const login = async (email: string, pass: string, totpCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass, totpCode })
      });

      const data = await response.json();

      if (data.requires2FA) {
        return { success: false, requires2FA: true, message: data.message };
      }

      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Ошибка входа' };
      }

      // Sync user to client state
      const serverUser = data.user;
      setUsers(prev => {
        const idx = prev.findIndex(u => u.id === serverUser.id || u.email.toLowerCase() === cleanEmail);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...serverUser };
          return updated;
        }
        return [serverUser, ...prev];
      });

      setCurrentUserId(serverUser.id);
      return { success: true, message: data.message };
    } catch {
      // Local fallback for offline mode
      const found = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return { success: false, message: 'Пользователь не найден' };
      }
      if (found.isBanned) {
        return { success: false, message: 'Ваш аккаунт заблокирован администратором' };
      }
      if (found.totpEnabled && !totpCode) {
        return { success: false, requires2FA: true, message: 'Введите код 2FA из приложения Google Authenticator' };
      }
      setCurrentUserId(found.id);
      return { success: true, message: `С возвращением, ${found.name}!` };
    }
  };

  // Register via Server API with fallback
  const register = async (name: string, email: string, pass: string, minecraftNick?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password: pass, minecraftNick })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Ошибка регистрации' };
      }

      const serverUser: User = {
        ...data.user,
        licenses: []
      };

      setUsers(prev => [serverUser, ...prev.filter(u => u.id !== serverUser.id)]);
      setCurrentUserId(serverUser.id);
      return { 
        success: true, 
        message: data.message,
        demoCode: data.demoVerificationCode
      };
    } catch {
      // Offline fallback
      const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { success: false, message: 'Пользователь с таким Email уже зарегистрирован.' };
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim() || 'Minecraft_Player',
        email: cleanEmail,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        minecraftNick: minecraftNick?.trim() || `${name}_PvP`,
        hwid: `HWID-${Math.random().toString(36).substring(2, 7).toUpperCase()}-DXM`,
        registeredAt: new Date().toISOString().split('T')[0],
        balance: 0,
        isEmailVerified: false,
        totpEnabled: false,
        licenses: []
      };

      setUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      return { success: true, message: 'Аккаунт Dexum успешно создан!' };
    }
  };

  const logout = () => {
    setCurrentUserId('');
  };

  const switchDemoUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  // Password Reset Flow
  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        resetToken: data.resetToken,
        demoCode: data.demoCode
      };
    } catch {
      return {
        success: true,
        message: `Демо-код для сброса пароля отправлен на ${email}`,
        resetToken: 'mock-token-' + Date.now(),
        demoCode: '777888'
      };
    }
  };

  const confirmPasswordReset = async (token: string, code: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code: code.trim(), newPassword: newPass })
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message || 'Пароль успешно обновлен!'
      };
    } catch {
      return { success: true, message: 'Пароль успешно изменен!' };
    }
  };

  const confirmEmailVerification = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Необходима авторизация' };
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, code: code.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isEmailVerified: true } : u));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Неверный код' };
    } catch {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isEmailVerified: true } : u));
      return { success: true, message: 'Email подтвержден (Демо режим)' };
    }
  };

  // 2FA Flow
  const setup2FA = async () => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        secret: data.secret,
        qrCode: data.qrCode,
        message: data.message
      };
    } catch (err: any) {
      return { success: false, message: 'Ошибка настройки 2FA: ' + err.message };
    }
  };

  const enable2FA = async (secret: string, code: string) => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, secret, code: code.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: true, totpSecret: secret } : u));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Неверный код' };
    } catch {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: true } : u));
      return { success: true, message: '2FA включена (Демо режим)' };
    }
  };

  const disable2FA = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, code: code.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: false, totpSecret: undefined } : u));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Неверный код' };
    } catch {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: false } : u));
      return { success: true, message: '2FA отключена' };
    }
  };

  const purchaseProduct = (
    productId: string,
    paymentMethod: 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance' | 'funpay',
    promoCode?: string
  ) => {
    if (!currentUser) {
      return { success: false, message: 'Для покупки необходимо авторизоваться на сайте.' };
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: 'Товар не найден.' };
    }

    let finalPrice = product.price;
    if (promoCode && ['DEXUM', 'DELTA', 'MINECRAFT', 'ACRONIX', '2026'].includes(promoCode.toUpperCase().trim())) {
      finalPrice = Math.round(finalPrice * 0.85);
    }

    const keySuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const keyMid = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedKey = `DXM-${product.category.toUpperCase()}-${keyMid}-${keySuffix}`;

    const isLifetime = product.durationLabel.includes('Навсегда') || product.durationLabel.includes('Lifetime') || product.category === 'configs' || product.category === 'spoofer';
    const daysRemaining = isLifetime ? 'unlimited' : (product.id.includes('90') ? 90 : 30);
    const expiresAt = isLifetime ? 'Lifetime' : new Date(Date.now() + (daysRemaining as number) * 86400000).toISOString().split('T')[0];

    const newLicense: License = {
      id: `lic-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      key: generatedKey,
      status: 'active',
      expiresAt: expiresAt,
      daysRemaining: daysRemaining,
      hwid: currentUser.hwid || `HWID-${Math.random().toString(36).substring(2, 7).toUpperCase()}-DXM`,
      hwidResetAvailable: true,
      lastHwidReset: null,
      activatedAt: new Date().toISOString().split('T')[0]
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      productId: product.id,
      productName: product.name,
      amount: finalPrice,
      paymentMethod,
      status: 'completed',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      licenseKey: generatedKey
    };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          role: u.role === 'user' ? 'buyer' : u.role,
          licenses: [newLicense, ...u.licenses]
        };
      }
      return u;
    }));

    setOrders(prev => [newOrder, ...prev]);

    return {
      success: true,
      message: `Лицензия на ${product.name} успешно оформлена!`,
      licenseKey: generatedKey
    };
  };

  const resetHwid = (licenseId: string) => {
    if (!currentUser) return { success: false, message: 'Авторизуйтесь в системе.' };

    const lic = currentUser.licenses.find(l => l.id === licenseId);
    if (!lic) return { success: false, message: 'Лицензия не найдена.' };

    const newHwid = `HWID-${Math.random().toString(36).substring(2, 8).toUpperCase()}-DXM`;

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updatedLicenses = u.licenses.map(l => {
          if (l.id === licenseId) {
            return {
              ...l,
              hwid: null,
              lastHwidReset: new Date().toISOString().split('T')[0]
            };
          }
          return l;
        });

        return {
          ...u,
          hwid: newHwid,
          licenses: updatedLicenses
        };
      }
      return u;
    }));

    return {
      success: true,
      message: 'HWID успешно сброшен! При следующем входе лаунчер привяжет новый компьютер.'
    };
  };

  const activateKey = (key: string) => {
    if (!currentUser) return { success: false, message: 'Авторизуйтесь для активации ключа.' };

    const cleanKey = key.trim().toUpperCase();

    const alreadyOwned = currentUser.licenses.some(l => l.key.toUpperCase() === cleanKey);
    if (alreadyOwned) {
      return { success: false, message: 'Этот ключ уже активирован на вашем аккаунте.' };
    }

    let targetProduct = PRODUCTS[0];
    let isLifetime = true;
    let days: number | 'unlimited' = 'unlimited';

    if (cleanKey.includes('30D')) {
      targetProduct = PRODUCTS.find(p => p.id === 'dexum-30-days') || PRODUCTS[0];
      isLifetime = false;
      days = 30;
    } else if (cleanKey.includes('90D')) {
      targetProduct = PRODUCTS.find(p => p.id === 'dexum-90-days') || PRODUCTS[0];
      isLifetime = false;
      days = 90;
    } else if (cleanKey.includes('CFG')) {
      targetProduct = PRODUCTS.find(p => p.id === 'dexum-configs-vip') || PRODUCTS[0];
    } else if (cleanKey.includes('SPOOF')) {
      targetProduct = PRODUCTS.find(p => p.id === 'dexum-spoofer') || PRODUCTS[0];
    }

    const expiresAt = isLifetime ? 'Lifetime' : new Date(Date.now() + (days as number) * 86400000).toISOString().split('T')[0];

    const newLicense: License = {
      id: `lic-${Date.now()}`,
      productId: targetProduct.id,
      productName: targetProduct.name,
      key: cleanKey,
      status: 'active',
      expiresAt,
      daysRemaining: days,
      hwid: currentUser.hwid || `HWID-${Math.random().toString(36).substring(2, 7).toUpperCase()}-DXM`,
      hwidResetAvailable: true,
      lastHwidReset: null,
      activatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          role: u.role === 'user' ? 'buyer' : u.role,
          licenses: [newLicense, ...u.licenses]
        };
      }
      return u;
    }));

    return {
      success: true,
      message: `Ключ успешно активирован! Добавлена подписка: ${targetProduct.name}`,
      license: newLicense
    };
  };

  const adminGenerateKey = (productId: string, duration: '30' | '90' | 'lifetime') => {
    const prefix = duration === 'lifetime' ? 'LIFE' : `${duration}D`;
    const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `DXM-${prefix}-${rand1}-${rand2}`;
    const expiresAt = duration === 'lifetime' ? 'Lifetime' : new Date(Date.now() + parseInt(duration) * 86400000).toISOString().split('T')[0];

    return { key, expiresAt };
  };

  const adminToggleBan = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    }));
  };

  const adminResetUserHwid = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updatedLicenses = u.licenses.map(l => ({ ...l, hwid: null, lastHwidReset: new Date().toISOString().split('T')[0] }));
        return { ...u, licenses: updatedLicenses };
      }
      return u;
    }));
  };

  const updateMinecraftNick = (nick: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, minecraftNick: nick } : u));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        orders,
        products: PRODUCTS,
        login,
        register,
        logout,
        switchDemoUser,
        purchaseProduct,
        resetHwid,
        activateKey,
        adminGenerateKey,
        adminToggleBan,
        adminResetUserHwid,
        updateMinecraftNick,
        requestPasswordReset,
        confirmPasswordReset,
        confirmEmailVerification,
        setup2FA,
        enable2FA,
        disable2FA
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
