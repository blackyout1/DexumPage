import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SoftwareProduct, Order, License } from '../types';
import { INITIAL_USERS, PRODUCTS, INITIAL_ORDERS } from '../data/mockData';
import { generateBase32Secret, verifyTOTPToken } from '../utils/totp';
import QRCode from 'qrcode';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  products: SoftwareProduct[];
  login: (email: string, pass: string, totpCode?: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string; demoCode?: string }>;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  purchaseProduct: (productId: string, paymentMethod: 'sbp' | 'card' | 'crypto' | 'yoomoney' | 'balance' | 'funpay', promoCode?: string) => { success: boolean; message: string; licenseKey?: string };
  resetHwid: (licenseId: string) => { success: boolean; message: string };
  activateKey: (key: string) => { success: boolean; message: string; license?: License };
  adminGenerateKey: (productId: string, duration: '30' | '90' | 'lifetime') => { key: string; expiresAt: string };
  adminToggleBan: (userId: string) => void;
  adminResetUserHwid: (userId: string) => void;
  adminDeleteUser: (userId: string) => void;
  adminClearAllUsers: () => void;
  updateMinecraftNick: (nick: string) => void;
  
  // Real security features
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
    return saved || '';
  });

  // Client storage for active email verification codes and password reset tokens
  const [emailCodes, setEmailCodes] = useState<Record<string, { code: string; expiresAt: number }>>(() => {
    const saved = localStorage.getItem('dexum_email_codes');
    return saved ? JSON.parse(saved) : {};
  });

  const [resetCodes, setResetCodes] = useState<Record<string, { userId: string; code: string; expiresAt: number }>>(() => {
    const saved = localStorage.getItem('dexum_reset_codes');
    return saved ? JSON.parse(saved) : {};
  });

  const currentUser = users.find(u => u.id === currentUserId) || null;

  useEffect(() => {
    localStorage.setItem('dexum_store_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dexum_store_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dexum_email_codes', JSON.stringify(emailCodes));
  }, [emailCodes]);

  useEffect(() => {
    localStorage.setItem('dexum_reset_codes', JSON.stringify(resetCodes));
  }, [resetCodes]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('dexum_current_user_id', currentUserId);
    } else {
      localStorage.removeItem('dexum_current_user_id');
    }
  }, [currentUserId]);

  // LOGIN: Strict password check + REAL 2FA code check
  const login = async (email: string, pass: string, totpCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass, totpCode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.requires2FA) {
          return { success: false, requires2FA: true, message: data.message };
        }
        if (data.success && data.user) {
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
        }
      }
    } catch {
      // Cloudflare Pages static route
    }

    // Client Strict Auth Check
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'Пользователь с таким Email не найден.' };
    }

    if (found.isBanned) {
      return { success: false, message: 'Ваш аккаунт заблокирован администратором.' };
    }

    // Verify Password
    if (found.password && found.password !== pass) {
      return { success: false, message: 'Неверный пароль. Проверьте правильность ввода.' };
    }

    // Real Google Authenticator Check
    if (found.totpEnabled && found.totpSecret) {
      if (!totpCode) {
        return { success: false, requires2FA: true, message: 'Требуется ввод 6-значного кода из Google Authenticator' };
      }

      const isValid = await verifyTOTPToken(totpCode, found.totpSecret);
      if (!isValid) {
        return { success: false, requires2FA: true, message: 'Неверный 6-значный код 2FA! Введите актуальный код из приложения Google Authenticator.' };
      }
    }

    setCurrentUserId(found.id);
    return { success: true, message: `С возвращением, ${found.name}!` };
  };

  // REGISTER: Strict unique email check
  const register = async (name: string, email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !pass) {
      return { success: false, message: 'Заполните все обязательные поля.' };
    }

    if (pass.length < 6) {
      return { success: false, message: 'Пароль должен быть не менее 6 символов.' };
    }

    // Check duplicate in client state immediately
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Пользователь с таким Email уже зарегистрирован! Войдите в аккаунт.' };
    }

    // Try server registration if worker/server is active
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: pass })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Ошибка регистрации' };
      }

      const serverUser: User = {
        ...data.user,
        hwid: null,
        licenses: []
      };

      setUsers(prev => [serverUser, ...prev.filter(u => u.email.toLowerCase() !== cleanEmail)]);
      setCurrentUserId(serverUser.id);
      return {
        success: true,
        message: data.message,
        demoCode: data.demoVerificationCode
      };
    } catch {
      // Offline/Cloudflare Pages register flow
    }

    // Re-check duplicate strictly
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Пользователь с таким Email уже зарегистрирован!' };
    }

    const userId = `usr-${Date.now()}`;
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: User = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: pass,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      hwid: null, // Strictly null until first game launch!
      registeredAt: new Date().toISOString().split('T')[0],
      balance: 0,
      isEmailVerified: false,
      totpEnabled: false,
      licenses: []
    };

    // Save verification code
    setEmailCodes(prev => ({
      ...prev,
      [userId]: { code: verifyCode, expiresAt: Date.now() + 15 * 60 * 1000 }
    }));

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);

    return { 
      success: true, 
      message: 'Аккаунт успешно создан!',
      demoCode: verifyCode
    };
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

  // PASSWORD RESET: Strict code check
  const requestPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Аккаунт с таким Email не найден.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = 'rst-' + Math.random().toString(36).substring(2) + Date.now();

    setResetCodes(prev => ({
      ...prev,
      [token]: { userId: user.id, code, expiresAt: Date.now() + 15 * 60 * 1000 }
    }));

    return {
      success: true,
      message: `Код подтверждения сгенерирован для ${cleanEmail}`,
      resetToken: token,
      demoCode: code
    };
  };

  const confirmPasswordReset = async (token: string, code: string, newPass: string) => {
    const session = resetCodes[token];
    if (!session) {
      return { success: false, message: 'Сессия сброса устарела. Запросите код заново.' };
    }

    if (Date.now() > session.expiresAt) {
      return { success: false, message: 'Срок действия кода истек (15 минут).' };
    }

    // STRICT CODE CHECK
    if (session.code !== code.trim()) {
      return { success: false, message: 'Неверный код подтверждения! Проверьте 6 цифр.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'Новый пароль должен содержать от 6 символов.' };
    }

    // Update user password
    setUsers(prev => prev.map(u => {
      if (u.id === session.userId) {
        return { ...u, password: newPass, isEmailVerified: true };
      }
      return u;
    }));

    // Invalidate reset code
    setResetCodes(prev => {
      const copy = { ...prev };
      delete copy[token];
      return copy;
    });

    return { success: true, message: 'Пароль успешно изменен! Войдите с новым паролем.' };
  };

  // EMAIL VERIFICATION: Strict code check
  const confirmEmailVerification = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Необходима авторизация' };

    const cleanCode = code.trim();
    const session = emailCodes[currentUser.id];

    if (!session) {
      return { success: false, message: 'Код подтверждения не найден. Запросите новый.' };
    }

    if (Date.now() > session.expiresAt) {
      return { success: false, message: 'Срок действия кода истек.' };
    }

    // STRICT CODE VALIDATION: Never accept random code!
    if (session.code !== cleanCode) {
      return { success: false, message: 'Неверный код подтверждения!' };
    }

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isEmailVerified: true } : u));
    return { success: true, message: 'Почта успешно подтверждена!' };
  };

  // 2FA Flow (iOS Camera & Google Authenticator fully supported)
  const setup2FA = async () => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };

    try {
      const clientSecret = generateBase32Secret();
      const accountName = currentUser.email.trim();
      const issuer = 'Dexum';
      
      // Strict RFC 6238 URI format required by iOS Passwords & Google Authenticator
      const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${clientSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      // High-contrast clean black-on-white QR code with margin 3 for crisp camera scanning on iPhone/iPad
      const clientQrCode = await QRCode.toDataURL(otpauth, {
        errorCorrectionLevel: 'M',
        margin: 3,
        width: 256,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return {
        success: true,
        secret: clientSecret,
        qrCode: clientQrCode
      };
    } catch (err: any) {
      return { success: false, message: 'Ошибка генерации 2FA: ' + err.message };
    }
  };

  // STRICT 2FA ENABLE: Validate with real RFC6238 TOTP algorithm!
  const enable2FA = async (secret: string, code: string) => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };

    const isValid = await verifyTOTPToken(code.trim(), secret.trim());
    if (!isValid) {
      return { 
        success: false, 
        message: 'Неверный 6-значный код! Введите точный код из приложения Google Authenticator на телефоне.' 
      };
    }

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: true, totpSecret: secret } : u));
    return { success: true, message: 'Google Authenticator успешно подключен!' };
  };

  const disable2FA = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Пользователь не найден' };

    if (currentUser.totpEnabled && currentUser.totpSecret) {
      const isValid = await verifyTOTPToken(code.trim(), currentUser.totpSecret);
      if (!isValid) {
        return { success: false, message: 'Неверный 6-значный код из Google Authenticator для отключения!' };
      }
    }

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totpEnabled: false, totpSecret: undefined } : u));
    return { success: true, message: 'Двухфакторная защита 2FA отключена.' };
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
      hwid: currentUser.hwid || null,
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
          hwid: null,
          licenses: updatedLicenses
        };
      }
      return u;
    }));

    return {
      success: true,
      message: 'HWID успешно сброшен! Теперь вы можете запустить лаунчер на новом компьютере.'
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
      hwid: currentUser.hwid || null,
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

  const adminDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const adminClearAllUsers = () => {
    // Keep only the main admin account, wipe all registered/test users and cache
    const adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
    const cleanAdmin = { ...adminUser, licenses: adminUser.licenses || [] };
    setUsers([cleanAdmin]);
    localStorage.removeItem('dexum_email_codes');
    localStorage.removeItem('dexum_reset_codes');
    localStorage.setItem('dexum_store_users', JSON.stringify([cleanAdmin]));
    setCurrentUserId(cleanAdmin.id);
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
        adminDeleteUser,
        adminClearAllUsers,
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
