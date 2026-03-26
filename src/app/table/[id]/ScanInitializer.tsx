"use client";

import { useEffect, useState } from "react";
import { createTableSession } from "../actions";
import { Loader2 } from "lucide-react";

export default function ScanInitializer({ tableIdString, tableDbId }: { tableIdString: string, tableDbId: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    createTableSession(tableIdString, tableDbId)
      .then((res) => {
        if (!res.success && mounted) {
          setError(true);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
    };
  }, [tableIdString, tableDbId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">!</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Session Error</h2>
          <p className="text-gray-500 font-medium">Failed to create table session. Please refresh or scan the QR code again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unlocking Table...</h2>
        <p className="text-sm text-gray-500">Generating secure session</p>
      </div>
    </div>
  );
}
