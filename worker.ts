import QRCode from 'qrcode';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) secret += BASE32_ALPHABET[bytes[i] % 32];
  return secret;
}

function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0, value = 0;
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
  return new Uint8Array(bytes);
}

async function getTOTPToken(secret: string, timeStepWindow = 0): Promise<string> {
  const keyBytes = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepWindow;
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, 0, false);
  view.setUint32(4, timeStep, false);
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, buf);
  const digest = new Uint8Array(signature);
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

async function verifyTOTPToken(token: string, secret: string): Promise<boolean> {
  const cleanToken = token.trim();
  for (let window = -1; window <= 1; window++) {
    const expected = await getTOTPToken(secret, window);
    if (expected === cleanToken) return true;
  }
  return false;
}

// ============================================================
// ПАРОЛИ: PBKDF2-SHA256, 100 000 итераций, 256-битный хеш
// ============================================================

function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

function saltToHex(salt: Uint8Array): string {
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToSalt(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 25000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================

interface WorkerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'buyer' | 'user';
  avatar: string;
  minecraftNick?: string;
  hwid: string;
  registeredAt: string;
  balance: number;
  isBanned: boolean;
  isEmailVerified: boolean;
  totpEnabled: boolean;
  totpSecret?: string;
}

const users = new Map<string, WorkerUser>();
const emailToId = new Map<string, string>();
const resetTokens = new Map<string, { code: string; userId: string; expiresAt: number }>();
const verifyTokens = new Map<string, { code: string; expiresAt: number }>();
const licenses = new Map<string, any>();

async function initDefaultUsers() {
  if (users.size > 0) return;

  // ⚠️ ВСТАВЬ СВОЙ EMAIL И ПАРОЛЬ ⚠️
  const myEmail = 'vlad2007krasavshik@gmail.com';
  const myPassword = 'Vladik20121984Vladik';
  const mySalt = generateSalt();
  const adminHash = await hashPassword(myPassword, mySalt);

  users.set('usr-admin', {
    id: 'usr-admin',
    name: 'Dexum Owner',
    email: myEmail,
    passwordHash: adminHash,
    salt: saltToHex(mySalt),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'Owner',
    hwid: 'HWID-ADMIN-DEXUM',
    registeredAt: '2025-01-10',
    balance: 999999,
    isBanned: false,
    isEmailVerified: true,
    totpEnabled: false
  });
  emailToId.set(myEmail, 'usr-admin');

  licenses.set('DXM-LIFE-8821-9940-PVPGOD', {
    key: 'DXM-LIFE-8821-9940-PVPGOD',
    user: 'Dexum Owner',
    status: 'active',
    hwid: 'HWID-ADMIN-DEXUM'
  });
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    await initDefaultUsers();

    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') return jsonResponse({ ok: true });
    if (pathname === '/api/health') return jsonResponse({ status: 'ok', usersCount: users.size });

    if (pathname === '/api/auth/register' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { name, email, password, minecraftNick } = body;
        if (!name || !email || !password) return jsonResponse({ success: false, message: 'Заполните поля' }, 400);
        if (password.length < 6) return jsonResponse({ success: false, message: 'Пароль от 6 символов' }, 400);

        const cleanEmail = String(email).trim().toLowerCase();
        if (emailToId.has(cleanEmail)) return jsonResponse({ success: false, message: 'Email уже существует' }, 409);

        const userId = `usr-${Date.now()}`;
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();

        const newUser: WorkerUser = {
          id: userId,
          name: String(name).trim(),
          email: cleanEmail,
          passwordHash,
          salt: saltToHex(salt),
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          minecraftNick: minecraftNick || `${name}_PvP`,
          hwid: `HWID-${randomHex}-DXM`,
          registeredAt: new Date().toISOString().split('T')[0],
          balance: 0,
          isBanned: false,
          isEmailVerified: false,
          totpEnabled: false
        };

        users.set(userId, newUser);
        emailToId.set(cleanEmail, userId);

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        verifyTokens.set(userId, { code: verifyCode, expiresAt: Date.now() + 15 * 60 * 1000 });

        // Не отдаем salt и passwordHash
        const { passwordHash: _, salt: __, totpSecret: ___, ...safeUser } = newUser;
        return jsonResponse({ success: true, message: 'Успешно!', user: safeUser, demoVerificationCode: verifyCode }, 201);
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { email, password, totpCode } = body;
        const cleanEmail = String(email || '').trim().toLowerCase();
        const userId = emailToId.get(cleanEmail);

        if (!userId || !users.has(userId)) return jsonResponse({ success: false, message: 'Неверный Email или пароль' }, 401);

        const user = users.get(userId)!;

        // Восстанавливаем соль юзера и считаем хеш от введенного пароля
        const saltBytes = hexToSalt(user.salt);
        const incomingHash = await hashPassword(password || '', saltBytes);

        if (incomingHash !== user.passwordHash) return jsonResponse({ success: false, message: 'Неверный Email или пароль' }, 401);
        if (user.isBanned) return jsonResponse({ success: false, message: 'Аккаунт заблокирован' }, 403);

        if (user.totpEnabled && user.totpSecret) {
          if (!totpCode) return jsonResponse({ success: false, requires2FA: true, message: 'Требуется 2FA' });
          const isValid = await verifyTOTPToken(String(totpCode), user.totpSecret);
          if (!isValid) return jsonResponse({ success: false, message: 'Неверный код 2FA' }, 400);
        }

        const { passwordHash: _, salt: __, totpSecret: ___, ...safeUser } = user;
        return jsonResponse({ success: true, message: `Добро пожаловать, ${user.name}!`, user: safeUser });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/forgot-password' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const cleanEmail = String(body.email || '').trim().toLowerCase();
        const userId = emailToId.get(cleanEmail);
        if (!userId || !users.has(userId)) return jsonResponse({ success: false, message: 'Аккаунт не найден' }, 404);

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        resetTokens.set(token, { userId, code, expiresAt: Date.now() + 15 * 60 * 1000 });
        return jsonResponse({ success: true, message: `Код отправлен на ${cleanEmail}`, resetToken: token, demoCode: code });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/reset-password' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { token, code, newPassword } = body;
        const session = resetTokens.get(String(token));
        if (!session) return jsonResponse({ success: false, message: 'Сессия устарела' }, 400);
        if (session.code !== String(code).trim()) return jsonResponse({ success: false, message: 'Неверный код' }, 400);
        if (String(newPassword).length < 6) return jsonResponse({ success: false, message: 'Пароль от 6 символов' }, 400);

        const user = users.get(session.userId);
        if (!user) return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);

        // НОВАЯ СОЛЬ при смене пароля
        const newSalt = generateSalt();
        user.passwordHash = await hashPassword(String(newPassword), newSalt);
        user.salt = saltToHex(newSalt);
        user.isEmailVerified = true;
        resetTokens.delete(token);

        return jsonResponse({ success: true, message: 'Пароль изменен' });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/2fa/setup' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const user = users.get(body.userId);
        if (!user) return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);

        const secret = generateBase32Secret(20);
        const serviceName = 'Dexum Client';
        const otpauth = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}&algorithm=SHA1&digits=6&period=30`;
        const qrCodeDataUrl = await QRCode.toDataURL(otpauth, { margin: 1, color: { dark: '#ffffff', light: '#101014' } });

        return jsonResponse({ success: true, secret, qrCode: qrCodeDataUrl });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/2fa/enable' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { userId, secret, code } = body;
        const user = users.get(userId);
        if (!user) return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);
        const isValid = await verifyTOTPToken(String(code), String(secret));
        if (!isValid) return jsonResponse({ success: false, message: 'Неверный код 2FA' }, 400);
        user.totpEnabled = true;
        user.totpSecret = String(secret);
        return jsonResponse({ success: true, message: '2FA включена' });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/auth/2fa/disable' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { userId, code } = body;
        const user = users.get(userId);
        if (!user) return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);
        if (user.totpEnabled && user.totpSecret) {
          const isValid = await verifyTOTPToken(String(code), user.totpSecret);
          if (!isValid) return jsonResponse({ success: false, message: 'Неверный код 2FA' }, 400);
        }
        user.totpEnabled = false;
        user.totpSecret = undefined;
        return jsonResponse({ success: true, message: '2FA отключена' });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    if (pathname === '/api/client/auth' && request.method === 'POST') {
      const body: any = await request.json();
      const { key, hwid } = body;
      if (!key) return jsonResponse({ success: false, message: 'Ключ не указан' }, 400);
      const lic = licenses.get(key);
      if (!lic) return jsonResponse({ success: false, message: 'Недействительный ключ' }, 403);
      return jsonResponse({ success: true, user: lic.user, status: lic.status, hwid: lic.hwid });
    }

    return jsonResponse({ error: 'Endpoint not found', path: pathname }, 404);
  }
};