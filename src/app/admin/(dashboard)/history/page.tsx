"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IndianRupee, TrendingUp, ShoppingBag, Clock } from "lucide-react";

type Order = {
  id: string;
  status: string;
  created_at: string;
  total_amount: number;
  tables: { table_number: number };
  order_items: {
    menu_items: { name: string };
    quantity: number;
  }[];
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Fetch today's completed orders
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, created_at, total_amount,
          tables ( table_number ),
          order_items (
            quantity,
            menu_items ( name )
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (data && !error) {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };
    
    fetchHistory();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>;

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = orders.length;
  
  // Calculate popular items
  const itemCounts: Record<string, number> = {};
  orders.forEach(order => {
    order.order_items.forEach(item => {
      const name = item.menu_items?.name;
      if (name) {
        itemCounts[name] = (itemCounts[name] || 0) + item.quantity;
      }
    });
  });
  
  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-2">Analytics & History</h1>
        <p className="text-gray-500 font-medium tracking-wide">Today's completed orders and revenue.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Today's Revenue</p>
            <p className="text-3xl font-black text-emerald-600">₹{totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-black text-blue-600">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Top Item</p>
            <p className="text-lg font-bold text-purple-700 leading-tight">
              {popularItems.length > 0 ? popularItems[0][0] : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
            <Clock size={16} /> Recent Completed Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Time</th>
                <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Order ID</th>
                <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Table</th>
                <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No completed orders today.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 font-medium">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-gray-900 font-bold font-mono text-sm">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-sm">
                        Table {order.tables?.table_number}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-[var(--color-primary)]">
                      ₹{order.total_amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
