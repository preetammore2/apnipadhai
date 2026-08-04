'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 sm:p-12 rounded-3xl border border-slate-200 shadow-card max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
            ERROR 500
          </span>
          <h1 className="text-2xl font-black font-heading text-navy-900">Something Went Wrong</h1>
          <p className="text-xs text-slate-500">
            An unexpected error occurred while processing your request. Please try refreshing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
