// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [previousPage, setPreviousPage] = useState('home');

  const navigateTo = (page, params = {}) => {
    if (page === 'details' && params.productId) {
      setSelectedProductId(params.productId);
    }
    if (page === 'login' || page === 'register') {
      // Remember where the user came from
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      <main className="main-content">
        {currentPage === 'home' && (
          <Home
            onSelectProduct={handleSelectProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'details' && (
          <ProductDetails
            productId={selectedProductId}
            onBack={() => navigateTo('home')}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'cart' && (
          <Cart onNavigate={navigateTo} />
        )}

        {currentPage === 'login' && (
          <Login
            onNavigate={navigateTo}
            returnPage={previousPage === 'login' || previousPage === 'register' ? 'home' : previousPage}
          />
        )}

        {currentPage === 'register' && (
          <Register onNavigate={navigateTo} />
        )}
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
