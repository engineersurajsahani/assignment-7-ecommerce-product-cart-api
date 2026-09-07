// src/components/Navbar.jsx
import React, { useState } from 'react';
import { ShoppingBag, User, LogOut, Menu, X, Store, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ currentPage, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => handleNav('home')}>
          <div className="brand-icon-box">
            <Store size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">AURA</span>
            <span className="brand-sub">Store</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          <button
            type="button"
            className={`nav-link ${currentPage === 'home' || currentPage === 'details' ? 'nav-link-active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Products
          </button>
        </nav>

        {/* Desktop Action Items */}
        <div className="navbar-actions">
          {/* Cart Icon */}
          <button
            type="button"
            className={`btn-cart-nav ${currentPage === 'cart' ? 'btn-cart-nav-active' : ''}`}
            onClick={() => handleNav('cart')}
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag size={20} />
            <span className="cart-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-greeting">
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <span className="user-name">{user?.username || 'User'}</span>
              </div>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                type="button"
                className={`btn-nav-auth btn-nav-login ${currentPage === 'login' ? 'btn-nav-active' : ''}`}
                onClick={() => handleNav('login')}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`btn-nav-auth btn-nav-register ${currentPage === 'register' ? 'btn-nav-active' : ''}`}
                onClick={() => handleNav('register')}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="btn-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button
            type="button"
            className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Browse Products
          </button>

          <button
            type="button"
            className={`mobile-nav-link ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={() => handleNav('cart')}
          >
            <div className="flex-center gap-2">
              <ShoppingBag size={18} />
              <span>Cart ({cartCount})</span>
            </div>
          </button>

          <hr className="mobile-divider" />

          {isAuthenticated ? (
            <div className="mobile-user-box">
              <div className="mobile-user-info">
                <User size={18} />
                <span>Signed in as <strong>{user?.username}</strong></span>
              </div>
              <button
                type="button"
                className="btn-mobile-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-grid">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => handleNav('login')}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => handleNav('register')}
              >
                <UserPlus size={16} /> Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
