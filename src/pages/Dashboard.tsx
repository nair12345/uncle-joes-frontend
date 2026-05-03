import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  ChevronRight, 
  Package, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { fetchMemberOrders, fetchMemberPoints } from '../services/api';
import { Order, Member } from '../types';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Member | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('uj_member');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadDashboardData(parsedUser.id);
    }
  }, []);

  async function loadDashboardData(memberId: string) {
    setLoading(true);
    try {
      const [ordersData, pointsData] = await Promise.all([
        fetchMemberOrders(memberId),
        fetchMemberPoints(memberId)
      ]);
      setOrders(ordersData);
      setPoints(pointsData.points);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load your reward data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="text-gray-500 font-medium">Preparing your rewards...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-display font-bold text-brand-dark mb-2">
            Hey, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500 text-lg">Here's what's happening with your rewards today.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Points & Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white h-full relative overflow-hidden shadow-2xl shadow-brand-dark/20">
            <div className="relative z-10">
              <div className="bg-brand-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="text-brand-primary w-6 h-6" />
              </div>
              <p className="text-brand-primary font-bold uppercase tracking-widest text-xs mb-2">Available Points</p>
              <h2 className="text-5xl font-display font-bold mb-6">{points.toLocaleString()}</h2>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-300">Next Reward Progress</span>
                    <span className="text-xs font-bold text-brand-primary">75%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="bg-brand-primary h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You're just <span className="text-white font-bold">125 points</span> away from a <span className="text-white font-bold">Free Classic Burger!</span>
                </p>
              </div>

              <button className="w-full bg-brand-primary text-brand-dark font-bold py-4 rounded-2xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                <span>Redeem Rewards</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Absolute decorative circle */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl"></div>
          </div>
        </motion.div>

        {/* Order History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-black/5 shadow-xl shadow-black/5 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-brand-muted p-3 rounded-2xl">
                  <Clock className="w-6 h-6 text-brand-dark" />
                </div>
                <h3 className="text-xl font-display font-bold text-brand-dark">Order History</h3>
              </div>
              <button className="text-brand-primary font-bold text-sm hover:underline flex items-center gap-1 group">
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-100 p-6 rounded-[1.5rem] flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <h4 className="font-bold text-red-800">Oops!</h4>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, idx) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (idx * 0.05) }}
                    className="group border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark leading-tight mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-brand-dark">${order.total.toFixed(2)}</p>
                        <button className="text-xs font-bold text-brand-primary mt-1 hover:underline">Re-order</button>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <p className="mt-3 text-xs text-gray-500 ml-18 italic truncate">
                        {order.items.join(', ')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="font-bold text-brand-dark">No orders yet</h4>
                <p className="text-sm text-gray-500 mt-2">When you place an order, it will show up here.</p>
                <button className="mt-6 font-bold text-brand-primary underline">Place your first order</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
