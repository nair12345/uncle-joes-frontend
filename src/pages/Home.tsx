import { motion } from 'motion/react';
import { ArrowRight, MapPin, Coffee, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        {/* Main Hero Card - Bento 1 */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-12 border border-black/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8"
            >
              <Heart size={14} className="fill-brand-primary" />
              Trusted Since 1984
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight mb-8">
              A Better Way <br /> To <span className="text-brand-primary">Coffee.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed mb-10">
              Artisan beans, roasted to perfection. From your morning espresso to our signature cold brews, we take coffee seriously.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
              >
                View Menu <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:block opacity-10 group-hover:opacity-20 transition-opacity translate-x-12 translate-y-12">
             <Coffee size={400} />
          </div>
        </div>

        {/* Highlight Image Card - Bento 2 */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-brand-dark rounded-[2.5rem] overflow-hidden relative group">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop"
            alt="Handcrafted Latte"
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <h3 className="text-white text-3xl font-bold mb-2">Handcrafted Latte</h3>
            <p className="text-white/60 text-sm">Rich espresso and silky steamed milk, poured with love.</p>
          </div>
        </div>

        {/* Info Card 1 - Bento 3 */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-black/5">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-12">
            <Clock size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Roasted Daily</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            We source only the finest single-origin beans, roasted small-batch to ensure maximum flavor in every cup.
          </p>
        </div>

        {/* Map Card - Bento 4 */}
        <div className="col-span-12 lg:col-span-5 bg-brand-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-4xl font-bold mb-4">485+ Locations</h3>
              <p className="text-white/80 max-w-xs mb-8">With our growing network, the perfect cup of coffee is always within reach.</p>
            </div>
            <Link
              to="/locations"
              className="bg-white text-brand-primary w-fit px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
            >
              Find Nearest <MapPin size={18} />
            </Link>
          </div>
          <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <MapPin size={240} />
          </div>
        </div>

        {/* Small Stat Card - Bento 5 */}
        <div className="col-span-6 lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-black/5 flex flex-col items-center justify-center text-center">
            <span className="text-6xl font-bold text-brand-dark mb-2">100%</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Arabica Beans</span>
        </div>

      </div>
    </div>
  );
}
