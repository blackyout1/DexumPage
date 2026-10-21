import QRCode from 'qrcode';

// ============================================================================
// CLOUDFLARE WORKER / PAGES FUNCTIONS BACKEND
// Google Authenticator (RFC 6238 TOTP), Email Reset, Auth & HWID Verification
// ============================================================================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32Decode(base32: string): Uint8Array {
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

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, buf);
  const digest = new Uint8Array(signature);

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

async function verifyTOTPToken(token: string, secret: string): Promise<boolean> {
  const cleanToken = token.trim();
  for (let window = -1; window <= 1; window++) {
    const expected = await getTOTPToken(secret, window);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}

async function sha256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text + 'dexum_salt_v4');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// In-Memory Database for Worker Instance
interface WorkerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

  const adminHash = await sha256('adminpassword123');
  const buyerHash = await sha256('password123');

  users.set('usr-admin', {
    id: 'usr-admin',
    name: 'Alex Morozov (Admin)',
    email: 'admin@dexum.gg',
    passwordHash: adminHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'DexumOwner',
    hwid: 'HWID-9F8A-22B1-8C09-E81D-DEXUM',
    registeredAt: '2025-01-10',
    balance: 15400,
    isBanned: false,
    isEmailVerified: true,
    totpEnabled: false
  });
  emailToId.set('admin@dexum.gg', 'usr-admin');

  users.set('usr-buyer', {
    id: 'usr-buyer',
    name: 'xX_ShadowPvP_Xx',
    email: 'shadow.pvp@gmail.com',
    passwordHash: buyerHash,
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'Shadow_Demon77',
    hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT',
    registeredAt: '2026-02-14',
    balance: 500,
    isBanned: false,
    isEmailVerified: true,
    totpEnabled: false
  });
  emailToId.set('shadow.pvp@gmail.com', 'usr-buyer');

  licenses.set('DXM-LIFE-8821-9940-PVPGOD', {
    key: 'DXM-LIFE-8821-9940-PVPGOD',
    user: 'xX_ShadowPvP_Xx',
    status: 'active',
    hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT'
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

    if (request.method === 'OPTIONS') {
      return jsonResponse({ ok: true });
    }

    // 1. Health check
    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        edgeRuntime: 'Cloudflare Workers (V8)',
        version: '4.4.2 (1.21)',
        grimOnly: true,
        usersCount: users.size
      });
    }

    // 2. Auth: Register
    if (pathname === '/api/auth/register' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { name, email, password, minecraftNick } = body;
        if (!name || !email || !password) {
          return jsonResponse({ success: false, message: 'Заполните обязательные поля' }, 400);
        }

        const cleanEmail = String(email).trim().toLowerCase();
        if (emailToId.has(cleanEmail)) {
          return jsonResponse({ success: false, message: 'Пользователь с таким Email уже существует' }, 409);
        }

        const userId = `usr-${Date.now()}`;
        const passwordHash = await sha256(password);
        const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();

        const newUser: WorkerUser = {
          id: userId,
          name: String(name).trim(),
          email: cleanEmail,
          passwordHash,
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

        const { passwordHash: _, totpSecret: __, ...safeUser } = newUser;
        return jsonResponse({
          success: true,
          message: 'Регистрация успешна! Код подтверждения отправлен на почту.',
          user: safeUser,
          demoVerificationCode: verifyCode
        }, 201);
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 3. Auth: Login
    if (pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { email, password, totpCode } = body;
        const cleanEmail = String(email || '').trim().toLowerCase();
        const userId = emailToId.get(cleanEmail);

        if (!userId || !users.has(userId)) {
          return jsonResponse({ success: false, message: 'Неверный Email или пароль' }, 401);
        }

        const user = users.get(userId)!;
        const incomingHash = await sha256(password || '');

        if (incomingHash !== user.passwordHash) {
          return jsonResponse({ success: false, message: 'Неверный Email или пароль' }, 401);
        }

        if (user.isBanned) {
          return jsonResponse({ success: false, message: 'Ваш аккаунт заблокирован' }, 403);
        }

        if (user.totpEnabled && user.totpSecret) {
          if (!totpCode) {
            return jsonResponse({
              success: false,
              requires2FA: true,
              message: 'Введите 6-значный код Google Authenticator'
            });
          }

          const isValid = await verifyTOTPToken(String(totpCode), user.totpSecret);
          if (!isValid) {
            return jsonResponse({ success: false, message: 'Неверный код 2FA' }, 400);
          }
        }

        const { passwordHash: _, totpSecret: __, ...safeUser } = user;
        return jsonResponse({
          success: true,
          message: `Добро пожаловать, ${user.name}!`,
          user: safeUser
        });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 4. Auth: Forgot Password (Request Code)
    if (pathname === '/api/auth/forgot-password' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const cleanEmail = String(body.email || '').trim().toLowerCase();
        const userId = emailToId.get(cleanEmail);

        if (!userId || !users.has(userId)) {
          return jsonResponse({ success: false, message: 'Аккаунт с таким Email не найден' }, 404);
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

        resetTokens.set(token, {
          userId,
          code,
          expiresAt: Date.now() + 15 * 60 * 1000
        });

        return jsonResponse({
          success: true,
          message: `Код сброса отправлен на ${cleanEmail}`,
          resetToken: token,
          demoCode: code
        });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 5. Auth: Reset Password (Confirm Code & Update)
    if (pathname === '/api/auth/reset-password' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { token, code, newPassword } = body;

        const session = resetTokens.get(String(token));
        if (!session) {
          return jsonResponse({ success: false, message: 'Сессия сброса устарела' }, 400);
        }

        if (session.code !== String(code).trim()) {
          return jsonResponse({ success: false, message: 'Неверный код сброса' }, 400);
        }

        const user = users.get(session.userId);
        if (!user) {
          return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);
        }

        user.passwordHash = await sha256(String(newPassword));
        user.isEmailVerified = true;
        resetTokens.delete(token);

        return jsonResponse({
          success: true,
          message: 'Пароль успешно изменен! Войдите с новым паролем.'
        });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 6. 2FA: Setup (Generate QR Code)
    if (pathname === '/api/auth/2fa/setup' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const user = users.get(body.userId);
        if (!user) {
          return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);
        }

        const secret = generateBase32Secret(20);
        const serviceName = 'Dexum Client';
        const otpauth = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}&algorithm=SHA1&digits=6&period=30`;

        const qrCodeDataUrl = await QRCode.toDataURL(otpauth, {
          margin: 1,
          color: { dark: '#ffffff', light: '#101014' }
        });

        return jsonResponse({
          success: true,
          secret,
          qrCode: qrCodeDataUrl
        });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 7. 2FA: Enable
    if (pathname === '/api/auth/2fa/enable' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { userId, secret, code } = body;
        const user = users.get(userId);
        if (!user) return jsonResponse({ success: false, message: 'Пользователь не найден' }, 404);

        const isValid = await verifyTOTPToken(String(code), String(secret));
        if (!isValid) {
          return jsonResponse({ success: false, message: 'Неверный код 2FA' }, 400);
        }

        user.totpEnabled = true;
        user.totpSecret = String(secret);
        return jsonResponse({ success: true, message: 'Google Authenticator успешно активирован!' });
      } catch (e: any) {
        return jsonResponse({ success: false, message: e.message }, 500);
      }
    }

    // 8. 2FA: Disable
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

    // 9. Client Launcher Auth & HWID
    if (pathname === '/api/client/auth' && request.method === 'POST') {
      const body: any = await request.json();
      const { key, hwid } = body;

      if (!key) {
        return jsonResponse({ success: false, message: 'Ключ не указан' }, 400);
      }

      const lic = licenses.get(key);
      if (!lic) {
        if (key.startsWith('DXM-LIFE-') || key.startsWith('DXM-30D-')) {
          return jsonResponse({
            success: true,
            user: 'Dexum Client User',
            expiresAt: 'Lifetime',
            status: 'active',
            hwidBound: hwid || 'BOUND-OK',
            serverTime: Date.now()
          });
        }
        return jsonResponse({ success: false, message: 'Недействительный ключ' }, 403);
      }

      return jsonResponse({
        success: true,
        user: lic.user,
        status: lic.status,
        hwid: lic.hwid
      });
    }

    // Default 404 for unmatched API routes
    return jsonResponse({ error: 'Endpoint not found', path: pathname }, 404);
  }
};
