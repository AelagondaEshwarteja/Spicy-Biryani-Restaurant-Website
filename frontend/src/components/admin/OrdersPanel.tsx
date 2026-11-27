import { useCallback, useEffect, useState } from 'react';
import { Inbox, Loader2, MapPin, Phone, RefreshCw } from 'lucide-react';
import type { Order, OrderStats, OrderStatus } from '../../types';
import { orderApi } from '../../services/api';
import {
  formatDateTime,
  formatPrice,
  PAYMENT_LABELS,
  STATUS_FLOW,
  STATUS_LABELS,
  STATUS_STYLES,
  timeAgo,
} from '../../utils/format';

interface OrdersPanelProps {
  stats: OrderStats | null;
  onChange: () => void;
  onError: (err: unknown) => string;
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'all', label: 'All' },
  ...(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(
    (status) => ({ id: status, label: STATUS_LABELS[status] })
  ),
];

const REFRESH_EVERY_MS = 15000;

export default function OrdersPanel({ stats, onChange, onError }: OrdersPanelProps) {
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const data = await orderApi.getAll(filter);
        setOrders(data.orders ?? []);
        setError('');
      } catch (err) {
        setError(onError(err));
      } finally {
        setLoading(false);
      }
    },
    [filter, onError]
  );

  // Load when the filter changes, then keep refreshing so new orders show up on their own
  useEffect(() => {
    loadOrders(true);
    const timer = setInterval(() => loadOrders(), REFRESH_EVERY_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const selectedOrder = orders.find((order) => order._id === selectedId) || null;

  const changeStatus = async (order: Order, status: OrderStatus) => {
    if (status === 'cancelled' && !window.confirm(`Cancel order ${order.orderNumber}?`)) return;

    setUpdating(true);
    try {
      const data = await orderApi.updateStatus(order._id!, status);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
      onChange(); // refresh the numbers at the top
    } catch (err) {
      setError(onError(err));
    } finally {
      setUpdating(false);
    }
  };

  const countFor = (id: string) => {
    if (!stats) return null;
    if (id === 'all') return stats.totalOrders;
    if (id === 'active') return stats.activeOrders;
    return stats.statusCounts[id as OrderStatus] ?? 0;
  };

  const itemCount = (order: Order) => {
    const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  };

  const nextStatus = (order: Order) => {
    const index = STATUS_FLOW.indexOf(order.status);
    return index >= 0 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === id ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30'
            }`}
          >
            {label}
            {countFor(id) !== null && <span className="ml-1.5 opacity-60">{countFor(id)}</span>}
          </button>
        ))}
        <button
          onClick={() => loadOrders(true)}
          className="ml-auto inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="card mt-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-ink/30" />
          <p className="mt-3 text-ink-soft">No orders here yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* Order list */}
          <div className="space-y-3 lg:col-span-2">
            {orders.map((order) => (
              <button
                key={order._id}
                onClick={() => setSelectedId(order._id!)}
                className={`card block w-full p-4 text-left transition ${
                  selectedId === order._id ? 'ring-2 !ring-chili-600' : 'hover:ring-ink/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold">{order.orderNumber}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {order.customerName} · {itemCount(order)}
                  </span>
                  <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">{timeAgo(order.createdAt)}</p>
              </button>
            ))}
          </div>

          {/* Order details */}
          <div className="lg:col-span-3">
            {!selectedOrder ? (
              <div className="card grid h-64 place-items-center p-6 text-center text-ink-soft lg:sticky lg:top-6">
                Select an order to see the details
              </div>
            ) : (
              <div className="card overflow-hidden lg:sticky lg:top-6">
                <div className="flex items-start justify-between gap-4 border-b border-ink/10 p-5">
                  <div>
                    <p className="font-mono text-lg font-bold">{selectedOrder.orderNumber}</p>
                    <p className="text-sm text-ink-soft">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[selectedOrder.status]}`}
                  >
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="flex items-center gap-2 text-chili-600 hover:underline"
                    >
                      <Phone className="h-4 w-4" /> {selectedOrder.customerPhone}
                    </a>
                    {selectedOrder.customerEmail && <p className="text-ink-soft">{selectedOrder.customerEmail}</p>}
                    <p className="flex gap-2 text-ink-soft">
                      <MapPin className="h-4 w-4 flex-shrink-0" /> {selectedOrder.deliveryAddress}
                    </p>
                    {selectedOrder.notes && (
                      <p className="rounded-lg bg-saffron-50 p-2 text-saffron-700">Note: {selectedOrder.notes}</p>
                    )}
                  </div>

                  <div className="text-sm">
                    <ul className="space-y-1.5">
                      {selectedOrder.items.map((item) => (
                        <li key={item.menuItem} className="flex justify-between gap-2">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-ink-soft">
                      <p className="flex justify-between">
                        <span>Delivery</span>{' '}
                        <span>{selectedOrder.deliveryFee === 0 ? 'Free' : formatPrice(selectedOrder.deliveryFee)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>GST</span> <span>{formatPrice(selectedOrder.gst)}</span>
                      </p>
                      <p className="flex justify-between font-bold text-ink">
                        <span>Total</span> <span>{formatPrice(selectedOrder.totalAmount)}</span>
                      </p>
                      <p>{PAYMENT_LABELS[selectedOrder.paymentMethod]}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-ink/10 bg-cream/60 p-5">
                  {nextStatus(selectedOrder) && (
                    <button
                      onClick={() => changeStatus(selectedOrder, nextStatus(selectedOrder)!)}
                      disabled={updating}
                      className="btn-primary w-full"
                    >
                      {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                      Mark as &ldquo;{STATUS_LABELS[nextStatus(selectedOrder)!]}&rdquo;
                    </button>
                  )}

                  <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-ink-soft">Or set status</p>
                  <div className="flex flex-wrap gap-2">
                    {[...STATUS_FLOW, 'cancelled' as OrderStatus].map((status) => (
                      <button
                        key={status}
                        onClick={() => changeStatus(selectedOrder, status)}
                        disabled={updating || selectedOrder.status === status}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-default ${
                          selectedOrder.status === status
                            ? STATUS_STYLES[status]
                            : 'bg-white ring-1 ring-ink/10 hover:ring-ink/30'
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
