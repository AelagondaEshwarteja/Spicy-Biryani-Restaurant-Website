// Small helper functions used across the app

import type { OrderStatus, PaymentMethod } from '../types';

// Same rules as backend/utils/billing.js (the backend decides the final bill)
export const FREE_DELIVERY_ABOVE = 499;
export const DELIVERY_FEE = 40;
export const GST_RATE = 0.05;

export function calculateBill(subtotal: number) {
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const gst = Math.round(subtotal * GST_RATE);
  return { subtotal, deliveryFee, gst, total: subtotal + deliveryFee + gst };
}

// 1299 -> "₹1,299"
export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// 1240 -> "1.2k"
export function formatCount(count: number) {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

// "5 min ago", "2 h ago" ...
export function timeAgo(date: string) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatDateTime(date);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  preparing: 'Being cooked',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Tailwind colours for the little status badges
export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  preparing: 'bg-violet-100 text-violet-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

// The normal order of steps (cancelled is handled separately)
export const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  upi: 'UPI on delivery',
  card: 'Card on delivery',
};
