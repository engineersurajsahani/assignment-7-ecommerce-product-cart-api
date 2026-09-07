// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage, formatPrice } from '../utils/productImages';
import { Spinner } from '../components/Loader';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBasket,
  ArrowLeft,
  Package,
} from 'lucide-react';

export default function Cart({ onNavigate }) {
  const { cart, loading, removeFromCart, updateQuantity, checkout } = useCart();
  const { isAuthenticated } = useAuth();

  const [checkingOut, setCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});

  if (!isAuthenticated) {
    return (
      <div className="page-container py-16">
        <div className="state-card state-auth-required">
          <div className="auth-icon-badge mx-auto">
            <ShoppingBag size={32} className="text-accent" />
          </div>
          <h2>Sign in to view your Cart</h2>
          <p>Your shopping cart is securely attached to your account. Log in to view or manage items.</p>
          <div className="flex-center gap-3 mt-6">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate('register')}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleQtyChange = async (productId, currentQty, delta) => {
    const nextQty = currentQty + delta;
    setActionInProgress((prev) => ({ ...prev, [productId]: true }));
    await updateQuantity(productId, nextQty);
    setActionInProgress((prev) => ({ ...prev, [productId]: false }));
  };

  const handleRemove = async (productId) => {
    setActionInProgress((prev) => ({ ...prev, [productId]: true }));
    await removeFromCart(productId);
    setActionInProgress((prev) => ({ ...prev, [productId]: false }));
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    const result = await checkout();
    setCheckingOut(false);

    if (result && result.success && result.order) {
      setCompletedOrder(result.order);
    }
  };

  // Render Order Confirmation Modal / Screen if checked out
  if (completedOrder) {
    return (
      <div className="page-container py-12">
        <div className="order-success-card">
          <div className="order-success-icon-wrap">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h1 className="order-success-title">Order Confirmed!</h1>
          <p className="order-success-subtitle">
            Thank you for shopping with AURA Store. Your items are being prepared for dispatch.
          </p>

          <div className="order-receipt">
            <div className="receipt-header">
              <div>
                <span className="receipt-label">Order Date</span>
                <strong>{new Date(completedOrder.placedAt).toLocaleString()}</strong>
              </div>
              <div className="text-right">
                <span className="receipt-label">Customer</span>
                <strong>{completedOrder.userId}</strong>
              </div>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-items-list">
              {completedOrder.items.map((item) => (
                <div key={item.productId} className="receipt-item-row">
                  <div className="receipt-item-info">
                    <span className="receipt-item-name">{item.name}</span>
                    <span className="receipt-item-qty">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                  </div>
                  <div className="receipt-item-total">
                    {formatPrice(item.itemTotal || item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-summary-row receipt-total-row">
              <span>Total Paid:</span>
              <span>{formatPrice(completedOrder.orderTotal)}</span>
            </div>
          </div>

          <div className="order-success-actions">
            <button
              type="button"
              className="btn-primary btn-large"
              onClick={() => {
                setCompletedOrder(null);
                onNavigate('home');
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const cartTotal = cart?.cartTotal || 0;
  const isCartEmpty = items.length === 0;

  return (
    <div className="page-container cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <span className="cart-item-count-pill">
          {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {loading && !items.length ? (
        <div className="py-16 flex-center">
          <Spinner size={36} text="Fetching your cart..." />
        </div>
      ) : isCartEmpty ? (
        <div className="state-card state-empty-cart">
          <div className="empty-cart-icon-box">
            <ShoppingBasket size={48} />
          </div>
          <h2>Your cart is currently empty</h2>
          <p>Looks like you haven&apos;t added any items yet. Explore our catalog and find what you love!</p>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => onNavigate('home')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-list">
              {items.map((item) => {
                const isWorking = actionInProgress[item.productId];
                const imageSrc = getProductImage({ id: item.productId, category: '' });

                return (
                  <article key={item.productId} className={`cart-item-card ${isWorking ? 'item-updating' : ''}`}>
                    <div className="cart-item-image-wrap">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </div>

                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <div className="cart-item-unit-price">
                        {formatPrice(item.unitPrice)} each
                      </div>

                      <div className="cart-item-actions-mobile">
                        <div className="qty-controls small">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(item.productId, item.quantity, -1)}
                            disabled={isWorking}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQtyChange(item.productId, item.quantity, 1)}
                            disabled={isWorking}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemove(item.productId)}
                          disabled={isWorking}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-desktop-qty">
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQtyChange(item.productId, item.quantity, -1)}
                          disabled={isWorking}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleQtyChange(item.productId, item.quantity, 1)}
                          disabled={isWorking}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total-col">
                      <span className="cart-item-line-total">
                        {formatPrice(item.itemTotal || item.unitPrice * item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="btn-remove-desktop"
                        onClick={() => handleRemove(item.productId)}
                        disabled={isWorking}
                        aria-label="Remove item from cart"
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-footer-actions">
              <button
                type="button"
                className="btn-secondary flex-center gap-2"
                onClick={() => onNavigate('home')}
              >
                <ArrowLeft size={16} /> Continue Browsing
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span className="text-success font-semibold">FREE</span>
              </div>

              <div className="summary-row">
                <span>Taxes</span>
                <span>Included</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row summary-total-row">
                <span>Order Total</span>
                <span className="summary-total-price">{formatPrice(cartTotal)}</span>
              </div>

              <button
                type="button"
                className="btn-primary btn-large w-full mt-6 btn-checkout"
                onClick={handleCheckout}
                disabled={checkingOut || isCartEmpty}
              >
                {checkingOut ? (
                  <span className="flex-center gap-2">
                    <Spinner size={18} text="" /> Processing Order...
                  </span>
                ) : (
                  <span className="flex-center gap-2">
                    Proceed to Checkout <ArrowRight size={18} />
                  </span>
                )}
              </button>

              <div className="summary-security-note">
                <ShieldCheck size={16} />
                <span>Encrypted checkout with live stock verification</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
