'use client';

import { X, Filter, RotateCcw, ChevronDown } from 'lucide-react';
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
  'Business', 'Portfolio', 'E-commerce', 'Blog', 'Landing Page',
  'Dashboard', 'Education', 'Health', 'Real Estate', 'Restaurant', 'Travel', 'Other'
];

const technologies = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'HTML/CSS', 'JavaScript',
  'TypeScript', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI',
  'Styled Components', 'SASS/SCSS', 'Node.js', 'Express', 'MongoDB',
  'PostgreSQL', 'Firebase', 'Stripe', 'PayPal'
];

const tags = [
  'Responsive', 'Mobile-first', 'Dark Mode', 'Light Mode', 'SEO Optimized',
  'Fast Loading', 'Accessibility', 'Multi-language', 'Admin Panel',
  'User Dashboard', 'Authentication', 'Payment Integration', 'API Ready',
  'Documentation', 'Support', 'Modern Design', 'Clean Code', 'Customizable'
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

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.tags.length +
    filters.technologies.length +
    (filters.isFeatured ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice !== 10000 ? 1 : 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .filter-panel {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(62,39,35,0.08),
            0 4px 24px rgba(62,39,35,0.10),
            0 1px 3px rgba(62,39,35,0.06);
        }

        .filter-header {
          background: #3e2723;
          padding: 20px 22px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .filter-header::before {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }

        .filter-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 30px;
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%;
        }

        .filter-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-badge {
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
        }

        .filter-badge.active {
          background: #fff;
          color: #3e2723;
        }

        .reset-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }

        .reset-btn:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.1);
        }

        .filter-body {
          padding: 18px 20px 22px;
        }

        .filter-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f5f0ef;
        }

        .filter-section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .filter-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #a08080;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }

        .filter-select {
          width: 100%;
          border: 1.5px solid #ede0de;
          border-radius: 12px;
          padding: 9px 36px 9px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #3e2723;
          background: #fdf8f7;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e2723' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .filter-select:focus {
          border-color: #3e2723;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(62,39,35,0.08);
        }

        .price-row {
          display: flex;
          gap: 8px;
        }

        .price-input-wrap {
          flex: 1;
          position: relative;
        }

        .price-input-wrap::before {
          content: '$';
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #a08080;
          font-family: 'DM Sans', sans-serif;
          pointer-events: none;
        }

        .price-input {
          width: 100%;
          border: 1.5px solid #ede0de;
          border-radius: 12px;
          padding: 9px 10px 9px 22px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #3e2723;
          background: #fdf8f7;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .price-input::placeholder {
          color: #c4aaa8;
        }

        .price-input:focus {
          border-color: #3e2723;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(62,39,35,0.08);
        }

        .featured-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1.5px solid #ede0de;
          background: #fdf8f7;
          transition: all 0.2s ease;
        }

        .featured-toggle:hover {
          border-color: #3e2723;
          background: #fff;
        }

        .featured-toggle.checked {
          border-color: #3e2723;
          background: #3e2723;
        }

        .featured-toggle.checked .featured-label {
          color: #fff;
        }

        .featured-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid #c4aaa8;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .featured-toggle.checked .featured-checkbox {
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.2);
        }

        .featured-checkbox-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          background: #3e2723;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .featured-toggle.checked .featured-checkbox-dot {
          background: #fff;
          opacity: 1;
        }

        .featured-label {
          font-size: 13px;
          font-weight: 500;
          color: #5d3f3b;
          transition: color 0.2s ease;
          user-select: none;
        }

        .sort-row {
          display: flex;
          gap: 8px;
        }

        .sort-order-btn {
          width: 42px;
          flex-shrink: 0;
          border: 1.5px solid #ede0de;
          border-radius: 12px;
          background: #fdf8f7;
          color: #3e2723;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          outline: none;
        }

        .sort-order-btn:hover {
          border-color: #3e2723;
          background: #3e2723;
          color: #fff;
        }

        .tech-accordion-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
        }

        .tech-count-pill {
          background: #f5ede9;
          color: #3e2723;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 6px;
        }

        .tech-chevron {
          color: #a08080;
          transition: transform 0.25s ease;
        }

        .tech-chevron.open {
          transform: rotate(180deg);
        }

        .tech-grid {
          margin-top: 12px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .tech-grid.open {
          max-height: 220px;
          overflow-y: auto;
        }

        .tech-grid::-webkit-scrollbar {
          width: 3px;
        }

        .tech-grid::-webkit-scrollbar-track {
          background: #f5ede9;
          border-radius: 10px;
        }

        .tech-grid::-webkit-scrollbar-thumb {
          background: #c4aaa8;
          border-radius: 10px;
        }

        .tech-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          padding-right: 4px;
        }

        .tech-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 5px 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .tech-item:hover {
          background: #f5ede9;
        }

        .tech-item input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #3e2723;
          cursor: pointer;
          flex-shrink: 0;
        }

        .tech-name {
          font-size: 12.5px;
          color: #5d3f3b;
          font-family: 'DM Sans', sans-serif;
        }

        .tags-selected {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px 4px 11px;
          background: #3e2723;
          color: #fff;
          font-size: 11.5px;
          font-weight: 500;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
        }

        .tag-chip:hover {
          background: #5d3f3b;
        }

        .tag-remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          border: none;
          padding: 1px;
          border-radius: 50%;
          cursor: pointer;
          color: #fff;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }

        .tag-remove-btn:hover {
          background: rgba(255,255,255,0.4);
        }

        .label-with-count {
          display: flex;
          align-items: center;
        }
      `}</style>

      <div className="filter-panel sticky top-24">
        {/* Header */}
        <div className="filter-header">
          <div className="filter-title">
            <Filter size={16} strokeWidth={2.5} />
            Filters
            <span className={`filter-badge ${activeFilterCount > 0 ? 'active' : ''}`}>
              {activeFilterCount > 0 ? activeFilterCount : 'All'}
            </span>
          </div>
          <button className="reset-btn" onClick={onReset}>
            <RotateCcw size={11} strokeWidth={2.5} />
            Reset
          </button>
        </div>

        {/* Body */}
        <div className="filter-body">

          {/* Category */}
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <label className="filter-label">Price Range</label>
            <div className="price-row">
              <div className="price-input-wrap">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) || 0 })}
                  className="price-input"
                />
              </div>
              <div className="price-input-wrap">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) || 10000 })}
                  className="price-input"
                />
              </div>
            </div>
          </div>

          {/* Featured Only */}
          <div className="filter-section">
            <label className="filter-label">Visibility</label>
            <div
              className={`featured-toggle ${filters.isFeatured ? 'checked' : ''}`}
              onClick={() => onFilterChange({ isFeatured: !filters.isFeatured })}
            >
              <div className="featured-checkbox">
                <div className="featured-checkbox-dot" />
              </div>
              <span className="featured-label"> Featured templates only</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-section">
            <label className="filter-label">Sort By</label>
            <div className="sort-row">
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="filter-select"
                style={{ flex: 1 }}
              >
                <option value="createdAt">Newest</option>
                <option value="updatedAt">Recently Updated</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="salesCount">Most Popular</option>
              </select>
              <button
                className="sort-order-btn"
                onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Technologies */}
          <div className="filter-section">
            <button className="tech-accordion-btn" onClick={() => setIsOpen(!isOpen)}>
              <label className="filter-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                <span className="label-with-count">
                  Technologies
                  {filters.technologies.length > 0 && (
                    <span className="tech-count-pill">{filters.technologies.length}</span>
                  )}
                </span>
              </label>
              <ChevronDown size={14} className={`tech-chevron ${isOpen ? 'open' : ''}`} />
            </button>

            <div className={`tech-grid ${isOpen ? 'open' : ''}`}>
              <div className="tech-inner">
                {technologies.map((tech) => (
                  <label key={tech} className="tech-item">
                    <input
                      type="checkbox"
                      checked={filters.technologies.includes(tech)}
                      onChange={() => handleTechnologyToggle(tech)}
                    />
                    <span className="tech-name">{tech}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="filter-section">
            <label className="filter-label">
              <span className="label-with-count">
                Tags
                {filters.tags.length > 0 && (
                  <span className="tech-count-pill">{filters.tags.length}</span>
                )}
              </span>
            </label>

            {filters.tags.length > 0 && (
              <div className="tags-selected">
                {filters.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button
                      className="tag-remove-btn"
                      onClick={() => handleTagToggle(tag)}
                    >
                      <X size={9} strokeWidth={3} />
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
              className="filter-select"
            >
              <option value="">Add a tag...</option>
              {tags.filter(tag => !filters.tags.includes(tag)).map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </>
  );
}