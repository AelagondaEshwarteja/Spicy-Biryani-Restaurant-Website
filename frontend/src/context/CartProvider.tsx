import { useEffect, useState, type ReactNode } from 'react';
import { CartContext } from './CartContext';
import type { CartItem, MenuItem } from '../types';

const STORAGE_KEY = 'spicy-biryani-cart';
const MAX_QUANTITY = 20;

// Load the saved cart so it survives a page refresh
function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  // Save the cart every time it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem._id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItem._id
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          isVeg: menuItem.isVeg,
          quantity: 1,
        },
      ];
    });
  };

  const increase = (menuItemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item
      )
    );
  };

  // Going below 1 removes the item from the cart
  const decrease = (menuItemId: string) => {
    setItems((prev) =>
      prev
        .map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const clearCart = () => setItems([]);

  const getQuantity = (menuItemId: string) =>
    items.find((item) => item.menuItemId === menuItemId)?.quantity ?? 0;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, subtotal, addItem, increase, decrease, removeItem, clearCart, getQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}
