"use client";

import { useState } from "react";
import { loginAdmin } from "../actions";
import { Utensils } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[var(--color-secondary)]/20">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
            <Utensils className="text-[var(--color-accent)] w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--color-primary)] text-center mb-2">Kitchen Admin</h1>
        <p className="text-center text-gray-500 font-medium mb-8">Enter the secure pin to access.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              name="password"
              placeholder="Enter kitchen PIN..." 
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all font-medium text-center tracking-widest"
            />
          </div>
          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-bold tracking-wide rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
        
        <p className="mt-6 text-xs text-gray-400 text-center font-medium">Use PIN: woksterrr2026</p>
      </div>
    </div>
  );
}
