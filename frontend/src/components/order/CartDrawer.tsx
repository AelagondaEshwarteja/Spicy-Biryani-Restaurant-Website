import { useState } from 'react';
import { HeartPulse, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { calculateBill, formatPrice, FREE_DELIVERY_ABOVE } from '../../utils/format';
import VegBadge from '../common/VegBadge';
import QuantityStepper from '../common/QuantityStepper';
import BillSummary from './BillSummary';
import MealCheckModal from './MealCheckModal';

interface CartDrawerProps {
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ onClose, onCheckout }: CartDrawerProps) {
  useLockBodyScroll();
  const { items, subtotal, increase, decrease, removeItem } = useCart();
  const [showMealCheck, setShowMealCheck] = useState(false);

  const bill = calculateBill(subtotal);
  const amountForFreeDelivery = FREE_DELIVERY_ABOVE - subtotal;
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_ABOVE) * 100);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end" role="dialog" aria-modal="true" aria-label="Your cart">
      <div className="absolute inset-0 animate-fade-in bg-ink/60 backdrop-blur-sm" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-md animate-slide-in-right flex-col bg-cream shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-chili-600" />
            <h2 className="font-display text-2xl font-bold">Your cart</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="grid h-10 w-10 place-items-center rounded-full bg-cream transition hover:bg-saffron-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-saffron-50">
              <ShoppingBag className="h-9 w-9 text-saffron-600" />
            </span>
            <p className="mt-5 font-display text-xl font-bold">Your cart is empty</p>
            <p className="mt-1 text-ink-soft">A good biryani is just a few taps away.</p>
            <a href="#menu" onClick={onClose} className="btn-primary mt-6">
              Browse the menu
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {/* Free delivery progress bar */}
              <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
                <p className="text-sm text-ink">
                  {amountForFreeDelivery > 0 ? (
                    <>
                      Add <strong>{formatPrice(amountForFreeDelivery)}</strong> more for free delivery
                    </>
                  ) : (
                    <strong className="text-green-700">Yay! You get free delivery 🎉</strong>
                  )}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {items.map((item) => (
                <div key={item.menuItemId} className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-ink/5">
                  <img src={item.image} alt={item.name} className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <span className="mt-1">
                        <VegBadge isVeg={item.isVeg} />
                      </span>
                      <p className="flex-1 font-semibold leading-snug text-ink">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-ink-soft transition hover:text-chili-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper
                        size="sm"
                        quantity={item.quantity}
                        onIncrease={() => increase(item.menuItemId)}
                        onDecrease={() => decrease(item.menuItemId)}
                      />
                      <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowMealCheck(true)}
                className="flex w-full items-center gap-3 rounded-2xl bg-green-50 p-4 text-left ring-1 ring-green-600/20 transition hover:bg-green-100"
              >
                <HeartPulse className="h-6 w-6 flex-shrink-0 text-green-700" />
                <span>
                  <span className="block font-semibold text-green-900">Check my meal</span>
                  <span className="block text-sm text-green-800/80">See calories, protein and quick tips</span>
                </span>
              </button>
            </div>

            <footer className="border-t border-ink/10 bg-white p-6">
              <BillSummary {...bill} />
              <button onClick={onCheckout} className="btn-primary mt-5 w-full py-3.5 text-base">
                Checkout · {formatPrice(bill.total)}
              </button>
            </footer>
          </>
        )}
      </aside>

      {showMealCheck && <MealCheckModal items={items} onClose={() => setShowMealCheck(false)} />}
    </div>
  );
}
