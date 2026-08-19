import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SoftwareProduct, Order, License } from '../types';
import { INITIAL_USERS, PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  products: SoftwareProduct[];
  login: (email: string, pass: string) => { success: boolean; message: string };
  register: (name: string, email: string, pass: string, minecraftNick?: string) => { success: boolean; message: string };
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  purchaseProduct: (productId: string, paymentMethod: 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance', promoCode?: string) => { success: boolean; message: string; licenseKey?: string };
  resetHwid: (licenseId: string) => { success: boolean; message: string };
  activateKey: (key: string) => { success: boolean; message: string; license?: License };
  adminGenerateKey: (productId: string, duration: '30' | '90' | 'lifetime') => { key: string; expiresAt: string };
  adminToggleBan: (userId: string) => void;
  adminResetUserHwid: (userId: string) => void;
  updateMinecraftNick: (nick: string) => void;
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
    }
  }, [currentUserId]);

  const login = (email: string, _pass: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Auto-create friendly login for test convenience if email entered
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        minecraftNick: `${email.split('@')[0]}_PvP`,
        hwid: `HWID-${Math.random().toString(36).substring(2, 8).toUpperCase()}-DXM`,
        registeredAt: new Date().toISOString().split('T')[0],
        balance: 0,
        licenses: []
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      return { success: true, message: `Добро пожаловать в Dexum, ${newUser.name}!` };
    }

    if (found.isBanned) {
      return { success: false, message: 'Ваш аккаунт заблокирован администратором.' };
    }

    setCurrentUserId(found.id);
    return { success: true, message: `С возвращением, ${found.name}!` };
  };

  const register = (name: string, email: string, _pass: string, minecraftNick?: string) => {
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Пользователь с таким Email уже зарегистрирован.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim() || 'Minecraft_Player',
      email: email.trim(),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      minecraftNick: minecraftNick?.trim() || `${name}_PvP`,
      hwid: `HWID-${Math.random().toString(36).substring(2, 7).toUpperCase()}-DXM`,
      registeredAt: new Date().toISOString().split('T')[0],
      balance: 0,
      licenses: []
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    return { success: true, message: 'Аккаунт Dexum успешно создан!' };
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

  const purchaseProduct = (
    productId: string,
    paymentMethod: 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance',
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
      finalPrice = Math.round(finalPrice * 0.85); // 15% discount
    }

    // Generate Key
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
      date: new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
      licenseKey: generatedKey
    };

    // Update user
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          role: u.role === 'admin' ? 'admin' : 'buyer',
          licenses: [newLicense, ...u.licenses]
        };
      }
      return u;
    }));

    setOrders(prev => [newOrder, ...prev]);

    return {
      success: true,
      message: `Оплата прошла успешно! Лицензия ${product.name} привязана к вашему аккаунту.`,
      licenseKey: generatedKey
    };
  };

  const resetHwid = (licenseId: string) => {
    if (!currentUser) return { success: false, message: 'Вы не авторизованы.' };

    let success = false;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updatedLicenses = u.licenses.map(lic => {
          if (lic.id === licenseId) {
            success = true;
            return {
              ...lic,
              hwid: null,
              hwidResetAvailable: true,
              lastHwidReset: new Date().toISOString().split('T')[0]
            };
          }
          return lic;
        });
        return { ...u, licenses: updatedLicenses };
      }
      return u;
    }));

    if (success) {
      return { success: true, message: 'Привязка HWID успешно сброшена! Новый компьютер привяжется при следующем запуске лаунчера.' };
    }
    return { success: false, message: 'Лицензия не найдена.' };
  };

  const activateKey = (keyString: string) => {
    if (!currentUser) return { success: false, message: 'Войдите в аккаунт для активации ключа.' };

    const cleanKey = keyString.trim().toUpperCase();
    if (cleanKey.length < 8) {
      return { success: false, message: 'Некорректный формат лицензионного ключа.' };
    }

    // Check if key contains lifetime / 30 / 90
    const isLife = cleanKey.includes('LIFE') || cleanKey.includes('PRO');
    const is90 = cleanKey.includes('90');
    const days = isLife ? 'unlimited' : (is90 ? 90 : 30);
    const expiresAt = isLife ? 'Lifetime' : new Date(Date.now() + (days as number) * 86400000).toISOString().split('T')[0];

    const activatedLicense: License = {
      id: `lic-act-${Date.now()}`,
      productId: 'dexum-lifetime',
      productName: isLife ? 'Dexum Client Lifetime (Key)' : 'Dexum Client 30 Дней',
      key: cleanKey,
      status: 'active',
      expiresAt,
      daysRemaining: days,
      hwid: currentUser.hwid || 'HWID-BOUND',
      hwidResetAvailable: true,
      lastHwidReset: null,
      activatedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          role: u.role === 'admin' ? 'admin' : 'buyer',
          licenses: [activatedLicense, ...u.licenses]
        };
      }
      return u;
    }));

    return {
      success: true,
      message: 'Ключ успешно активирован! Подписка добавлена в ваш личный кабинет.',
      license: activatedLicense
    };
  };

  const adminGenerateKey = (productId: string, duration: '30' | '90' | 'lifetime') => {
    const prod = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
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
        updateMinecraftNick
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
