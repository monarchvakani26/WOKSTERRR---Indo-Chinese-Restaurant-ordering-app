"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, CreditCard, ArrowRight, CheckCircle2, ChefHat, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StickyCart() {
  const { items, getTotal, updateQuantity, removeItem, clearCart, tableId } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'preparing' | 'ready' | 'completed' | null>(null);
  const total = getTotal();

  // Hydration fix (zustand)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Listen to order status updates
  useEffect(() => {
    if (!placedOrderId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${placedOrderId}` },
        (payload) => {
          if (payload.new && payload.new.status) {
            setOrderStatus(payload.new.status as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [placedOrderId]);

  if (!mounted || items.length === 0) return null;

  const handlePlaceOrder = async () => {
    if (!tableId || items.length === 0) return;
    setIsPlacingOrder(true);

    try {
      // 1. Resolve table UUID from table_number (tableId is the number as string from URL)
      const { data: tableData, error: tableErr } = await supabase
        .from('tables')
        .select('id')
        .eq('table_number', parseInt(tableId))
        .single();

      if (tableErr || !tableData) throw tableErr || new Error("Table not found");

      // 2. Create the Order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          table_id: tableData.id,
          status: 'pending',
          total_amount: total
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 3. Create the Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        item_id: item.id,
        quantity: item.quantity
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsErr) throw itemsErr;

      // 4. Success State
      clearCart();
      setPlacedOrderId(orderData.id);
      setOrderStatus('pending');
      setOrderSuccess(true);

    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please call the waiter.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    const isPreparing = orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'completed';
    const isReady = orderStatus === 'ready' || orderStatus === 'completed';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Status Tracker */}
          <div className="mb-8 relative z-10">
            <h2 className="text-2xl font-extrabold text-[var(--color-primary)] mb-6">Order Status</h2>

            <div className="flex justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-[15%] right-[15%] h-1 -translate-y-1/2 bg-gray-100 rounded-full z-0"></div>
              <div
                className="absolute top-1/2 left-[15%] h-1 -translate-y-1/2 bg-[var(--color-primary)] rounded-full z-0 transition-all duration-700 ease-in-out"
                style={{ width: isReady ? '70%' : isPreparing ? '35%' : '0%' }}
              ></div>

              {/* Step 1: Pending */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${true ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <AlertCircle size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${true ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>Sent</span>
              </div>

              {/* Step 2: Preparing */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isPreparing ? 'bg-[var(--color-primary)] text-white' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                  <ChefHat size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isPreparing ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>Prep</span>
              </div>

              {/* Step 3: Ready */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isReady ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                  <CheckCircle2 size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isReady ? 'text-green-600' : 'text-gray-400'}`}>Ready</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-background)] rounded-xl p-5 border border-[var(--color-secondary)]/30 mb-8 relative z-10 text-left">
            {orderStatus === 'pending' && <p className="text-gray-600 font-medium text-sm">Your order is received and waiting to be accepted by the kitchen.</p>}
            {orderStatus === 'preparing' && <p className="text-orange-600 font-medium text-sm">The chefs are cooking up your order right now!</p>}
            {orderStatus === 'ready' && <p className="text-green-600 font-bold text-sm">Your order is ready! Please proceed to the counter with Table {tableId} to collect and pay.</p>}
            {orderStatus === 'completed' && <p className="text-gray-500 font-medium text-sm">This order has been completed and paid.</p>}

            {(orderStatus === 'pending' || orderStatus === 'preparing') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-bold text-[var(--color-accent)] uppercase mb-1">Payment Instructions</p>
                <p className="text-xs font-medium text-gray-500 shrink-0">Please proceed to the counter with your Table Number ({tableId}) to complete payment once ready.</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 relative z-10">
            <button
              onClick={() => {
                setOrderSuccess(false);
                setPlacedOrderId(null);
                setOrderStatus(null);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 w-full"
            >
              Close Cart
            </button>
            <button
              onClick={() => {
                // Keep it open
              }}
              className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className="animate-spin-slow" /> Tracking...
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Minimized bottom bar */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="bottom-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-white border-t rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:hidden"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-full h-14 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-between px-6 font-bold shadow-lg"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <span>{items.length} items</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">₹{total}</span>
                <ArrowRight size={20} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Sheet (Mobile) & Sidebar (Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
        {isOpen && (
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white z-50 rounded-t-3xl shadow-2xl md:top-0 md:h-screen md:w-[400px] md:left-auto md:rounded-l-3xl md:rounded-tr-none flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-[var(--color-accent)]" />
                Your Order
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex flex-col gap-3 pb-6 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      {item.type === 'veg' && <span className="inline-block w-3 h-3 rounded-sm border border-green-600 p-[2px] mb-1"><span className="block w-full h-full bg-green-600 rounded-full"></span></span>}
                      <h4 className="font-bold text-gray-900 leading-tight pr-4">{item.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">₹{item.price}</p>
                    </div>
                    <p className="font-bold text-[var(--color-primary)]">₹{item.price * item.quantity}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button onClick={() => removeItem(item.cartItemId)} className="text-xs font-bold text-red-500 uppercase hover:underline">
                      Remove
                    </button>
                    <div className="flex items-center gap-4 bg-gray-100 rounded-full p-1 border">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-[var(--color-primary)] text-white rounded-full shadow-sm">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium font-sans text-lg">Subtotal</span>
                <span className="text-2xl font-extrabold text-[var(--color-primary)]">₹{total}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-4 bg-[var(--color-accent)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E55A25] transition-colors disabled:opacity-70 shadow-xl"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order (Pay at Counter)"}
                {!isPlacingOrder && <CreditCard size={20} />}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">Orders cannot be cancelled once placed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop floating button (if hidden) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="hidden md:block fixed bottom-8 right-8 z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[var(--color-accent)] text-white rounded-full p-4 flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform"
            >
              <div className="relative">
                <ShoppingBag size={24} />
                <span className="absolute -top-2 -right-2 bg-white text-[var(--color-accent)] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-gray-100">
                  {items.length}
                </span>
              </div>
              <span className="font-bold pr-2">₹{total}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
