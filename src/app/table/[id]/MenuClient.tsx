"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore, MenuItem } from "@/store/useCartStore";
import { Plus, Search, Info } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  tableId: string;
  menuItems: MenuItem[];
}

export default function MenuClient({ tableId, menuItems }: Props) {
  const { setTableId, addItem } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTableId(tableId);
  }, [tableId, setTableId]);

  // Group items by category
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ["All", ...cats];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let filtered = menuItems;
    if (activeCategory !== "All") {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [menuItems, activeCategory, search]);

  // Group the filtered results by category for display
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pt-6 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">Table {tableId}</h1>
        <p className="text-gray-500 font-medium">Browse and order directly to your table.</p>
      </div>

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
          {categories.map(category => (
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
          <div key={category} scroll-margin-top="100">
            <h2 className="text-2xl font-black text-[var(--color-primary)] mb-4 flex items-center gap-2">
              {category}
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-secondary)]/50 to-transparent"></span>
            </h2>
            <div className="grid gap-4">
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      {/* Veg / Jain markers */}
                      <span className="mt-1 inline-block w-4 h-4 rounded-sm border-2 border-green-600 p-[2px]">
                        <span className="block w-full h-full bg-green-600 rounded-full"></span>
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight pr-2">{item.name}</h3>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-primary)] mb-2">₹{item.price}</p>
                    
                    {/* Add Button */}
                    <button 
                      onClick={() => addItem(item)}
                      className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm px-4 py-1.5 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    >
                      <span>ADD</span>
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  {/* Image Placeholder */}
                  <div className="w-28 h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200`} alt="Food placeholder" className="w-full h-full object-cover opacity-60" />
                      </div>
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
