import { useState, type FormEvent } from 'react';
import { Banknote, CheckCircle2, Copy, CreditCard, Loader2, Smartphone } from 'lucide-react';
import type { Order, PaymentMethod } from '../../types';
import { useCart } from '../../hooks/useCart';
import { orderApi, toOrderLines } from '../../services/api';
import { calculateBill, formatPrice } from '../../utils/format';
import Modal from '../common/Modal';
import BillSummary from './BillSummary';

interface CheckoutModalProps {
  onClose: () => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cod', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
];

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryAddress: '',
  notes: '',
  paymentMethod: 'cod' as PaymentMethod,
};

type FormErrors = Partial<Record<keyof typeof EMPTY_FORM, string>>;

// Checks the form before sending it (the backend checks again)
function validate(form: typeof EMPTY_FORM): FormErrors {
  const errors: FormErrors = {};
  const phoneDigits = form.customerPhone.replace(/\D/g, '').slice(-10);

  if (form.customerName.trim().length < 2) errors.customerName = 'Please enter your name';
  if (!/^[6-9]\d{9}$/.test(phoneDigits)) errors.customerPhone = 'Enter a valid 10-digit mobile number';
  if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
    errors.customerEmail = 'Enter a valid email or leave it empty';
  }
  if (form.deliveryAddress.trim().length < 10) {
    errors.deliveryAddress = 'Please add house no., street and area';
  }
  return errors;
}

export default function CheckoutModal({ onClose, onTrackOrder }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const bill = calculateBill(subtotal);

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formErrors = validate(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    setServerError('');

    try {
      const { order } = await orderApi.create({ ...form, items: toOrderLines(items) });

      // Remember the order so "Track order" can fill it in automatically next time
      localStorage.setItem(
        'lastOrder',
        JSON.stringify({ orderNumber: order.orderNumber, phone: form.customerPhone })
      );

      setPlacedOrder(order);
      clearCart();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not place the order');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderNumber = async () => {
    if (!placedOrder) return;
    await navigator.clipboard.writeText(placedOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- Success screen ----------
  if (placedOrder) {
    return (
      <Modal title="Order placed!" onClose={onClose} size="md">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <p className="mt-4 text-lg">
            Thank you, <strong>{placedOrder.customerName}</strong>! Your food is being prepared.
          </p>

          <div className="mt-6 rounded-2xl bg-cream p-5">
            <p className="text-sm text-ink-soft">Your order number</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-bold tracking-wider">{placedOrder.orderNumber}</span>
              <button onClick={copyOrderNumber} aria-label="Copy order number" className="rounded-lg p-2 hover:bg-ink/5">
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Total {formatPrice(placedOrder.totalAmount)} · pay when it arrives
            </p>
          </div>

          <button
            onClick={() => onTrackOrder(placedOrder.orderNumber, form.customerPhone)}
            className="btn-primary mt-6 w-full"
          >
            Track my order
          </button>
        </div>
      </Modal>
    );
  }

  // ---------- Checkout form ----------
  return (
    <Modal title="Checkout" subtitle="Delivery details" onClose={onClose} size="xl">
      <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name"
                value={form.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className={`input ${errors.customerName ? 'input-error' : ''}`}
                placeholder="Ravi Kumar"
                autoComplete="name"
              />
              {errors.customerName && <p className="mt-1 text-xs text-chili-600">{errors.customerName}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="label">Mobile number</label>
              <input
                id="phone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => updateField('customerPhone', e.target.value)}
                className={`input ${errors.customerPhone ? 'input-error' : ''}`}
                placeholder="98765 43210"
                autoComplete="tel"
              />
              {errors.customerPhone && <p className="mt-1 text-xs text-chili-600">{errors.customerPhone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email <span className="font-normal text-ink-soft">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => updateField('customerEmail', e.target.value)}
              className={`input ${errors.customerEmail ? 'input-error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.customerEmail && <p className="mt-1 text-xs text-chili-600">{errors.customerEmail}</p>}
          </div>

          <div>
            <label htmlFor="address" className="label">Delivery address</label>
            <textarea
              id="address"
              rows={3}
              value={form.deliveryAddress}
              onChange={(e) => updateField('deliveryAddress', e.target.value)}
              className={`input resize-none ${errors.deliveryAddress ? 'input-error' : ''}`}
              placeholder="House no., street, area, landmark"
              autoComplete="street-address"
            />
            {errors.deliveryAddress && <p className="mt-1 text-xs text-chili-600">{errors.deliveryAddress}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Cooking notes <span className="font-normal text-ink-soft">(optional)</span>
            </label>
            <input
              id="notes"
              value={form.notes}
              maxLength={300}
              onChange={(e) => updateField('notes', e.target.value)}
              className="input"
              placeholder="e.g. less spicy, extra raita"
            />
          </div>

          <fieldset>
            <legend className="label">Pay on delivery with</legend>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('paymentMethod', value)}
                  aria-pressed={form.paymentMethod === value}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition ${
                    form.paymentMethod === value
                      ? 'border-chili-600 bg-chili-50 text-chili-700'
                      : 'border-ink/10 hover:border-ink/30'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">You pay the delivery partner when your food arrives.</p>
          </fieldset>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-cream p-5 lg:sticky lg:top-24">
            <h3 className="font-semibold">Order summary</h3>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
              {items.map((item) => (
                <li key={item.menuItemId} className="flex justify-between gap-3">
                  <span className="text-ink-soft">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink/10 pt-4">
              <BillSummary {...bill} />
            </div>

            {serverError && <p className="mt-4 rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{serverError}</p>}

            <button type="submit" disabled={submitting || items.length === 0} className="btn-primary mt-5 w-full py-3.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Placing order...' : `Place order · ${formatPrice(bill.total)}`}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
