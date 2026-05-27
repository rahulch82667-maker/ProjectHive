'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[85vh] bg-gray-50/50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden animate-in zoom-in duration-300">
        
        {/* Subtle orange/red gradient blur accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-100/30 blur-3xl rounded-full -z-10" />

        {/* Canceled Warning Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-inner relative animate-pulse">
            <AlertTriangle size={40} className="stroke-[1.5]" />
          </div>
        </div>

        {/* Error Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payment Halted</h1>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            The transaction was cancelled or did not complete successfully. No funds have been deducted from your account.
          </p>
        </div>

        {/* Troubleshooting Guidance */}
        <div className="border-t border-b border-gray-50 py-5 text-left space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 space-y-2 text-xs font-semibold text-gray-500 leading-relaxed">
            <li>Ensure that your payment card supports online and international transactions.</li>
            <li>Double-check that all required fields in the billing details form are accurate.</li>
            <li>If you cancelled this checkout deliberately, feel free to explore other templates in the store.</li>
          </ul>
        </div>

        {/* Call to action buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-brown-700 hover:bg-brown-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg cursor-pointer uppercase tracking-wider text-xs"
          >
            <RefreshCw size={14} />
            Try Checkout Again
          </button>

          <Link
            href="/"
            className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider text-xs"
          >
            <ShoppingBag size={14} className="text-gray-400" />
            Return to Marketplace
          </Link>
        </div>

      </div>
    </div>
  );
}
