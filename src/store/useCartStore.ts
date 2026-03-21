import { create } from 'zustand';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  type: string;
  image_url: string | null;
}

export interface CartItem extends MenuItem {
  cartItemId: string; // unique ID for the cart entry
  quantity: number;
}

interface CartStore {
  tableId: string | null;
  items: CartItem[];
  setTableId: (id: string) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableId: null,
  items: [],
  setTableId: (id) => set({ tableId: id }),
  addItem: (item) => {
    set((state) => {
      // Check if item already exists
      const existing = state.items.find(i => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return { 
        items: [...state.items, { ...item, cartItemId: Math.random().toString(36).substr(2, 9), quantity: 1 }]
      };
    });
  },
  removeItem: (cartItemId) => set((state) => ({
    items: state.items.filter(i => i.cartItemId !== cartItemId)
  })),
  updateQuantity: (cartItemId, qty) => set((state) => ({
    items: state.items.map(i => 
      i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, qty) } : i
    )
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
