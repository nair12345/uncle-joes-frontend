/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Locations from './pages/Locations';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-muted">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/locations" element={<Locations />} />
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
  );
}
