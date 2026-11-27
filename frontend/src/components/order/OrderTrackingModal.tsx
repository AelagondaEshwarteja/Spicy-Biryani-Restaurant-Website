import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, MapPin, RefreshCw, Search } from 'lucide-react';
import type { Order } from '../../types';
import { orderApi } from '../../services/api';
import { RESTAURANT } from '../../data/siteInfo';
import { formatDateTime, formatPrice, PAYMENT_LABELS } from '../../utils/format';
import Modal from '../common/Modal';
import OrderStatusSteps from './OrderStatusSteps';
import BillSummary from './BillSummary';

interface OrderTrackingModalProps {
  onClose: () => void;
  initialOrderNumber?: string;
  initialPhone?: string;
}

const REFRESH_EVERY_MS = 20000; // check for status updates every 20 seconds

// Fills the form with the last order placed on this device
function getLastOrder() {
  try {
    return JSON.parse(localStorage.getItem('lastOrder') || '{}');
  } catch {
    return {};
  }
}

export default function OrderTrackingModal({ onClose, initialOrderNumber, initialPhone }: OrderTrackingModalProps) {
  const lastOrder = getLastOrder();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || lastOrder.orderNumber || '');
  const [phone, setPhone] = useState(initialPhone || lastOrder.phone || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async (number: string, mobile: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await orderApi.track(number, mobile);
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not find the order');
    } finally {
      setLoading(false);
    }
  }, []);

  // If we came straight from checkout, load the order immediately
  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      fetchOrder(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone, fetchOrder]);

  // Keep checking for updates while the order is still on its way
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;

    const timer = setInterval(() => {
      orderApi
        .track(order.orderNumber, phone)
        .then((data) => setOrder(data.order))
        .catch(() => {}); // ignore a failed background refresh
    }, REFRESH_EVERY_MS);

    return () => clearInterval(timer);
  }, [order, phone]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please enter both your order number and phone number');
      return;
    }
    fetchOrder(orderNumber, phone);
  };

  return (
    <Modal
      title="Track your order"
      subtitle={order ? `Order ${order.orderNumber}` : 'Enter the details from your order'}
      onClose={onClose}
      size="lg"
    >
      {!order ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="track-number" className="label">Order number</label>
              <input
                id="track-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="input font-mono"
                placeholder="SB-251127-4821"
              />
            </div>
            <div>
              <label htmlFor="track-phone" className="label">Phone number used for the order</label>
              <input
                id="track-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="98765 43210"
              />
            </div>
          </div>

          {error && <p className="rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Looking up...' : 'Track order'}
          </button>
        </form>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-ink-soft">Placed {formatDateTime(order.createdAt)}</p>
              <button
                onClick={() => fetchOrder(order.orderNumber, phone)}
                className="inline-flex items-center gap-1 text-sm font-medium text-chili-600 hover:text-chili-700"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
            <OrderStatusSteps order={order} />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-cream p-5">
              <h3 className="font-semibold">Items</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.menuItem} className="flex justify-between gap-3">
                    <span className="text-ink-soft">
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-ink/10 pt-4">
                <BillSummary
                  subtotal={order.subtotal}
                  deliveryFee={order.deliveryFee}
                  gst={order.gst}
                  total={order.totalAmount}
                />
              </div>
              <p className="mt-3 text-xs text-ink-soft">Payment: {PAYMENT_LABELS[order.paymentMethod]}</p>
            </div>

            <div className="flex gap-3 rounded-2xl bg-cream p-5 text-sm">
              <MapPin className="h-5 w-5 flex-shrink-0 text-chili-600" />
              <div>
                <p className="font-semibold">Delivering to {order.customerName}</p>
                <p className="text-ink-soft">{order.deliveryAddress}</p>
              </div>
            </div>

            <p className="text-center text-sm text-ink-soft">
              Need help? Call{' '}
              <a href={RESTAURANT.phoneLink} className="font-medium text-chili-600">
                {RESTAURANT.phone}
              </a>
            </p>
            <button onClick={() => setOrder(null)} className="btn-outline w-full">
              Track a different order
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
