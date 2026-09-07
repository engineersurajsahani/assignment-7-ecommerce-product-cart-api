// src/components/Filters.jsx
import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Footwear',
  'Home & Kitchen',
  'Sports & Fitness',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'rating_asc', label: 'Lowest Rated' },
];

export default function Filters({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) {
  const hasActiveFilters =
    (filters.category && filters.category !== 'All') ||
    filters.search ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.sort !== 'newest';

  return (
    <aside className="filters-container">
      {/* Header */}
      <div className="filters-header">
        <div className="filters-title">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="search-input">
          Search Products
        </label>
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            id="search-input"
            type="text"
            className="form-input search-input"
            placeholder="Search headphones, shoes..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <div className="category-chips">
          {CATEGORIES.map((cat) => {
            const isSelected =
              (cat === 'All' && (!filters.category || filters.category === 'All')) ||
              filters.category === cat;

            return (
              <button
                key={cat}
                type="button"
                className={`category-chip ${isSelected ? 'category-chip-active' : ''}`}
                onClick={() => onFilterChange('category', cat)}
              >
                {isSelected && <Check size={14} className="chip-check-icon" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label className="filter-label">Price Range (₹)</label>
        <div className="price-inputs-row">
          <div className="price-field">
            <span className="price-currency">₹</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              className="form-input price-input"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
            />
          </div>
          <span className="price-separator">to</span>
          <div className="price-field">
            <span className="price-currency">₹</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              className="form-input price-input"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="filter-group">
        <label className="switch-label">
          <input
            type="checkbox"
            className="switch-input"
            checked={!!filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
          />
          <span className="switch-slider"></span>
          <span className="switch-text">In Stock Only</span>
        </label>
      </div>

      {/* Sort By Dropdown */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="sort-select">
          Sort By
        </label>
        <select
          id="sort-select"
          className="form-select"
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count Footer */}
      {totalResults !== undefined && (
        <div className="filters-results-count">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
        </div>
      )}
    </aside>
  );
}
