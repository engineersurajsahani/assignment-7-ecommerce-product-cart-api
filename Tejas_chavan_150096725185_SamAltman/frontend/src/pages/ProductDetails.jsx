// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import { Spinner } from '../components/Loader';
import { getProductImage, formatPrice } from '../utils/productImages';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, AlertCircle, PackageCheck } from 'lucide-react';

export default function ProductDetails({ productId, onBack, onNavigate }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProductById(productId);
        if (res && res.success && res.data) {
          setProduct(res.data);
          setQuantity(res.data.stock > 0 ? 1 : 0);
        } else {
          setError(res.message || 'Product not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const nextVal = quantity + delta;
    if (nextVal >= 1 && nextVal <= product.stock) {
      setQuantity(nextVal);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || adding) return;

    setAdding(true);
    const result = await addToCart(product.id, quantity);
    setAdding(false);

    if (result && result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center py-20">
        <Spinner size={36} text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container py-12">
        <button type="button" className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
        <div className="state-card state-error mt-6">
          <AlertCircle size={44} className="state-icon text-danger" />
          <h3>Product Not Found</h3>
          <p>{error || 'The requested product could not be located.'}</p>
          <button type="button" className="btn-primary mt-4" onClick={onBack}>
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const imageSrc = getProductImage(product);

  return (
    <div className="page-container product-details-page">
      {/* Breadcrumb / Back button */}
      <div className="details-header-nav">
        <button type="button" className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Products
        </button>
        <span className="details-breadcrumb">
          Catalog / {product.category} / <strong>{product.name}</strong>
        </span>
      </div>

      <div className="details-layout">
        {/* Left Column: Product Image */}
        <div className="details-gallery">
          <div className="details-image-card">
            <img
              src={imageSrc}
              alt={product.name}
              className="details-main-image"
            />
            {isOutOfStock && (
              <div className="details-sold-out-overlay">
                <span>Sold Out</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="details-info-pane">
          <div className="details-category-tag">{product.category}</div>
          <h1 className="details-title">{product.name}</h1>

          {/* Rating */}
          <div className="details-rating-row">
            <RatingStars rating={product.rating} showNumber={true} />
            <span className="details-rating-text">Verified Product Rating</span>
          </div>

          <hr className="details-divider" />

          {/* Price */}
          <div className="details-price-row">
            <span className="details-price">{formatPrice(product.price)}</span>
            <span className="details-tax-note">Inclusive of all taxes</span>
          </div>

          {/* Stock Meter */}
          <div className="details-stock-row">
            <span className="stock-label">Availability:</span>
            {isOutOfStock ? (
              <span className="stock-status stock-out">
                <AlertCircle size={16} /> Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="stock-status stock-low">
                <PackageCheck size={16} /> Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="stock-status stock-in">
                <PackageCheck size={16} /> In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Quantity and Add to Cart Section */}
          {!isOutOfStock ? (
            <div className="details-actions-box">
              <div className="quantity-selector-group">
                <label className="qty-label" htmlFor="qty-input">Quantity:</label>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="max-limit-hint">Max: {product.stock}</span>
              </div>

              <div className="details-cta-row">
                <button
                  type="button"
                  className={`btn-primary btn-large w-full ${addedSuccess ? 'btn-success-state' : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={20} /> Added to Cart!
                    </>
                  ) : adding ? (
                    'Adding to Cart...'
                  ) : (
                    <>
                      <ShoppingBag size={20} /> Add to Cart (₹{(product.price * quantity).toLocaleString('en-IN')})
                    </>
                  )}
                </button>
                
                {addedSuccess && (
                  <button
                    type="button"
                    className="btn-secondary btn-large w-full mt-2"
                    onClick={() => onNavigate('cart')}
                  >
                    Go to Cart →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="details-out-of-stock-alert">
              <AlertCircle size={20} />
              <div>
                <strong>Currently Unavailable</strong>
                <p>This item is currently sold out. Please check back later.</p>
              </div>
            </div>
          )}

          {/* Value Props */}
          <div className="details-guarantees">
            <div className="guarantee-item">
              <Truck size={18} className="guarantee-icon" />
              <span>Standard delivery within 2-4 business days</span>
            </div>
            <div className="guarantee-item">
              <ShieldCheck size={18} className="guarantee-icon" />
              <span>Genuine verified product with warranty</span>
            </div>
            <div className="guarantee-item">
              <RefreshCw size={18} className="guarantee-icon" />
              <span>7-day easy returns & exchange policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
