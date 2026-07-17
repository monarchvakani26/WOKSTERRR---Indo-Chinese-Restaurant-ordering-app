"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore, MenuItem } from "@/store/useCartStore";
import { Plus, Search, Info, Clock, CheckCircle2, ChefHat, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string;
  quantity: number;
  menu_items: {
    name: string;
  } | null;
}

interface Order {
  id: string;
  status: "pending" | "preparing" | "ready" | "completed";
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

interface Props {
  sessionToken: string;
  tableNumber: number | null;
  tableId: string;
  sessionCreatedAt: string;
  initialOrders: any[];
  menuItems: MenuItem[];
}

export default function MenuClient({
  sessionToken,
  tableNumber,
  tableId,
  sessionCreatedAt,
  initialOrders,
  menuItems,
}: Props) {
  const { setSessionToken, setTableNumber, addItem } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>(initialOrders as unknown as Order[]);

  useEffect(() => {
    setSessionToken(sessionToken);
    if (tableNumber !== null) setTableNumber(tableNumber);
  }, [sessionToken, tableNumber, setSessionToken, setTableNumber]);

  // Realtime Orders Subscription for this table & session
  useEffect(() => {
    const channel = supabase
      .channel(`table-orders-${tableId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `table_id=eq.${tableId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new;
            // Verify order belongs to the current session (after start time)
            if (
              newOrder.table_id === tableId &&
              new Date(newOrder.created_at) >= new Date(sessionCreatedAt)
            ) {
              // Fetch full details of the newly inserted order
              const { data: orderDetails } = await supabase
                .from("orders")
                .select(`
                  id,
                  status,
                  total_amount,
                  created_at,
                  order_items (
                    id,
                    quantity,
                    menu_items (
                      name
                    )
                  )
                `)
                .eq("id", newOrder.id)
                .single();

              if (orderDetails) {
                setOrders((prev) => {
                  if (prev.some((o) => o.id === orderDetails.id)) return prev;
                  return [orderDetails as unknown as Order, ...prev];
                });
              }
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updatedOrder.id
                  ? { ...o, status: updatedOrder.status as any }
                  : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, sessionCreatedAt]);

  // Group items by category
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((item) => item.category)));
    return ["All", ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let filtered = menuItems;
    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [menuItems, activeCategory, search]);

  // Group the filtered results by category for display
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-6 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
          {tableNumber !== null ? `Table ${tableNumber}` : "Order Menu"}
        </h1>
        <p className="text-gray-500 font-medium">
          Browse and order directly to your table.
        </p>
      </div>

      {/* Active Orders Status Panel */}
      {orders.length > 0 && (
        <div className="mb-10 space-y-4">
          <h2 className="text-xl font-black text-[var(--color-primary)] flex items-center gap-2">
            <span>Your Session Orders</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h2>
          <div className="space-y-4">
            {orders.map((order) => {
              const isPreparing = order.status === 'preparing' || order.status === 'ready' || order.status === 'completed';
              const isReady = order.status === 'ready' || order.status === 'completed';
              const isCompleted = order.status === 'completed';

              const getStatusBadgeClass = (status: string) => {
                switch(status) {
                  case 'pending': return 'bg-red-50 text-red-700 border-red-100';
                  case 'preparing': return 'bg-orange-50 text-orange-700 border-orange-100';
                  case 'ready': return 'bg-green-50 text-green-700 border-green-200 animate-pulse';
                  default: return 'bg-gray-100 text-gray-500 border-gray-200';
                }
              };

              const getStatusLabel = (status: string) => {
                switch(status) {
                  case 'pending': return 'Received';
                  case 'preparing': return 'Cooking';
                  case 'ready': return 'Ready to Collect!';
                  default: return 'Completed & Paid';
                }
              };

              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400">#{order.id.slice(0, 6).toUpperCase()}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="text-sm font-medium text-gray-700">
                          <span className="font-extrabold text-[var(--color-primary)] mr-2">{item.quantity}x</span>
                          <span>{item.menu_items?.name || "Unknown Item"}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                      Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Order Progress Visualizer */}
                  {!isCompleted && (
                    <div className="flex flex-col justify-center min-w-[200px] gap-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        <span className="text-[var(--color-primary)]">Sent</span>
                        <span className={isPreparing ? 'text-[var(--color-primary)]' : ''}>Prep</span>
                        <span className={isReady ? 'text-green-600' : ''}>Ready</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-[var(--color-primary)] transition-all duration-500 rounded-full" 
                          style={{ width: isReady ? '100%' : isPreparing ? '60%' : '20%' }}
                        />
                      </div>

                      {order.status === 'ready' && (
                        <div className="text-[10px] font-black text-green-600 text-center uppercase tracking-wide mt-1">
                          👉 Proceed to counter to pay & collect!
                        </div>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl h-fit border border-gray-100 self-center">
                      <CheckCircle2 size={16} className="text-gray-400" />
                      <span>Served & Paid</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Categories */}
      <div className="sticky top-0 z-30 bg-[var(--color-background)]/90 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search our delicious menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                activeCategory === category
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-10 mt-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-2xl font-black text-[var(--color-primary)] mb-4 flex items-center gap-2">
              {category}
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-secondary)]/50 to-transparent" />
            </h2>
            <div className="grid gap-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      {/* Veg marker */}
                      <span className="mt-1 inline-block w-4 h-4 rounded-sm border-2 border-green-600 p-[2px]">
                        <span className="block w-full h-full bg-green-600 rounded-full" />
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight pr-2">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-primary)] mb-2">
                      ₹{item.price}
                    </p>

                    <button
                      onClick={() => addItem(item)}
                      className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm px-4 py-1.5 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    >
                      <span>ADD</span>
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Item image */}
                  <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200"
                        alt="Food placeholder"
                        className="w-full h-full object-cover opacity-60"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedItems).length === 0 && (
          <div className="text-center py-20">
            <Info className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No items found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
