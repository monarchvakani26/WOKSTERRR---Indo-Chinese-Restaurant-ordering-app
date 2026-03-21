"use client";

import { useMemo, useState } from "react";
import { Search, Info } from "lucide-react";
import { motion } from "framer-motion";
import { MenuItem } from "@/store/useCartStore";

interface Props {
  menuItems: MenuItem[];
}

export default function PublicMenuClient({ menuItems }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

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

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
      {/* Search & Categories */}
      <div className="sticky top-0 z-30 bg-[var(--color-background)]/90 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search our delicious menu..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--color-secondary)]/30 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-sm ${
                activeCategory === category 
                  ? "bg-[var(--color-accent)] text-white" 
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-12 mt-8">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="scroll-mt-32">
            <h2 className="text-3xl font-black text-[var(--color-primary)] mb-6 flex items-center gap-4">
              {category}
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-secondary)] to-transparent"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        {/* Veg / Jain markers */}
                        <span className="mt-1 shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 border-green-600 p-[2px]">
                          <span className="block w-full h-full bg-green-600 rounded-full"></span>
                        </span>
                        <h3 className="font-bold text-xl text-gray-900 leading-tight">{item.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.type === 'jain' ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider border border-red-100">Jain Available</span> : null}
                      </p>
                    </div>
                    <p className="text-lg font-black text-[var(--color-accent)]">₹{item.price}</p>
                  </div>
                  
                  {/* Image Placeholder */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 shadow-inner">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100/50">
                        <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200`} alt="Food" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedItems).length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <Info className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400">No items found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
