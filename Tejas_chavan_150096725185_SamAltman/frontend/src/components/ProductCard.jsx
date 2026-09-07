// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import RatingStars from './RatingStars';
import { getProductImage, formatPrice } from '../utils/productImages';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const imageSrc = getProductImage(product);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const result = await addToCart(product.id, 1);
    setAdding(false);

    if (result && result.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  return (
    <article
      className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}
      onClick={() => onSelectProduct && onSelectProduct(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelectProduct && onSelectProduct(product.id)}
    >
      <div className="product-card-image-wrap">
        <img
          src={imageSrc}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />

        {/* Category badge */}
        <span className="badge badge-category">{product.category}</span>

        {/* Stock status badge */}
        {isOutOfStock ? (
          <span className="badge badge-stock badge-out">Out of Stock</span>
        ) : isLowStock ? (
          <span className="badge badge-stock badge-low">Only {product.stock} left</span>
        ) : (
          <span className="badge badge-stock badge-in">In Stock</span>
        )}

        {/* Quick view hover button */}
        <div className="product-card-overlay">
          <button
            type="button"
            className="btn-quick-view"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct && onSelectProduct(product.id);
            }}
            aria-label="View product details"
          >
            <Eye size={16} /> View Details
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-meta">
          <RatingStars rating={product.rating} />
        </div>

        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="price-label">Price</span>
            <span className="product-price">{formatPrice(product.price)}</span>
          </div>

          <button
            type="button"
            className={`btn-add-cart ${justAdded ? 'btn-added' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : adding ? (
              'Adding...'
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag size={16} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
