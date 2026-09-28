import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { Category, ProductStatus } from '../../types/product';
import type { ProductFiltersState } from '../../types/api';

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onChange: React.Dispatch<React.SetStateAction<ProductFiltersState>>;
  totalCount: number;
  filteredCount: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  totalCount,
  filteredCount,
}) => {
  const categories: Array<'ALL' | Category> = ['ALL', 'ELECTRONICS', 'APPAREL', 'HOME'];
  const statuses: Array<'ALL' | ProductStatus> = [
    'ALL',
    'ACTIVE',
    'PRICE_REVIEW_PENDING',
    'OUT_OF_STOCK',
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleCategoryChange = (cat: 'ALL' | Category) => {
    onChange((prev) => ({ ...prev, category: cat }));
  };

  const handleStatusChange = (status: 'ALL' | ProductStatus) => {
    onChange((prev) => ({ ...prev, status }));
  };

  const handleClearFilters = () => {
    onChange({ category: 'ALL', status: 'ALL', searchQuery: '' });
  };

  const hasActiveFilters =
    filters.category !== 'ALL' || filters.status !== 'ALL' || filters.searchQuery.trim() !== '';

  return (
    <div className="product-filters-box" role="search" aria-label="Catalog Filters">
      {/* Top row: Search and count */}
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by SKU or Product Name..."
            className="filter-search-input mono"
            aria-label="Search catalog products"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, searchQuery: '' }))}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="filters-count-label mono">
          <span>Showing {filteredCount} of {totalCount} SKUs</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="clear-filters-link mono"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Pill segmented filters */}
      <div className="filters-bottom-row">
        {/* Category Pills */}
        <div className="filter-group">
          <span className="filter-group-title mono">
            <SlidersHorizontal size={11} />
            <span>Category:</span>
          </span>
          <div className="filter-pill-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`filter-chip mono ${filters.category === cat ? 'active' : ''}`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Pills */}
        <div className="filter-group">
          <span className="filter-group-title mono">Status:</span>
          <div className="filter-pill-list">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`filter-chip mono ${filters.status === st ? 'active' : ''}`}
              >
                {st === 'ALL'
                  ? 'All Statuses'
                  : st === 'PRICE_REVIEW_PENDING'
                  ? 'Review Pending'
                  : st === 'OUT_OF_STOCK'
                  ? 'Out of Stock'
                  : 'Active'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
