'use client';

import React, { useState } from 'react';
import { ExternalLink, Play, Monitor, RefreshCw, Eye } from 'lucide-react';

interface LivePreviewProps {
  liveDemoLink?: string;
  title: string;
}

export default function LivePreview({ liveDemoLink, title }: LivePreviewProps) {
  const [loadIframe, setLoadIframe] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!liveDemoLink) return null;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2">
          <Monitor className="text-brown-700" size={20} />
          <h2 className="text-lg font-bold text-gray-900 font-sans">Live Interactive Demo</h2>
        </div>
        
        <a
          href={liveDemoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brown-700 hover:text-brown-900 transition-colors uppercase tracking-wider"
        >
          Open in New Tab
          <ExternalLink size={12} />
        </a>
      </div>

      {!loadIframe ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-center p-6 border border-gray-100 shadow-inner group">
          {/* Decorative design */}
          <div className="absolute inset-0 bg-cover bg-center filter blur-sm brightness-[0.25] transition-transform duration-700 group-hover:scale-105" />
          
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-brown-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Eye size={28} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Preview {title}</h3>
              <p className="text-xs text-gray-400 font-medium">
                Load the live interactive version directly inside this browser window securely.
              </p>
            </div>
            <button
              onClick={() => setLoadIframe(true)}
              className="inline-flex items-center gap-2 bg-brown-600 hover:bg-brown-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Play size={14} className="fill-white" />
              Launch Live Preview
            </button>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10 space-y-3">
              <RefreshCw size={24} className="text-brown-700 animate-spin" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading secure sandbox...</p>
            </div>
          )}
          <iframe
            src={liveDemoLink}
            title={`${title} Live Preview`}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
