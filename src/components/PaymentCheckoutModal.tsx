import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Coins, 
  Check, 
  Copy, 
  Flame 
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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sbp');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen || !product) return null;

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

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedKey = processPurchase(
        product.id,
        paymentMethod,
        finalPrice,
        promoApplied ? promoCode : undefined
      );

      setIsProcessing(false);
      setPurchasedKey(generatedKey);
      if (onSuccess) onSuccess(generatedKey);
    }, 1200);
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
                Оплата прошла успешно!
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Лицензия на <strong>{product.name}</strong> активирована и привязана к вашему аккаунту.
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
                В Личный кабинет & Скачать
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
                Способ оплаты:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sbp', label: 'СБП (QR)', sub: '0% комиссии', icon: QrCode },
                  { id: 'card', label: 'Карта РФ', sub: 'МИР, Visa, MC', icon: CreditCard },
                  { id: 'crypto', label: 'Криптовалюта', sub: 'USDT, BTC, TON', icon: Coins }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'bg-[#1c1c21] border-white/40'
                          : 'bg-[#141418] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSel ? 'text-white' : 'text-zinc-500'}`} />
                        {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{pm.label}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">{pm.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email for Guest or Current User */}
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
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md shadow-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Генерация безопасного счета...</span>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Перейти к оплате ({finalPrice} ₽)
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              <span>Защищенный шлюз. Моментальная выдача ключа сразу после оплаты.</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
