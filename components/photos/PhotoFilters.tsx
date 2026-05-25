'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PhotoFilters as PhotoFiltersType } from '@/services/photos.api';

interface PhotoFiltersProps {
  availableTags: string[];
  availableTechnologies: string[];
  currentFilters: PhotoFiltersType;
  onFilterChange: (filters: Partial<PhotoFiltersType>) => void;
  onReset: () => void;
}

export default function PhotoFilters({
  availableTags,
  availableTechnologies,
  currentFilters,
  onFilterChange,
  onReset,
}: PhotoFiltersProps) {
  const [showTags, setShowTags] = useState(true);
  const [showTech, setShowTech] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
  const [selectedTech, setSelectedTech] = useState<string[]>(currentFilters.technologies || []);
  const [sortBy, setSortBy] = useState(currentFilters.sort || 'newest');
  const [minPrice, setMinPrice] = useState<string>(
  currentFilters.minPrice?.toString() || ''
);
  const [maxPrice, setMaxPrice] = useState<string>(
  currentFilters.maxPrice?.toString() || ''
);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange({ tags: newTags });
  };

  const handleTechToggle = (tech: string) => {
    const newTech = selectedTech.includes(tech)
      ? selectedTech.filter(t => t !== tech)
      : [...selectedTech, tech];
    setSelectedTech(newTech);
    onFilterChange({ technologies: newTech });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort as any);
    onFilterChange({ sort: sort as any });
  };

  const handlePriceApply = () => {
    onFilterChange({
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedTech.length > 0 || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <div className="bg-white border border-brown-200 rounded-xl p-5 sticky top-24 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-brown-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brown-600" />
          <h2 className="font-semibold text-brown-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-brown-500 hover:text-brown-700"
          >
            <X className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-brown-600 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brown-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="flex items-center justify-between w-full text-xs font-semibold text-brown-600 uppercase tracking-wider mb-2"
        >
          <span>Price Range</span>
          {showPrice ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showPrice && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 px-3 py-2 border border-brown-200 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 px-3 py-2 border border-brown-200 rounded-lg text-sm"
            />
            <button
              onClick={handlePriceApply}
              className="px-3 py-2 bg-brown-700 text-white text-xs rounded-lg hover:bg-brown-800"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setShowTags(!showTags)}
            className="flex items-center justify-between w-full text-xs font-semibold text-brown-600 uppercase tracking-wider mb-2"
          >
            <span>Tags ({availableTags.length})</span>
            {showTags ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showTags && (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-brown-700 text-white'
                      : 'bg-brown-50 text-brown-600 hover:bg-brown-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technologies */}
      {availableTechnologies.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setShowTech(!showTech)}
            className="flex items-center justify-between w-full text-xs font-semibold text-brown-600 uppercase tracking-wider mb-2"
          >
            <span>Technologies ({availableTechnologies.length})</span>
            {showTech ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showTech && (
            <div className="flex flex-wrap gap-2">
              {availableTechnologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleTechToggle(tech)}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    selectedTech.includes(tech)
                      ? 'bg-brown-700 text-white'
                      : 'bg-brown-50 text-brown-600 hover:bg-brown-100'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}