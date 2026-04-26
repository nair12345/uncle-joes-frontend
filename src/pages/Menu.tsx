import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Search, ChevronRight, Info, Plus } from 'lucide-react';
import { fetchMenu } from '../services/api';
import { MenuItem, MenuCategory } from '../types';

export default function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await fetchMenu();
        const grouped = items.reduce((acc: { [key: string]: MenuItem[] }, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {});

        const categoryList = Object.entries(grouped).map(([category, items]) => ({
          category,
          items,
        }));

        setCategories(categoryList);
      } catch (err) {
        setError('Failed to load the menu. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const filteredCategories = categories.map((cat, catIdx) => ({
    ...cat,
    id: `cat-${catIdx}`,
    items: cat.items.filter(item => 
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.item_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => {
    const hasItems = cat.items.length > 0;
    const matchesCategory = activeCategory === 'All' || cat.category === activeCategory;
    return hasItems && matchesCategory;
  });

  const categoryNames = useMemo(() => {
    const names = ['All', ...Array.from(new Set(categories.map(c => c.category)))];
    const teaIdx = names.indexOf('Tea');
    const otherIdx = names.indexOf('Other');
    if (teaIdx !== -1 && otherIdx !== -1) {
      const result = [...names];
      result[teaIdx] = names[otherIdx];
      result[otherIdx] = names[teaIdx];
      return result;
    }
    return names;
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-muted p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-muted pb-24">
      {/* Search & Categories Bar */}
      <div className="sticky top-20 z-40 bg-brand-muted/80 backdrop-blur-md py-4 mb-12">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by item name or category..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar justify-center">
            {categoryNames.map(name => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === name 
                    ? 'bg-brand-dark text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-brand-dark/5'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-black/5">
            <p className="text-gray-400 font-bold">No results found.</p>
          </div>
        ) : (
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat) => (
                <motion.section
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span className="w-2 h-8 bg-brand-primary rounded-full" />
                    {cat.category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.items.map((item, itemIdx) => (
                      <motion.div
                        key={`${item.id}-${itemIdx}`}
                        layout
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary mb-2 block">{item.category}</span>
                             <span className="text-lg font-bold text-brand-dark">
                               ${item.price.toFixed(2)}
                             </span>
                          </div>
                          <h3 className="text-xl font-bold leading-tight group-hover:text-brand-primary transition-colors mb-4">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex gap-3">
                            <span className="bg-brand-muted px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-gray-400">
                              {item.size}
                            </span>
                            <span className="bg-brand-muted px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                              <Info size={10} /> {item.calories} Cal
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
