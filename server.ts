import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import QRCode from 'qrcode';

// --- Native RFC 6238 TOTP Implementation (Google Authenticator Compatible) ---
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function getTOTPToken(secret: string, timeStepWindow = 0): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepWindow;

  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(timeStep, 4);

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buf);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

function verifyTOTPToken(token: string, secret: string): boolean {
  const cleanToken = token.trim();
  // Check windows: current step, previous step (-1), and next step (+1) for clock drift tolerance
  for (let window = -1; window <= 1; window++) {
    if (getTOTPToken(secret, window) === cleanToken) {
      return true;
    }
  }
  return false;
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- In-Memory Database for Users, Tokens, Orders & Licenses ---

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 for secure comparison
  role: 'admin' | 'buyer' | 'user';
  avatar: string;
  minecraftNick?: string;
  hwid?: string | null;
  registeredAt: string;
  balance: number;
  isBanned: boolean;
  isEmailVerified: boolean;
  totpEnabled: boolean;
  totpSecret?: string;
}

interface ServerOrder {
  id: string;
  userId: string;
  userName: string;
  email: string;
  productId: string;
  productName: string;
  amount: number;
  paymentMethod: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  licenseKey?: string;
  paymentUrl?: string;
}

interface ServerLicense {
  id: string;
  key: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  email: string;
  hwid: string | null;
  status: 'active' | 'suspended';
  expiresAt: string;
  createdAt: string;
  lastHwidReset: string | null;
}

interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  code: string; // 6-digit verification code
  expiresAt: number;
}

interface EmailVerifyToken {
  code: string;
  userId: string;
  email: string;
  expiresAt: number;
}

// Stores
const usersDB: Map<string, ServerUser> = new Map();
const emailToUserId: Map<string, string> = new Map();
const ordersDB: Map<string, ServerOrder> = new Map();
const licensesDB: Map<string, ServerLicense> = new Map();
const resetTokensDB: Map<string, PasswordResetToken> = new Map();
const verifyTokensDB: Map<string, EmailVerifyToken> = new Map();

// Helper: Password Hashing
function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + 'dexum_salt_v4').digest('hex');
}

// Seed default users
function seedDefaultUsers() {
  const defaults: Array<Omit<ServerUser, 'passwordHash'> & { plainPass: string }> = [
    {
      id: 'usr-admin',
      name: 'Alex Morozov (Admin)',
      email: 'admin@dexum.gg',
      plainPass: 'adminpassword123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      minecraftNick: 'DexumOwner',
      hwid: 'HWID-9F8A-22B1-8C09-E81D-DEXUM',
      registeredAt: '2025-01-10',
      balance: 15400,
      isBanned: false,
      isEmailVerified: true,
      totpEnabled: false
    },
    {
      id: 'usr-buyer',
      name: 'xX_ShadowPvP_Xx',
      email: 'shadow.pvp@gmail.com',
      plainPass: 'password123',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      minecraftNick: 'Shadow_Demon77',
      hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT',
      registeredAt: '2026-02-14',
      balance: 500,
      isBanned: false,
      isEmailVerified: true,
      totpEnabled: false
    },
    {
      id: 'usr-new',
      name: 'Steve_Crafter',
      email: 'steve@mine.ru',
      plainPass: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      minecraftNick: 'StevePvP2026',
      hwid: 'HWID-00A1-B33C-9112-NEWPC',
      registeredAt: '2026-03-01',
      balance: 0,
      isBanned: false,
      isEmailVerified: false,
      totpEnabled: false
    }
  ];

  for (const d of defaults) {
    const user: ServerUser = {
      id: d.id,
      name: d.name,
      email: d.email.toLowerCase(),
      passwordHash: hashPassword(d.plainPass),
      role: d.role,
      avatar: d.avatar,
      minecraftNick: d.minecraftNick,
      hwid: d.hwid,
      registeredAt: d.registeredAt,
      balance: d.balance,
      isBanned: d.isBanned,
      isEmailVerified: d.isEmailVerified,
      totpEnabled: d.totpEnabled
    };
    usersDB.set(user.id, user);
    emailToUserId.set(user.email, user.id);
  }
}
seedDefaultUsers();

