// RFC 6238 TOTP Validation and Secret Generator (Google Authenticator)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Standard 16-character (80-bit) Base32 secret for strict iOS/Google Authenticator compatibility
export function generateBase32Secret(): string {
  const bytes = new Uint8Array(10); // 10 bytes = exactly 16 base32 characters (16 * 5 bits = 80 bits)
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
    secret += BASE32_ALPHABET[(bytes[i] >> 3) % 32];
  }
  return secret.slice(0, 16);
}

export function base32Decode(base32: string): Uint8Array {
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

export async function getTOTPToken(secret: string, timeStepWindow = 0): Promise<string> {
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

export async function verifyTOTPToken(token: string, secret: string): Promise<boolean> {
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return false;
  }
  // Allow -2 to +2 windows (up to 60 seconds time drift on mobile phones)
  for (let window = -2; window <= 2; window++) {
    const expected = await getTOTPToken(secret, window);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}
