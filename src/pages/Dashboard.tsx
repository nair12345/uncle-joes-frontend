import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { fetchMemberOrders, fetchMemberPoints, createOrder, fetchMenu } from '../services/api';
import { Order, Member, MenuItem } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Member | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const [isBigQueryError, setIsBigQueryError] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('uj_member');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Stored member object:', parsedUser);
        setUser(parsedUser);
        if (parsedUser.id || parsedUser.member_id) {
          loadDashboardData(parsedUser.id || parsedUser.member_id);
        } else {
          console.error("User found in storage but has no ID");
          setError("Session invalid. Please sign out and in again.");
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to parse user from storage", e);
        setError("Session error. Please sign in again.");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function loadDashboardData(memberId: string) {
    console.log('Member ID used:', memberId);
    if (!memberId) {
      console.error("No member ID provided to loadDashboardData");
      setError("Unable to identify account. Please try signing out and in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setIsBigQueryError(false);
    try {
      const [ordersData, pointsData, menuData] = await Promise.all([
        fetchMemberOrders(memberId),
        fetchMemberPoints(memberId),
        fetchMenu()
      ]);
      console.log('Dashboard data loaded. Points:', pointsData);
      setOrders(ordersData);
      setPoints(pointsData);
      setMenu(menuData);

      // Sync updated points to localStorage and other components
      const savedUserString = localStorage.getItem('uj_member');
      if (savedUserString) {
        const parsed = JSON.parse(savedUserString);
        console.log('Updating localStorage points from', parsed.points, 'to', pointsData);
        const updated = { ...parsed, points: pointsData };
        localStorage.setItem('uj_member', JSON.stringify(updated));
        setUser(updated);
        // Trigger event for Navbar to update
        window.dispatchEvent(new Event('uj_user_updated'));
      }
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      const msg = err.message || "";
      if (msg.includes('BigQuery') || msg.includes('403') || msg.includes('permission')) {
        setIsBigQueryError(true);
      }
      setError(err.message || "Failed to load your reward data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleReorder = async (order: Order) => {
    if (!user) return;
    setReorderingId(order.id);
    
    try {
      const memberId = user.id || (user as any).member_id;
      if (!memberId) throw new Error("Member ID is missing");

      // Try to find the item IDs from names
      const orderItems = order.items.map(itemName => {
        const menuItem = menu.find(m => m.name === itemName);
        if (menuItem) {
          return {
            menu_item_id: menuItem.id || menuItem.item_id || (menuItem as any).menu_item_id || "",
            quantity: 1,
            price: menuItem.price || 0,
            size: menuItem.size || "Regular"
          };
        }
        return null;
      }).filter((item): item is any => item !== null && item.menu_item_id !== "");

      if (orderItems.length === 0) {
        throw new Error("Could not find items to reorder in current menu");
      }

      await createOrder({
        member_id: memberId,
        store_id: "10371d88-a490-4ad3-b895-de195a5025d5",
        items: orderItems
      });

      // Refresh data
      loadDashboardData(memberId);
      alert("Re-order placed successfully!");
    } catch (err: any) {
      console.error("Reorder error:", err);
      alert(`Re-order failed: ${err.message}`);
    } finally {
      setReorderingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="text-gray-500 font-medium">Preparing your rewards...</p>
      </div>
    );
  }

  const nextRewardThreshold = 500;
  const progress = Math.min(Math.round((points / nextRewardThreshold) * 100), 100);
  const pointsRemaining = Math.max(nextRewardThreshold - points, 0);

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
                    <span className="text-xs font-bold text-brand-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="bg-brand-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {pointsRemaining > 0 ? (
                    <>You're just <span className="text-white font-bold">{pointsRemaining} points</span> away from a <span className="text-white font-bold">Free Coffee!</span></>
                  ) : (
                    <>You have enough points for a <span className="text-white font-bold">Free Coffee!</span> Claim it now.</>
                  )}
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
            </div>

            {error ? (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-6 rounded-[1.5rem] flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-800">Connection Error</h4>
                    <pre className="text-red-600 text-[10px] mt-2 whitespace-pre-wrap font-mono bg-white/50 p-3 rounded-lg border border-red-100 uppercase tracking-tighter">
                      {error}
                    </pre>
                  </div>
                </div>

                {isBigQueryError && (
                  <div className="bg-brand-muted p-8 rounded-[2rem] border-2 border-brand-primary/20">
                    <h4 className="text-xl font-bold text-brand-dark mb-4">Fix Connection Issue</h4>
                    <ul className="space-y-4 text-sm text-gray-700">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 bg-brand-primary text-brand-dark rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <p>Open <b>Google Cloud Console</b> IAM & Admin.</p>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 bg-brand-primary text-brand-dark rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <p>Grant <b>'BigQuery Data Editor'</b> AND <b>'BigQuery User'</b> roles.</p>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 bg-brand-primary text-brand-dark rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <p>Target Principal: <code className="bg-white px-2 py-1 rounded-md border border-gray-200 font-mono text-[11px] font-bold">374670707835-compute@developer.gserviceaccount.com</code></p>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 bg-brand-primary text-brand-dark rounded-full flex items-center justify-center font-bold text-xs shrink-0">4</span>
                        <p>Project ID must be: <code className="bg-white px-2 py-1 rounded-md border border-gray-200 font-mono text-[11px] font-bold">mgmt-545-coffee-shop-project</code></p>
                      </li>
                    </ul>
                    <button 
                      onClick={() => user && loadDashboardData(user.id)}
                      className="mt-8 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Refresh Connection
                    </button>
                  </div>
                )}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, idx) => (
                  <motion.div 
                    key={order.id || `order-${idx}`}
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
                          <p className="font-bold text-brand-dark leading-tight mb-1">Order #{(order.id || '......').slice(-6).toUpperCase()}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {order.date ? new Date(order.date).toLocaleDateString() : 'Recent'}
                            </span>
                            <span>•</span>
                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-brand-dark">${(order.total || 0).toFixed(2)}</p>
                        <button 
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.id}
                          className="text-xs font-bold text-brand-primary mt-1 hover:underline disabled:opacity-50"
                        >
                          {reorderingId === order.id ? 'Loading...' : 'Re-order'}
                        </button>
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
                
                <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 max-w-lg mx-auto text-left">
                  <h5 className="text-amber-800 font-bold flex items-center gap-2 mb-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Not seeing your data?
                  </h5>
                  <p className="text-amber-700 text-xs leading-relaxed mb-4">
                    If you've already placed orders or expect to see points, BigQuery permissions might still be propagating or misconfigured.
                  </p>
                  <ul className="text-amber-700 text-[10px] space-y-1 mb-4 list-disc pl-4">
                    <li>Grant <strong>'BigQuery Data Editor'</strong> AND <strong>'BigQuery User'</strong> roles.</li>
                    <li>Ensure role is granted to: <code className="bg-amber-100 px-1 rounded text-[9px]">374670707835-compute@developer.gserviceaccount.com</code></li>
                    <li>Verify you are in project: <strong>'mgmt-545-coffee-shop-project'</strong></li>
                  </ul>
                  <button 
                    onClick={() => user && loadDashboardData(user.id)}
                    className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    Click here to re-check connection
                  </button>
                </div>

                <button 
                  onClick={() => navigate('/menu')}
                  className="mt-8 bg-brand-primary text-brand-dark px-8 py-3 rounded-full font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                >
                  Place your first order
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
