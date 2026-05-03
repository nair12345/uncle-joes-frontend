import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu as MenuIcon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Member } from '../types';

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<Member | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('uj_member');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uj_member');
    localStorage.removeItem('uj_token');
    setUser(null);
    window.location.reload();
  };

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
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rewards</p>
                <p className="text-sm font-bold text-brand-primary leading-none">{user.points || 0} pts</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-brand-muted px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors group"
                title="Logout"
              >
                <User size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-brand-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Sign In
            </Link>
          )}
          <button className="md:hidden p-2 text-brand-dark">
            <MenuIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
