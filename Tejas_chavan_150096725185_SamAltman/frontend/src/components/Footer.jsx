// src/components/Footer.jsx
import React from 'react';
import { Store, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-highlights">
        <div className="footer-container highlights-grid">
          <div className="highlight-item">
            <Truck size={24} className="highlight-icon" />
            <div>
              <h4>Free Express Delivery</h4>
              <p>On all orders above ₹999</p>
            </div>
          </div>
          <div className="highlight-item">
            <ShieldCheck size={24} className="highlight-icon" />
            <div>
              <h4>Secure Transactions</h4>
              <p>Stateful session authentication</p>
            </div>
          </div>
          <div className="highlight-item">
            <RotateCcw size={24} className="highlight-icon" />
            <div>
              <h4>Live Inventory</h4>
              <p>Real-time stock validation & updates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <div className="footer-brand">
            <div className="brand-icon-box small">
              <Store size={18} className="brand-icon" />
            </div>
            <span className="footer-brand-name">AURA Store</span>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} AURA E-Commerce API & Frontend. Built for excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
