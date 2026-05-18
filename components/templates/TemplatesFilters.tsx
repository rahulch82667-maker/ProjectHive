'use client';

import { X, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface FilterState {
  search: string;
  category: string;
  tags: string[];
  technologies: string[];
  minPrice: number;
  maxPrice: number;
  isFeatured: boolean;
  sortBy: 'price' | 'rating' | 'salesCount' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

interface TemplatesFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

const categories = [
  'Business',
  'Portfolio',
  'E-commerce',
  'Blog',
  'Landing Page',
  'Dashboard',
  'Education',
  'Health',
  'Real Estate',
  'Restaurant',
  'Travel',
  'Other'
];

const technologies = [
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'HTML/CSS',
  'JavaScript',
  'TypeScript',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Chakra UI',
  'Styled Components',
  'SASS/SCSS',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Firebase',
  'Stripe',
  'PayPal'
];

const tags = [
  'Responsive',
  'Mobile-first',
  'Dark Mode',
  'Light Mode',
  'SEO Optimized',
  'Fast Loading',
  'Accessibility',
  'Multi-language',
  'Admin Panel',
  'User Dashboard',
  'Authentication',
  'Payment Integration',
  'API Ready',
  'Documentation',
  'Support',
  'Modern Design',
  'Clean Code',
  'Customizable'
];

export default function TemplatesFilters({ filters, onFilterChange, onReset }: TemplatesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ tags: newTags });
  };

  const handleTechnologyToggle = (tech: string) => {
    const newTechs = filters.technologies.includes(tech)
      ? filters.technologies.filter(t => t !== tech)
      : [...filters.technologies, tech];
    onFilterChange({ technologies: newTechs });
  };

  return (
    <div className="p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) || 0 })}
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) || 10000 })}
            className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Featured Only */}
      <div className="mb-6">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.isFeatured}
            onChange={(e) => onFilterChange({ isFeatured: e.target.checked })}
            className="rounded border-gray-300 text-gray-700 focus:ring-gray-500 h-4.5 w-4.5 transition-colors cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Featured templates only</span>
        </label>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Sort By</label>
        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all"
          >
            <option value="createdAt">Newest</option>
            <option value="updatedAt">Recently Updated</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="salesCount">Most Popular</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all text-center"
          >
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
      </div>

      {/* Technologies Filter */}
      <div className="mb-6 pt-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left group"
        >
          <span className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
            Technologies ({filters.technologies.length})
          </span>
          <span className={`transform transition-transform duration-200 text-gray-500 text-xs ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {isOpen && (
          <div className="mt-3 max-h-48 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              {technologies.map((tech) => (
                <label key={tech} className="flex items-center gap-2 text-xs cursor-pointer group py-0.5">
                  <input
                    type="checkbox"
                    checked={filters.technologies.includes(tech)}
                    onChange={() => handleTechnologyToggle(tech)}
                    className="rounded border-gray-300 text-gray-700 focus:ring-gray-500 transition-colors"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{tech}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags Filter */}
      <div className="pt-4">
        <label className="block text-sm font-bold text-gray-800 mb-2">Tags</label>
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-full font-medium shadow-sm transition-all"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <select
          onChange={(e) => {
            if (e.target.value && !filters.tags.includes(e.target.value)) {
              handleTagToggle(e.target.value);
            }
            e.target.value = '';
          }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900 text-sm shadow-sm transition-all"
        >
          <option value="">Add tag...</option>
          {tags.filter(tag => !filters.tags.includes(tag)).map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
    </div>
  );
}