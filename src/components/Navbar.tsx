import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu as MenuIcon, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Locations', path: '/locations' },
  ];

  return (
    <header className="sticky top-0 z-50 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white px-6 py-3 rounded-2xl shadow-sm border border-black/5 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
            UJ
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-brand-dark">
            Joe's
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-brand-muted/50 p-1 rounded-xl border border-black/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isActive ? 'text-brand-dark shadow-sm bg-white' : 'text-gray-500 hover:text-brand-dark'
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 text-brand-dark">
            <MenuIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