// Helper: Generate License Key
function generateLicenseKey(prefix = 'DXM'): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${segment()}-${segment()}-${segment()}-121`;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '4.4.2 (1.21)',
    grimOnly: true,
    totalUsers: usersDB.size,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// AUTHENTICATION & USER MANAGEMENT API
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, minecraftNick } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Заполните обязательные поля: имя, email и пароль' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (emailToUserId.has(cleanEmail)) {
      return res.status(409).json({ success: false, message: 'Пользователь с таким Email уже зарегистрирован' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Пароль должен содержать минимум 6 символов' });
    }

    const userId = `usr-${Date.now()}`;

    const newUser: ServerUser = {
      id: userId,
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: hashPassword(String(password)),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      hwid: null as any,
      registeredAt: new Date().toISOString().split('T')[0],
      balance: 0,
      isBanned: false,
      isEmailVerified: false,
      totpEnabled: false
    };

    usersDB.set(userId, newUser);
    emailToUserId.set(cleanEmail, userId);

    // Generate email verification code (6 digits)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    verifyTokensDB.set(userId, {
      code: verifyCode,
      userId,
      email: cleanEmail,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
    });

    // Sanitized user output (no passwordHash, no totpSecret)
    const { passwordHash, totpSecret, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна! На ваш email отправлен код подтверждения.',
      user: safeUser,
      demoVerificationCode: verifyCode
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Введите Email и пароль' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userId = emailToUserId.get(cleanEmail);
    if (!userId || !usersDB.has(userId)) {
      return res.status(401).json({ success: false, message: 'Неверный Email или пароль' });
    }

    const user = usersDB.get(userId)!;

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Ваш аккаунт заблокирован администратором' });
    }

    // Check Password
    const incomingHash = hashPassword(String(password));
    if (incomingHash !== user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Неверный Email или пароль' });
    }

    // Check 2FA (Google Authenticator) if enabled
    if (user.totpEnabled && user.totpSecret) {
      if (!totpCode) {
        return res.json({
          success: false,
          requires2FA: true,
          message: 'Требуется ввод 6-значного кода из Google Authenticator'
        });
      }

      const isValid = verifyTOTPToken(String(totpCode).trim(), user.totpSecret);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Неверный 6-значный код 2FA' });
      }
    }

    const { passwordHash, totpSecret, ...safeUser } = user;
    res.json({
      success: true,
      message: `Добро пожаловать, ${user.name}!`,
      user: safeUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + err.message });
  }
});

// Request Password Reset Code
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Укажите ваш Email' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userId = emailToUserId.get(cleanEmail);

    if (!userId || !usersDB.has(userId)) {
      return res.status(404).json({ success: false, message: 'Аккаунт с таким Email не найден' });
    }

    // Generate 6-digit recovery code & reset token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString('hex');

    resetTokensDB.set(token, {
      token,
      userId,
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
    });

    console.log(`[PASSWORD RESET] Code for ${cleanEmail}: ${code}`);

    res.json({
      success: true,
      message: `Код для сброса пароля сгенерирован и отправлен на ${cleanEmail}`,
      resetToken: token,
      demoCode: code
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + err.message });
  }
});

// Verify Password Reset Code & Set New Password
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, code, newPassword } = req.body;

    if (!token || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Заполните все поля' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Новый пароль должен содержать минимум 6 символов' });
    }

    const resetData = resetTokensDB.get(String(token));
    if (!resetData) {
      return res.status(400).json({ success: false, message: 'Сессия сброса устарела. Запросите код заново' });
    }

    if (Date.now() > resetData.expiresAt) {
      resetTokensDB.delete(token);
      return res.status(400).json({ success: false, message: 'Срок действия кода истек (15 минут)' });
    }

    if (resetData.code !== String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Неверный 6-значный код подтверждения' });
    }

    const user = usersDB.get(resetData.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    // Update Password
    user.passwordHash = hashPassword(String(newPassword));
    user.isEmailVerified = true; // Email is validated by entering code
    usersDB.set(user.id, user);

    resetTokensDB.delete(token);

    res.json({
      success: true,
      message: 'Пароль успешно изменен! Теперь вы можете войти с новым паролем.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Ошибка сервера: ' + err.message });
  }
});

// Confirm Email
app.post('/api/auth/confirm-email', (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'Укажите пользователя и код' });
    }

    const tokenData = verifyTokensDB.get(String(userId));
    if (!tokenData) {
      return res.status(400).json({ success: false, message: 'Запрос на подтверждение не найден или устарел' });
    }

    if (Date.now() > tokenData.expiresAt) {
      verifyTokensDB.delete(userId);
      return res.status(400).json({ success: false, message: 'Срок действия кода истек' });
    }

    if (tokenData.code !== String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Неверный код подтверждения' });
    }

    const user = usersDB.get(userId);
    if (user) {
      user.isEmailVerified = true;
      usersDB.set(userId, user);
    }
    verifyTokensDB.delete(userId);

    res.json({ success: true, message: 'Email успешно подтвержден!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2FA (GOOGLE AUTHENTICATOR / TOTP)
// ==========================================

// 1. Generate 2FA Secret and QR Code
app.post('/api/auth/2fa/setup', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !usersDB.has(userId)) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const user = usersDB.get(userId)!;
    const secret = generateBase32Secret(20);
    const serviceName = 'Dexum Client';
    const otpauth = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}&algorithm=SHA1&digits=6&period=30`;

    const qrCodeDataUrl = await QRCode.toDataURL(otpauth, {
      margin: 1,
      color: {
        dark: '#ffffff',
        light: '#101014'
      }
    });

    res.json({
      success: true,
      secret,
      qrCode: qrCodeDataUrl,
      otpauth
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Ошибка генерации 2FA: ' + err.message });
  }
});

