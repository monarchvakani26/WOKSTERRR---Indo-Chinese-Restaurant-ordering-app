"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, MapPin, Clock, Phone, Utensils, Award, Leaf } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-secondary)]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="text-[var(--color-accent)] w-6 h-6 shrink-0" />
            <span className="font-sans font-bold text-xl tracking-tight text-[var(--color-primary)]">
              WOKSTERRR
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-bold">
            <Link href="/" className="text-[var(--color-foreground)] hover:text-[var(--color-accent)] transition-colors hidden sm:block">Home</Link>
            <Link href="/menu" className="text-[var(--color-foreground)] hover:text-[var(--color-accent)] transition-colors">Menu</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white pt-24 pb-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552590635-27c2c2128abf?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] text-sm font-semibold mb-6 border border-[var(--color-secondary)]/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              100% Pure Veg & Jain Options
            </div>
            <h1 className="text-5xl md:text-7xl font-sans font-extrabold tracking-tight mb-6 leading-tight">
              Love All,<br /> Serve All,<br /> <span className="text-[var(--color-accent)]">Feed All.</span>
            </h1>
            <p className="text-lg text-[var(--color-secondary)] mb-10 max-w-xl leading-relaxed">
              Experience the true taste of Mumbai street style Indo-Chinese. From sizzling wok bowls to pure Momo mania, we promise an unforgettable dive into flavor.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] hover:bg-[#E55A25] text-white font-bold rounded-full transition-transform hover:scale-105 shadow-xl shadow-[#FF6B35]/20"
              >
                View Full Menu <ArrowRight size={20} />
              </Link>
              <Link
                href="#location"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-full transition-all backdrop-blur-md"
              >
                Find Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white shadow-sm border-b border-[var(--color-secondary)]/10 relative z-20 -mt-10 mx-4 sm:mx-8 lg:mx-auto max-w-6xl rounded-2xl">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex-1 px-8 py-6 flex flex-col items-center text-center gap-3 hover:bg-gray-50 transition-colors rounded-l-2xl">
            <div className="flex text-yellow-400">
              <Star className="fill-current w-6 h-6" />
              <Star className="fill-current w-6 h-6" />
              <Star className="fill-current w-6 h-6" />
              <Star className="fill-current w-6 h-6" />
              <div className="relative">
                <Star className="w-6 h-6 text-gray-200" />
                <div className="absolute inset-0 overflow-hidden text-yellow-400" style={{ width: '20%' }}>
                  <Star className="fill-current w-6 h-6" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-extrabold text-xl text-[var(--color-primary)]">4.2 / 5.0 Rating</p>
              <p className="text-sm text-gray-500 font-medium">Loved by Kandivali locals</p>
            </div>
          </div>
          <div className="flex-1 px-8 py-6 flex flex-col items-center text-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="font-extrabold text-xl text-[var(--color-primary)]">Fast Service</p>
              <p className="text-sm text-gray-500 font-medium">Hot wok orders in minutes</p>
            </div>
          </div>
          <div className="flex-1 px-8 py-6 flex flex-col items-center text-center gap-3 hover:bg-gray-50 transition-colors rounded-r-2xl">
            <div className="w-12 h-12 bg-[#A7D7C5]/30 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-[#0F3D2E]" />
            </div>
            <div>
              <p className="font-extrabold text-xl text-[var(--color-primary)]">Pure Veg & Jain</p>
              <p className="text-sm text-gray-500 font-medium">Strictly uncompromising</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-[var(--color-background)] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80" alt="Restaurant Interior" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[var(--color-secondary)] rounded-full opacity-20 blur-3xl z-0"></div>
              <div className="absolute -left-8 -top-8 w-full h-full border-2 border-[var(--color-accent)] rounded-3xl z-0"></div>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-[var(--color-accent)] uppercase mb-3">Our Story</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary)] mb-6 leading-tight">Bringing Street Style Indo-Chinese Indoors.</h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Woksterrr was born out of a simple love for bold flavors and a bustling kitchen. We realized that true Indo-Chinese craving requires a perfect balance of spice, smoke, and wok-tossed perfection.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Located in the heart of Kandivali West, we are a strictly pure veg and Jain-friendly establishment. From our signature Momo Mania to our sizzling Wok Bowls, every dish is crafted with fresh ingredients and a whole lot of love.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
                  <Award className="text-[var(--color-accent)]" />
                  <span className="font-bold text-[var(--color-primary)]">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
                  <Utensils className="text-[var(--color-accent)]" />
                  <span className="font-bold text-[var(--color-primary)]">Hygiene First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu-preview" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-sm font-black tracking-widest text-[var(--color-accent)] uppercase mb-3">Chef's Specials</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary)] mb-6">A Glimpse of Our Menu</h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-16">
            Explore our signature creations. Visit us to scan the QR at your table and explore the endless flavors we have to offer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Heaven Cottage Cheese", desc: "Classic Starters", price: "₹239", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80" },
              { title: "Classic Hakka Noodles", desc: "Wok Tossed Noodles", price: "₹179", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80" },
              { title: "Veg Momos Kurkure", desc: "Momo Mania", price: "₹159", img: "https://images.unsplash.com/photo-1626804475297-4160cb7bf4ef?auto=format&fit=crop&q=80" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-[var(--color-background)] rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
              >
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8 relative">
                  <div className="absolute -top-6 right-6 bg-white w-12 h-12 rounded-full flex items-center justify-center font-black text-[var(--color-accent)] shadow-lg z-20 tooltip">
                    🔥
                  </div>
                  <div className="text-xs font-black text-[var(--color-accent)] uppercase tracking-wider mb-2">{item.desc}</div>
                  <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">{item.title}</h3>
                  <p className="text-2xl font-black text-gray-900">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-primary)] text-white hover:bg-[#0c3125] font-bold rounded-full transition-all shadow-xl"
            >
              Browse Full Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Marquee / Ambience */}
      <section className="py-24 bg-[var(--color-primary)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-sm font-black tracking-widest text-[var(--color-secondary)] uppercase mb-3">Vibe & Ambience</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-6">Where The Magic Happens</h3>
        </div>
        <div className="flex gap-6 px-6 relative w-full overflow-x-auto snap-x scrollbar-hide pb-8">
          {[
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1414235077428-33898dd18f8c?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&q=80"
          ].map((img, i) => (
            <div key={i} className="min-w-[300px] md:min-w-[400px] h-[300px] md:h-[400px] snap-center rounded-3xl overflow-hidden shadow-2xl shrink-0">
              <img src={img} className="w-full h-full object-cover" alt="Restaurant Ambience" />
            </div>
          ))}
        </div>
      </section>

      {/* Location / Footer */}
      <footer id="location" className="bg-[#0c3125] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Utensils className="text-[var(--color-accent)] w-10 h-10 shrink-0" />
              <h3 className="text-4xl font-black tracking-tight text-[var(--color-secondary)]">WOKSTERRR</h3>
            </div>
            <p className="text-gray-300 max-w-sm mb-10 text-lg leading-relaxed">
              Authentic. Sizzling. Unforgettable. Join us for a burst of Indo-Chinese flavors crafted just for you in the heart of Mumbai.
            </p>
            <div className="space-y-6 text-gray-300 bg-white/5 p-8 rounded-3xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <MapPin className="text-[var(--color-accent)] w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Location</p>
                  <p className="text-sm">Kandivali West, Mumbai, Maharashtra 400067</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <Phone className="text-[var(--color-accent)] w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Reservations & Queries</p>
                  <p className="text-sm">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <Clock className="text-[var(--color-accent)] w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Opening Hours</p>
                  <p className="text-sm">11:00 AM - 11:30 PM (Monday - Sunday)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Static map placeholder */}
          <div className="rounded-3xl overflow-hidden h-[400px] lg:h-auto relative bg-gray-900 border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-[#A7D7C5]/10 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Kandivali+West,Mumbai&zoom=14&size=800x800&maptype=roadmap&markers=color:orange%7Clabel:W%7CKandivali+West,Mumbai&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|visibility:on|color:0x1a3646|weight:2.00&key=NOT_A_REAL_KEY')] bg-cover bg-center" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c3125]/80 backdrop-blur-[4px] p-8 text-center group">
              <div className="w-20 h-20 bg-[var(--color-accent)] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[var(--color-accent)]/30 group-hover:scale-110 transition-transform cursor-pointer">
                <MapPin className="w-10 h-10 text-white animate-bounce" />
              </div>
              <p className="font-black text-3xl text-white mb-2">Visit Our Kitchen</p>
              <p className="text-lg font-medium text-[var(--color-secondary)]">Kandivali West, Mumbai</p>
              <button className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold transition-all">
                Get Directions
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} Woksterrr Indo-Chinese. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">Built with <span className="text-red-500">❤️</span> for pure food lovers.</p>
        </div>
      </footer>
    </div>
  );
}
