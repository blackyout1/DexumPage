import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory persistent state for orders, keys & licenses
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

const ordersDB: Map<string, ServerOrder> = new Map();
const licensesDB: Map<string, ServerLicense> = new Map();

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
    timestamp: new Date().toISOString()
  });
});

// 2. Get payment gateway configurations status
app.get('/api/payment/gateways', (req, res) => {
  const aaioConfigured = !!(process.env.AAIO_API_KEY && process.env.AAIO_SHOP_ID);
  const freekassaConfigured = !!(process.env.FREEKASSA_MERCHANT_ID && process.env.FREEKASSA_SECRET_1);
  const crystalpayConfigured = !!(process.env.CRYSTALPAY_AUTH_LOGIN && process.env.CRYSTALPAY_AUTH_SECRET);
  const lavaConfigured = !!(process.env.LAVA_SECRET_KEY && process.env.LAVA_SHOP_ID);

  res.json({
    activeGateways: {
      aaio: aaioConfigured,
      freekassa: freekassaConfigured,
      crystalpay: crystalpayConfigured,
      lava: lavaConfigured,
      demo: true
    },
    paymentMethods: [
      { id: 'sbp', name: 'СБП (Система быстрых платежей)', fee: '0%', instant: true },
      { id: 'card', name: 'Банковская карта (МИР / Visa / MC)', fee: '0%', instant: true },
      { id: 'crypto', name: 'Криптовалюта (USDT / TON / BTC)', fee: '0%', instant: true },
      { id: 'yoomoney', name: 'ЮMoney', fee: '1%', instant: true }
    ]
  });
});

// 3. Create Payment Order / Invoice
app.post('/api/payment/create', async (req, res) => {
  try {
    const { 
      productId, 
      productName, 
      price, 
      email, 
      nickname, 
      paymentMethod = 'sbp',
      promoCode = ''
    } = req.body;

    if (!productId || !price || !email) {
      return res.status(400).json({ error: 'Не указаны обязательные данные заказа' });
    }

    // Apply promo code discount (e.g. DEXUM gives 15% off)
    let finalAmount = Number(price);
    if (promoCode.trim().toUpperCase() === 'DEXUM') {
      finalAmount = Math.round(finalAmount * 0.85);
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    let redirectUrl = '';
    let isInstant = false;

    // Check AAIO Integration
    if (process.env.AAIO_API_KEY && process.env.AAIO_SHOP_ID && process.env.AAIO_SECRET_1) {
      const merchantId = process.env.AAIO_SHOP_ID;
      const secret1 = process.env.AAIO_SECRET_1;
      const currency = 'RUB';
      const desc = `Оплата ${productName} (1.21) для ${nickname || email}`;
      
      // AAIO Signature: merchant_id:amount:currency:secret:order_id
      const signStr = `${merchantId}:${finalAmount}:${currency}:${secret1}:${orderId}`;
      const sign = crypto.createHash('sha256').update(signStr).digest('hex');

      redirectUrl = `https://aaio.so/merchant/pay?merchant_id=${merchantId}&amount=${finalAmount}&currency=${currency}&order_id=${orderId}&sign=${sign}&desc=${encodeURIComponent(desc)}&email=${encodeURIComponent(email)}`;
    } 
    // Check FreeKassa Integration
    else if (process.env.FREEKASSA_MERCHANT_ID && process.env.FREEKASSA_SECRET_1) {
      const merchantId = process.env.FREEKASSA_MERCHANT_ID;
      const secret1 = process.env.FREEKASSA_SECRET_1;
      const currency = 'RUB';
      
      // FreeKassa Signature: merchant_id:amount:secret_word_1:currency:order_id
      const signStr = `${merchantId}:${finalAmount}:${secret1}:${currency}:${orderId}`;
      const sign = crypto.createHash('md5').update(signStr).digest('hex');

      redirectUrl = `https://pay.freekassa.ru/?m=${merchantId}&oa=${finalAmount}&o=${orderId}&s=${sign}&currency=${currency}&em=${encodeURIComponent(email)}`;
    }
    // Check CrystalPay Integration
    else if (process.env.CRYSTALPAY_AUTH_LOGIN && process.env.CRYSTALPAY_AUTH_SECRET) {
      // CrystalPay API endpoint invocation can be done here
      redirectUrl = `${appUrl}/payment/crystalpay?order=${orderId}`;
    }
    // Default: Direct / Instant Checkout for seamless purchase and testing
    else {
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

    // If instant/test mode, create active license immediately
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
        ? 'Оплата успешно подтверждена! Лицензионный ключ сгенерирован.' 
        : 'Перенаправление на шлюз оплаты...'
    });

  } catch (err: any) {
    console.error('Payment create error:', err);
    res.status(500).json({ error: 'Ошибка создания платежа: ' + err.message });
  }
});

// 4. Webhook handler for payment callbacks (Aaio / FreeKassa / CrystalPay)
app.all('/api/payment/webhook/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const body = req.method === 'POST' ? req.body : req.query;
    console.log(`Received ${provider} webhook:`, body);

    const orderId = body.order_id || body.MERCHANT_ORDER_ID || body.id;
    if (!orderId || !ordersDB.has(orderId)) {
      return res.status(400).send('Order not found');
    }

    const order = ordersDB.get(orderId)!;
    order.status = 'completed';
    const key = order.licenseKey || generateLicenseKey('DXM');
    order.licenseKey = key;

    // Create license
    const license: ServerLicense = {
      id: `lic-${Date.now()}`,
      key,
      productId: order.productId,
      productName: order.productName,
      userId: order.userId,
      userName: order.userName,
      email: order.email,
      hwid: null,
      status: 'active',
      expiresAt: order.productId.includes('lifetime') ? 'Lifetime' : '30 дней',
      createdAt: new Date().toISOString(),
      lastHwidReset: null
    };
    licensesDB.set(key, license);

    // Gateway response formats
    if (provider === 'aaio') {
      return res.send('OK');
    }
    if (provider === 'freekassa') {
      return res.send('YES');
    }
    return res.json({ success: true, licenseKey: key });

  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook process error');
  }
});

// 5. Client Launcher API: Verify License & HWID
app.post('/api/client/auth', (req, res) => {
  const { key, hwid, version } = req.body;

  if (!key) {
    return res.status(400).json({ success: false, message: 'Ключ не указан' });
  }

  const lic = licensesDB.get(key);
  if (!lic) {
    // Check if key is standard demo admin/buyer key
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

  // Bind HWID on first launch
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

// 6. Reset HWID endpoint
app.post('/api/client/reset-hwid', (req, res) => {
  const { key } = req.body;
  if (!key || !licensesDB.has(key)) {
    return res.json({ success: true, message: 'HWID успешно сброшен (Демо)' });
  }

  const lic = licensesDB.get(key)!;
  lic.hwid = null;
  lic.lastHwidReset = new Date().toISOString().slice(0, 10);

  return res.json({
    success: true,
    message: 'HWID успешно сброшен. Теперь вы можете запустить клиент на новом ПК.'
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
    console.log(`Dexum Client Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteMiddleware();
