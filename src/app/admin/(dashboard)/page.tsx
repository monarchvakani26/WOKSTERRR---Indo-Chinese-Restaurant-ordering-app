"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle2, ChefHat, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type OrderItem = {
  id: string;
  quantity: number;
  menu_items: { name: string; type: string };
};

type Order = {
  id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  created_at: string;
  total_amount: number;
  tables: { table_number: number };
  order_items: OrderItem[];
};

export default function LiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, total_amount,
          tables ( table_number ),
          order_items (
            id, quantity,
            menu_items ( name, type )
          )
        `)
        .neq('status', 'completed')
        .order('created_at', { ascending: true });

      if (data && !error) {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };
    
    fetchOrders();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          // If a new order is inserted, fetch its full details (with relations)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data: updatedOrder } = await supabase
              .from('orders')
              .select(`
                id, status, created_at, total_amount,
                tables ( table_number ),
                order_items (
                  id, quantity,
                  menu_items ( name, type )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (updatedOrder) {
              setOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (updatedOrder.status === 'completed') {
                  return prev.filter(o => o.id !== updatedOrder.id);
                }
                if (exists) {
                  return prev.map(o => o.id === updatedOrder.id ? (updatedOrder as unknown as Order) : o);
                }
                return [...prev, updatedOrder as unknown as Order];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-red-100 text-red-700 border-red-200';
      case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>;

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-2 flex items-center gap-3">
          Live Kitchen Display <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
        </h1>
        <p className="text-gray-500 font-medium tracking-wide">Manage incoming orders in real-time.</p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">
        
        {/* Column: Pending */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
            <h2 className="font-bold text-red-800 flex items-center gap-2">
              <AlertCircle size={18} /> New Orders
            </h2>
            <span className="bg-red-200 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} nextStatus="preparing" onAction={() => updateStatus(order.id, 'preparing')} actionText="Start Cooking" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Column: Preparing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
            <h2 className="font-bold text-orange-800 flex items-center gap-2">
              <ChefHat size={18} /> Preparing
            </h2>
            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full">{preparingOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} nextStatus="ready" onAction={() => updateStatus(order.id, 'ready')} actionText="Mark Ready" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Column: Ready */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
            <h2 className="font-bold text-green-800 flex items-center gap-2">
              <CheckCircle2 size={18} /> Ready to Serve
            </h2>
            <span className="bg-green-200 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">{readyOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} nextStatus="completed" onAction={() => updateStatus(order.id, 'completed')} actionText="Complete Order" />
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function OrderCard({ order, onAction, actionText }: { order: Order, nextStatus: string, onAction: () => void, actionText: string }) {
  const timeStr = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-gray-400 mb-1 block">#{order.id.slice(0,6).toUpperCase()}</span>
          <h3 className="text-xl font-black text-[var(--color-primary)]">Table {order.tables.table_number}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
          <Clock size={14} /> {timeStr}
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {order.order_items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{item.quantity}x</span>
              <span className="text-gray-600 font-medium">{item.menu_items?.name || "Unknown item"}</span>
            </div>
            {item.menu_items?.type === 'jain' && (
              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 rounded uppercase tracking-wider h-fit">Jain</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="font-bold text-gray-900 border px-3 py-1 rounded-full bg-gray-50">₹{order.total_amount}</span>
        <button 
          onClick={onAction}
          className="bg-[var(--color-primary)] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#0c3125] transition-colors"
        >
          {actionText}
        </button>
      </div>
    </motion.div>
  );
}
