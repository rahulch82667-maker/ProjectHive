'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export default function AdminTabs() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');


  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'upload'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload Photo
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'manage'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Manage Photos
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 text-center py-8">
            Manage photos feature coming soon. Use the sidebar Photos link for full management.
          </p>
        </div>
      )}
    </div>
  );
}