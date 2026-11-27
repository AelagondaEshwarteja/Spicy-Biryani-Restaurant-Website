// Shapes of the data we get from the backend API

export type Category = 'biryani' | 'starters' | 'curries' | 'breads' | 'desserts' | 'beverages';

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  spiceLevel: number;
  rating: number;
  ratingCount: number;
  servingSize: string;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  nutrition: Nutrition;
}

// What we keep in the cart (a small copy of the menu item + quantity)
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'upi' | 'card';

export interface OrderItem {
  menuItem: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  gst: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; changedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface NewOrder {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: { menuItemId: string; quantity: number }[];
}

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  activeOrders: number;
  todayRevenue: number;
  statusCounts: Partial<Record<OrderStatus, number>>;
  unreadMessages: number;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface MealAnalysis {
  totals: Nutrition;
  dailyCaloriePercent: number;
  tips: { type: 'good' | 'tip' | 'info'; text: string }[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}
