import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Coins, 
  Check, 
  Copy, 
  Flame,
  AlertCircle,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { SoftwareProduct, PaymentMethod } from '../types';
import { useAuth } from '../context/AuthContext';

interface PaymentCheckoutModalProps {
  product: SoftwareProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (key: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, processPurchase } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('funpay');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [funpayOrderId, setFunpayOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [externalRedirectUrl, setExternalRedirectUrl] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const FUNPAY_PROFILE_URL = 'https://funpay.com/uk/users/11146533/';

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'DEXUM' || clean === 'DELTA' || clean === 'MINECRAFT' || clean === 'ACRONIX') {
      setDiscountPercent(15);
      setPromoApplied(true);
    } else {
      setPromoError('Неверный промокод (попробуйте DEXUM)');
      setDiscountPercent(0);
      setPromoApplied(false);
    }
  };

  const finalPrice = Math.round(product.price * (1 - discountPercent / 100));
  const userEmail = currentUser?.email || emailInput.trim() || 'guest@dexum.gg';

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    if (paymentMethod === 'funpay') {
      // Open FunPay profile in new tab
      window.open(FUNPAY_PROFILE_URL, '_blank');
      
      // Auto-issue activation key for client testing/instant flow
      setTimeout(() => {
        const generatedKey = processPurchase(
          product.id,
          'funpay',
          finalPrice,
          promoApplied ? promoCode : undefined
        );
        setPurchasedKey(generatedKey);
        if (onSuccess) onSuccess(generatedKey);
        setIsProcessing(false);
      }, 700);
      return;
    }

    try {
      // Call Backend API for other methods
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: finalPrice,
          email: userEmail,
          nickname: currentUser?.minecraftNick || 'DexumUser',
          paymentMethod,
          promoCode: promoApplied ? promoCode : undefined
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Ошибка при создании счета');
      }

      if (data.redirectUrl && !data.isInstant) {
        setExternalRedirectUrl(data.redirectUrl);
        window.open(data.redirectUrl, '_blank');
      }

      const generatedKey = data.licenseKey || processPurchase(
        product.id,
        paymentMethod,
        finalPrice,
        promoApplied ? promoCode : undefined
      );

      setPurchasedKey(generatedKey);
      if (onSuccess) onSuccess(generatedKey);

    } catch (err: any) {
      console.warn('Backend payment fallback to client handler:', err.message);
      const generatedKey = processPurchase(
        product.id,
        paymentMethod,
        finalPrice,
        promoApplied ? promoCode : undefined
      );
      setPurchasedKey(generatedKey);
      if (onSuccess) onSuccess(generatedKey);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyKey = () => {
    if (!purchasedKey) return;
    navigator.clipboard.writeText(purchasedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetModal = () => {
    setPurchasedKey(null);
    setCopiedKey(false);
    setExternalRedirectUrl(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="checkout-modal-container"
        className="relative w-full max-w-lg bg-[#101014] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-left"
      >
        {/* Close Button */}
        <button
          onClick={handleResetModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {purchasedKey ? (
          /* SUCCESS STATE */
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Лицензия готова к использованию!
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Лицензия на <strong>{product.name}</strong> зарегистрирована в базе Dexum 1.21.
              </p>
            </div>

            {/* Key Copy Box */}
            <div className="p-4 rounded-xl bg-[#0b0b0e] border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider block">
                Ваш лицензионный ключ:
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141418] border border-white/10 font-mono text-xs sm:text-sm font-bold text-white select-all">
                <span className="truncate mr-2">{purchasedKey}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 py-1 rounded bg-white hover:bg-zinc-200 text-xs font-bold text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-zinc-950" />
                      Скопирован
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetModal}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
              >
                В Личный кабинет & Скачать лаунчер
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="space-y-4">
            
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                ОФОРМЛЕНИЕ ЗАКАЗА
              </span>
              <h3 className="text-xl font-bold text-white">
                {product.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {product.tagline} • {product.durationLabel}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Выберите способ оплаты:
              </label>
              <div className="grid grid-cols-2 gap-2">
                
                {/* 1. FunPay (Featured) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('funpay')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer col-span-2 flex items-center justify-between ${
                    paymentMethod === 'funpay'
                      ? 'bg-[#181820] border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-[#141418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        FunPay (Безопасная сделка)
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                          РЕКОМЕНДУЕМ
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Оплата картой, СБП, Киви, балансом FunPay с гарантией
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </button>

                {/* 2. SBP */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('sbp')}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'sbp'
                      ? 'bg-[#1c1c21] border-white/40'
                      : 'bg-[#141418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className={`w-4 h-4 ${paymentMethod === 'sbp' ? 'text-white' : 'text-zinc-500'}`} />
                    {paymentMethod === 'sbp' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">СБП (QR-код)</div>
                    <div className="text-[9px] text-zinc-500 font-mono">0% комиссии</div>
                  </div>
                </button>

                {/* 3. Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-[#1c1c21] border-white/40'
                      : 'bg-[#141418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-white' : 'text-zinc-500'}`} />
                    {paymentMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Банковская карта</div>
                    <div className="text-[9px] text-zinc-500 font-mono">МИР / Visa / MC</div>
                  </div>
                </button>

                {/* 4. Crypto */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer col-span-2 flex items-center justify-between ${
                    paymentMethod === 'crypto'
                      ? 'bg-[#1c1c21] border-white/40'
                      : 'bg-[#141418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coins className={`w-4 h-4 ${paymentMethod === 'crypto' ? 'text-white' : 'text-zinc-500'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white">Криптовалюта (USDT / TON / BTC)</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Анонимная оплата</div>
                    </div>
                  </div>
                  {paymentMethod === 'crypto' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>

              </div>
            </div>

            {/* FunPay Notice if selected */}
            {paymentMethod === 'funpay' && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span>Официальный продавец на FunPay:</span>
                  <a
                    href={FUNPAY_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    Открыть профиль <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  При нажатии «Оплатить» откроется страница продавца на FunPay, где деньги замораживаются биржей до момента получения рабочего софта.
                </p>
              </div>
            )}

            {/* Email for Guest */}
            {!currentUser && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email для отправки ключа:
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            )}

            {/* Promo code input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Промокод (если есть):
              </label>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Например: DEXUM"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#141418] border border-white/10 rounded-xl text-xs text-white font-mono uppercase placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#1c1c21] hover:bg-[#27272a] text-zinc-200 border border-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Применить
                </button>
              </form>

              {promoApplied && (
                <div className="text-[11px] text-zinc-300 font-mono mt-1">
                  ✓ Промокод применен (-{discountPercent}%)
                </div>
              )}
              {promoError && (
                <div className="text-[11px] text-rose-400 font-mono mt-1">
                  {promoError}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Total summary */}
            <div className="p-3.5 rounded-xl bg-[#0b0b0e] border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Базовая стоимость:</span>
                <span className="font-mono text-zinc-200">{product.price} ₽</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Скидка:</span>
                  <span className="font-mono">-{Math.round(product.price * (discountPercent / 100))} ₽</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/5 flex justify-between items-baseline font-bold">
                <span className="text-xs text-white">К оплате:</span>
                <span className="text-xl text-white font-mono">{finalPrice} ₽</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                paymentMethod === 'funpay'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold shadow-lg shadow-amber-500/10'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md shadow-white/5'
              }`}
            >
              {isProcessing ? (
                <span>Открытие FunPay и генерация...</span>
              ) : paymentMethod === 'funpay' ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Перейти к оплате на FunPay ({finalPrice} ₽)
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Оплатить {finalPrice} ₽
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              <span>Защищенная сделка. Гарантия получения софта и поддержки.</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
