// src/components/Loader.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24, text = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <Loader2 size={size} className="animate-spin text-accent" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton-image skeleton-pulse"></div>
      <div className="product-card-body">
        <div className="skeleton-line skeleton-category skeleton-pulse"></div>
        <div className="skeleton-line skeleton-title skeleton-pulse"></div>
        <div className="skeleton-line skeleton-rating skeleton-pulse"></div>
        <div className="skeleton-footer">
          <div className="skeleton-line skeleton-price skeleton-pulse"></div>
          <div className="skeleton-btn skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