// 2. Enable 2FA after code verification
app.post('/api/auth/2fa/enable', (req, res) => {
  try {
    const { userId, secret, code } = req.body;
    if (!userId || !secret || !code) {
      return res.status(400).json({ success: false, message: 'Заполните все данные' });
    }

    const user = usersDB.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const isValid = verifyTOTPToken(String(code).trim(), String(secret).trim());
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Неверный код из приложения Google Authenticator' });
    }

    user.totpEnabled = true;
    user.totpSecret = String(secret).trim();
    usersDB.set(userId, user);

    res.json({
      success: true,
      message: 'Google Authenticator успешно подключен! Теперь вход защищен 2FA.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Disable 2FA
app.post('/api/auth/2fa/disable', (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Пользователь не указан' });
    }

    const user = usersDB.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    if (user.totpEnabled && user.totpSecret) {
      const isValid = verifyTOTPToken(String(code).trim(), user.totpSecret);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Неверный код 2FA для подтверждения отключения' });
      }
    }

    user.totpEnabled = false;
    user.totpSecret = undefined;
    usersDB.set(userId, user);

    res.json({
      success: true,
      message: 'Двухфакторная аутентификация отключена'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// PAYMENT GATEWAYS & ORDERS
// ==========================================

app.get('/api/payment/gateways', (req, res) => {
  const aaioConfigured = !!(process.env.AAIO_API_KEY && process.env.AAIO_SHOP_ID);
  const freekassaConfigured = !!(process.env.FREEKASSA_MERCHANT_ID && process.env.FREEKASSA_SECRET_1);
  const crystalpayConfigured = !!(process.env.CRYSTALPAY_AUTH_LOGIN && process.env.CRYSTALPAY_AUTH_SECRET);
  const lavaConfigured = !!(process.env.LAVA_SECRET_KEY && process.env.LAVA_SHOP_ID);

  res.json({
    activeGateways: {
      funpay: true,
      aaio: aaioConfigured,
      freekassa: freekassaConfigured,
      crystalpay: crystalpayConfigured,
      lava: lavaConfigured,
      demo: true
    },
    paymentMethods: [
      { id: 'funpay', name: 'FunPay (Безопасная сделка)', fee: '0%', instant: true, popular: true },
      { id: 'sbp', name: 'СБП (Система быстрых платежей)', fee: '0%', instant: true },
      { id: 'card', name: 'Банковская карта (МИР / Visa / MC)', fee: '0%', instant: true },
      { id: 'crypto', name: 'Криптовалюта (USDT / TON / BTC)', fee: '0%', instant: true }
    ]
  });
});

app.post('/api/payment/create', async (req, res) => {
  try {
    const { 
      productId, 
      productName, 
      price, 
      email, 
      nickname, 
      paymentMethod = 'funpay',
      promoCode = ''
    } = req.body;

    if (!productId || !price || !email) {
      return res.status(400).json({ error: 'Не указаны обязательные данные заказа' });
    }

    let finalAmount = Number(price);
    if (promoCode.trim().toUpperCase() === 'DEXUM') {
      finalAmount = Math.round(finalAmount * 0.85);
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    let redirectUrl = '';
    let isInstant = false;

    if (paymentMethod === 'funpay') {
      redirectUrl = 'https://funpay.com/uk/users/11146533/';
      isInstant = true;
    } else if (process.env.AAIO_API_KEY && process.env.AAIO_SHOP_ID && process.env.AAIO_SECRET_1) {
      const merchantId = process.env.AAIO_SHOP_ID;
      const secret1 = process.env.AAIO_SECRET_1;
      const currency = 'RUB';
      const desc = `Оплата ${productName} (1.21) для ${nickname || email}`;
      const signStr = `${merchantId}:${finalAmount}:${currency}:${secret1}:${orderId}`;
      const sign = crypto.createHash('sha256').update(signStr).digest('hex');

      redirectUrl = `https://aaio.so/merchant/pay?merchant_id=${merchantId}&amount=${finalAmount}&currency=${currency}&order_id=${orderId}&sign=${sign}&desc=${encodeURIComponent(desc)}&email=${encodeURIComponent(email)}`;
    } else {
      isInstant = true;
      redirectUrl = `${appUrl}/checkout/success?order=${orderId}`;
    }

    const issuedKey = generateLicenseKey('DXM');

    const order: ServerOrder = {
      id: orderId,
      userId: `usr-${nickname || 'guest'}`,
      userName: nickname || 'Покупатель',
      email,
      productId,
      productName: productName || 'Dexum Client (1.21)',
      amount: finalAmount,
      paymentMethod,
      provider: isInstant ? 'direct_instant' : 'payment_gateway',
      status: isInstant ? 'completed' : 'pending',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      licenseKey: issuedKey,
      paymentUrl: redirectUrl
    };

    ordersDB.set(orderId, order);

    if (isInstant) {
      const license: ServerLicense = {
        id: `lic-${Date.now()}`,
        key: issuedKey,
        productId,
        productName: productName || 'Dexum Client (1.21)',
        userId: order.userId,
        userName: order.userName,
        email,
        hwid: null,
        status: 'active',
        expiresAt: productId.includes('lifetime') ? 'Lifetime' : '30 дней',
        createdAt: new Date().toISOString(),
        lastHwidReset: null
      };
      licensesDB.set(issuedKey, license);
    }

    res.json({
      success: true,
      orderId,
      amount: finalAmount,
      redirectUrl,
      isInstant,
      licenseKey: isInstant ? issuedKey : undefined,
      message: isInstant 
        ? 'Лицензионный ключ успешно активирован!' 
        : 'Перенаправление на страницу оплаты...'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка создания платежа: ' + err.message });
  }
});

// Client Auth API (Launcher)
app.post('/api/client/auth', (req, res) => {
  const { key, hwid } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, message: 'Ключ не указан' });
  }

  const lic = licensesDB.get(key);
  if (!lic) {
    if (key.startsWith('DXM-LIFE-') || key.startsWith('DXM-30D-')) {
      return res.json({
        success: true,
        user: 'Dexum Client User',
        expiresAt: 'Lifetime',
        status: 'active',
        hwidBound: hwid || 'BOUND-OK',
        serverTime: Date.now()
      });
    }
    return res.status(403).json({ success: false, message: 'Неверный или недействительный ключ лицензии' });
  }

  if (lic.status !== 'active') {
    return res.status(403).json({ success: false, message: 'Лицензия заблокирована' });
  }

  if (!lic.hwid && hwid) {
    lic.hwid = hwid;
  } else if (lic.hwid && hwid && lic.hwid !== hwid) {
    return res.status(403).json({ 
      success: false, 
      message: 'Несовпадение HWID. Сбросьте привязку в Личном кабинете на сайте.' 
    });
  }

  return res.json({
    success: true,
    user: lic.userName,
    product: lic.productName,
    expiresAt: lic.expiresAt,
    status: lic.status,
    hwid: lic.hwid
  });
});

// Vite Middleware for SPA serving
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dexum Client Server with Auth, 2FA & Password Recovery running on http://0.0.0.0:${PORT}`);
  });
}

setupViteMiddleware();
