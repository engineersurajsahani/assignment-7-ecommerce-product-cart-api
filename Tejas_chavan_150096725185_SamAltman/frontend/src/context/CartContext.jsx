// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], cartTotal: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, invalidateSession } = useAuth();
  const { error: toastError, success: toastSuccess, warning: toastWarning } = useToast();

  const handleAuthExpiration = useCallback(() => {
    setCart({ items: [], cartTotal: 0 });
    invalidateSession();
    toastWarning('Session expired. Please sign in to continue.');
  }, [invalidateSession, toastWarning]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], cartTotal: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res && res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      if (err.status === 401) {
        handleAuthExpiration();
      } else {
        console.error('Failed to fetch cart:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleAuthExpiration]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toastError('Please log in to add items to your cart.');
      return { success: false, requireAuth: true };
    }

    try {
      const res = await api.addToCart(productId, quantity);
      if (res && res.success && res.data) {
        setCart(res.data);
        toastSuccess(res.message || 'Item added to cart!');
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Could not add item.' };
    } catch (err) {
      if (err.status === 401) {
        handleAuthExpiration();
        return { success: false, requireAuth: true };
      }
      const msg = err.data?.message || err.message || 'Failed to add item to cart.';
      toastError(msg);
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return { success: false };

    try {
      const res = await api.removeFromCart(productId);
      if (res && res.success && res.data) {
        setCart(res.data);
        toastSuccess('Item removed from cart.');
        return { success: true, data: res.data };
      }
      return { success: false };
    } catch (err) {
      if (err.status === 401) {
        handleAuthExpiration();
        return { success: false };
      }
      const msg = err.data?.message || err.message || 'Failed to remove item.';
      toastError(msg);
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, targetQuantity) => {
    if (!isAuthenticated) return { success: false };
    
    // Find item to calculate delta
    const currentItem = cart.items.find((i) => i.productId === productId);
    if (!currentItem) return { success: false };

    const delta = targetQuantity - currentItem.quantity;
    if (delta === 0) return { success: true };

    if (targetQuantity <= 0) {
      return removeFromCart(productId);
    }

    if (delta > 0) {
      return addToCart(productId, delta);
    } else {
      // Backend doesn't have a direct decrement endpoint, so we remove and re-add or handle via addItem with delta
      // Note: backend addItem does: const requestedTotalQty = alreadyInCart + qty; (where qty must be > 0)
      // Since backend removeItem drops the item completely, we can remove and re-add targetQuantity!
      try {
        await api.removeFromCart(productId);
        const res = await api.addToCart(productId, targetQuantity);
        if (res && res.success && res.data) {
          setCart(res.data);
          return { success: true, data: res.data };
        }
      } catch (err) {
        const msg = err.data?.message || err.message || 'Failed to update quantity.';
        toastError(msg);
        fetchCart(); // sync back
        return { success: false, message: msg };
      }
    }
  };

  const checkout = async () => {
    if (!isAuthenticated) {
      toastError('Please log in to checkout.');
      return { success: false, requireAuth: true };
    }

    try {
      const res = await api.checkout();
      if (res && res.success && res.data) {
        setCart({ items: [], cartTotal: 0 });
        toastSuccess('Order placed successfully! 🎉');
        return { success: true, order: res.data };
      }
      return { success: false, message: res.message || 'Checkout failed.' };
    } catch (err) {
      if (err.status === 401) {
        handleAuthExpiration();
        return { success: false, requireAuth: true };
      }
      const msg = err.data?.message || err.message || 'Checkout failed.';
      toastError(msg);
      // Re-sync cart to update any stock inconsistencies
      fetchCart();
      return { success: false, message: msg };
    }
  };

  const cartCount = useMemo(() => {
    if (!cart || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
