// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Filters from '../components/Filters';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Loader';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home({ onSelectProduct, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sort: 'newest',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.getProducts(filters);
      if (res && res.success) {
        setProducts(res.data || []);
      } else {
        setError(res.message || 'Failed to load products.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce search slightly to avoid excessive calls
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      search: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sort: 'newest',
    });
  };

  return (
    <div className="page-container home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Curated Lifestyle & Tech Collection</span>
          </div>
          <h1 className="hero-title">
            Discover Premium Products <br /> Crafted for Everyday Living
          </h1>
          <p className="hero-subtitle">
            Explore top-rated electronics, footwear, home essentials, and fitness gear with instant inventory checkout.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="catalog-layout">
        {/* Left Sidebar Filters */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* Right Product Grid Area */}
        <section className="catalog-main" aria-label="Product Catalog">
          {/* Loading Skeleton */}
          {loading && <ProductGridSkeleton count={6} />}

          {/* Error State */}
          {!loading && error && (
            <div className="state-card state-error">
              <AlertCircle size={44} className="state-icon text-danger" />
              <h3>Failed to load catalog</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn-primary flex-center gap-2 mt-4"
                onClick={fetchProducts}
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="state-card state-empty">
              <div className="empty-icon-wrap">🔍</div>
              <h3>No products matched your criteria</h3>
              <p>Try adjusting your search terms, changing categories, or clearing price filters.</p>
              <button
                type="button"
                className="btn-secondary mt-4"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Active Product Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
