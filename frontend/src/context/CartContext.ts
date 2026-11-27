import { createContext } from 'react';
import type { CartItem, MenuItem } from '../types';

// Everything the cart offers to the rest of the app
export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: MenuItem) => void;
  increase: (menuItemId: string) => void;
  decrease: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getQuantity: (menuItemId: string) => number;
}

export const CartContext = createContext<CartContextValue | null>(null);
