'use client';

import { Search } from 'lucide-react';

interface TemplatesHeaderProps {
  totalProjects: number;
  search: string;
  onSearchChange: (search: string) => void;
}

export default function TemplatesHeader({ totalProjects, search, onSearchChange }: TemplatesHeaderProps) {
  return (
    <div className="w-full">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search within these results"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}