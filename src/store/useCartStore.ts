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
  // sessionToken is the secure identifier sent to placeOrder server action
  sessionToken: string | null;
  // tableNumber is for display only — never used for security decisions
  tableNumber: number | null;
  items: CartItem[];
  setSessionToken: (token: string) => void;
  setTableNumber: (num: number) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  sessionToken: null,
  tableNumber: null,
  items: [],
  setSessionToken: (token) => set({ sessionToken: token }),
  setTableNumber: (num) => set({ tableNumber: num }),
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

