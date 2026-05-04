/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Locations from './pages/Locations';
import Login from './pages/Login';
import Cart from './pages/Cart';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('uj_member'));

  useEffect(() => {
    // Check auth status periodically or listen to custom events if needed
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('uj_member'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-brand-muted">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        
        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 py-20">
          <div className="bg-brand-dark rounded-[2.5rem] p-12 md:p-16 text-white flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center font-bold text-xl">
                UJ
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">Uncle Joe's</span>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">© 2024 UNCLE JOE'S COFFEE SHOP</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </CartProvider>
  );
}
