import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  sweetness: string;
  toppings: string[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (newItem) => {
    const id = `${newItem.name}-${newItem.sweetness}-${newItem.toppings.sort().join(',')}`;
    const current = get().items;
    const existing = current.find((i) => i.id === id);

    if (existing) {
      set({
        items: current.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        ),
      });
    } else {
      set({ items: [...current, { ...newItem, id }] });
    }
  },
  removeFromCart: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));