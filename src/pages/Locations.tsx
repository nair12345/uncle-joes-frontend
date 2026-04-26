import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, ArrowRight, ExternalLink, Clock, ChevronDown } from 'lucide-react';
import { fetchLocations } from '../services/api';
import { Location } from '../types';

export default function Locations() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await fetchLocations();
        setAllLocations(data);
      } catch (err) {
        setError('Unable to fetch locations. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  const states = useMemo(() => {
    const s = new Set(allLocations.map(l => l.state));
    return ['All', ...Array.from(s).sort()];
  }, [allLocations]);

  const filteredLocations = useMemo(() => {
    return allLocations.filter(loc => {
      const city = (loc.city || '').toLowerCase();
      const term = citySearch.toLowerCase();
      
      const matchesCity = city.includes(term);
      const matchesState = selectedState === 'All' || loc.state === selectedState;
      
      return matchesCity && matchesState;
    });
  }, [allLocations, citySearch, selectedState]);

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return '';
    // Format "HHmm" to "HH:mm"
    if (timeStr.length === 4) {
      return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
    }
    return timeStr;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Syncing Locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-muted pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header Card */}
      <section className="max-w-7xl mx-auto py-12 md:py-16">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-black/5 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-none mb-6">
              FIND YOUR <br /> <span className="text-brand-primary">JOE'S.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-sm mb-12">
              With {allLocations.length || '485+'} locations across the country, a perfect cup of coffee is never far away.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by city..."
                  className="w-full bg-brand-muted border border-transparent focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-semibold"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select 
                  title="Filter by State"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-brand-muted pl-6 pr-12 py-4 rounded-2xl font-bold text-sm outline-none cursor-pointer border border-transparent focus:border-brand-primary/20 appearance-none min-w-[160px]"
                >
                  {states.map(state => (
                    <option key={state} value={state}>{state === 'All' ? 'All States' : state}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none">
            <MapPin size={600} />
          </div>
        </div>
      </section>

      {/* Locations List */}
      <div className="max-w-7xl mx-auto">
        <main>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-black/5">
              <p className="text-gray-400 font-bold">No locations found in this area.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredLocations.map((loc, idx) => (
                  <motion.div
                    key={`${loc.id}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col group"
                  >
                     <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col gap-2">
                          <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">
                             {loc.state} Hub
                          </div>
                          {!loc.open_for_business && (
                            <div className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">
                               Temporarily Closed
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition-colors">
                           <MapPin size={20} />
                        </div>
                     </div>

                    <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-primary transition-colors">
                      {loc.city}, {loc.state}
                    </h3>
                    
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                      {loc.address_one}
                      {loc.address_two && <><br />{loc.address_two}</>}
                      <br />{loc.city}, {loc.state} {loc.zip_code}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {loc.wifi && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-muted px-2 py-1 rounded text-gray-500">WiFi</span>
                      )}
                      {loc.drive_thru && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-muted px-2 py-1 rounded text-gray-500">Drive-Thru</span>
                      )}
                      {loc.door_dash && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-muted px-2 py-1 rounded text-gray-500">Delivery</span>
                      )}
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-xs font-bold text-gray-400 bg-brand-muted/50 p-3 rounded-xl">
                          <Clock size={14} />
                          <span>{loc.hours_monday_open ? `${formatTime(loc.hours_monday_open)} - ${formatTime(loc.hours_monday_close)}` : 'Hours vary by day'}</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
