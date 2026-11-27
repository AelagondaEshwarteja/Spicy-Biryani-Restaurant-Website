import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ExternalLink,
  Flame,
  IndianRupee,
  LogOut,
  MessageSquare,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import type { Admin, OrderStats } from '../../types';
import { ApiError, orderApi } from '../../services/api';
import { formatPrice } from '../../utils/format';
import OrdersPanel from './OrdersPanel';
import MenuPanel from './MenuPanel';
import MessagesPanel from './MessagesPanel';

type Tab = 'orders' | 'menu' | 'messages';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

const REFRESH_EVERY_MS = 15000;

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('orders');
  const [stats, setStats] = useState<OrderStats | null>(null);

  // If the login has expired, send the admin back to the login screen.
  // Every panel uses this so we handle errors the same way everywhere.
  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
        return 'Your session expired. Please log in again.';
      }
      return err instanceof Error ? err.message : 'Something went wrong';
    },
    [onLogout]
  );

  const loadStats = useCallback(() => {
    orderApi
      .getStats()
      .then((data) => setStats(data.stats))
      .catch(handleError);
  }, [handleError]);

  // Load the numbers now, then refresh them every 15 seconds
  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, REFRESH_EVERY_MS);
    return () => clearInterval(timer);
  }, [loadStats]);

  const cards = [
    { label: "Today's orders", value: stats?.todayOrders ?? '-', icon: ShoppingBag, colour: 'bg-sky-50 text-sky-700' },
    {
      label: "Today's revenue",
      value: stats ? formatPrice(stats.todayRevenue) : '-',
      icon: IndianRupee,
      colour: 'bg-green-50 text-green-700',
    },
    { label: 'Active orders', value: stats?.activeOrders ?? '-', icon: Flame, colour: 'bg-orange-50 text-orange-700' },
    {
      label: 'Unread messages',
      value: stats?.unreadMessages ?? '-',
      icon: MessageSquare,
      colour: 'bg-violet-50 text-violet-700',
    },
  ];

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList; badge?: number }[] = [
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: stats?.activeOrders },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats?.unreadMessages },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-ink text-white">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron-500 text-ink">
              <Flame className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold">Kitchen dashboard</p>
              <p className="text-xs text-white/60">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm hover:bg-white/10 sm:inline-flex">
              <ExternalLink className="h-4 w-4" /> View website
            </Link>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm hover:bg-white/10">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, colour }) => (
            <div key={label} className="card flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${colour}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-ink-soft">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-2 border-b border-ink/10">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === id ? 'border-chili-600 text-chili-700' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
              {!!badge && (
                <span className="rounded-full bg-chili-600 px-2 py-0.5 text-xs font-bold text-white">{badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'orders' && <OrdersPanel stats={stats} onChange={loadStats} onError={handleError} />}
          {tab === 'menu' && <MenuPanel onError={handleError} />}
          {tab === 'messages' && <MessagesPanel onChange={loadStats} onError={handleError} />}
        </div>
      </main>
    </div>
  );
}
